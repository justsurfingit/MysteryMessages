import userModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  // this will return the current status of the accpeting Messages field
  const session = await getServerSession(NextOptions);
  if (!session || !session.user) {
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
  const cur = session.user;
  await dbConnect();
  const user = await userModel.findById(cur.id);
  if (!user) {
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
  return Response.json(
    {
      success: true,
      message: user.isAccepting,
    },
    {
      status: 200,
    }
  );
}
export async function POST(request: Request) {
  const session = await getServerSession(NextOptions);
  console.log("this is here", session);

  if (!session || !session.user) {
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
    const user = session.user;
    const id = user.id;
    const { acceptingMessage } = await request.json();
    console.log(acceptingMessage);
    await dbConnect();
    const findUser = await userModel.findById(id);
    if (!findUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }
    findUser.isAccepting = acceptingMessage;
    await findUser.save();
    return Response.json(
      {
        success: true,
        message: "Message setting have been updated successfully",
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
        message: "Something went wrong please try again later",
      },
      {
        status: 500,
      }
    );
  }
}
