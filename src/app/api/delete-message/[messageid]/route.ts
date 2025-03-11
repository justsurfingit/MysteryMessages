// route for deleting the message

import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { NextOptions } from "../../auth/[...nextauth]/options";
import NextAuth, { getServerSession } from "next-auth";
import { useParams } from "next/navigation";
import { Session } from "inspector/promises";

// but only for those who are authenticated
export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  const session = await getServerSession(NextOptions);
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
  const sessionUser = session.user;

  if (!messageId) {
    return Response.json(
      {
        success: false,
        message: "MessageID is a required parameter",
      },
      {
        status: 404,
      }
    );
  }
  try {
    await dbConnect();
    const updateResult = await userModel.updateOne(
      { _id: sessionUser.id },
      { $pull: { messages: { _id: messageId } } }
    );
    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }
    return Response.json(
      { message: "Message deleted Succesfully", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error deleting message,", err);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 }
    );
  }
  // now okay we have a user and now we will check whether the message to be deleted is his message or not
}
