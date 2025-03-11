import userModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(NextOptions);
  //   console.log(session);
  if (!session || !session?.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authorized. Please Login.",
      },
      {
        status: 404,
      }
    );
  }
  try {
    await dbConnect();
    const id = new mongoose.Types.ObjectId(session.user.id);

    const user = await userModel.aggregate([
      { $match: { _id: id } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "message Fetched successfully",
        messages: user[0]?.messages || [],
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
