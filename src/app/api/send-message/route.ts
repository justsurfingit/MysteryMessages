import userModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { message } from "@/model/User";
export async function POST(request: Request) {
  try {
    const { username, message } = await request.json();
    if (!username || !message) {
      return Response.json(
        {
          success: false,
          message: "Username and message both are required fields.",
        },
        {
          status: 404,
        }
      );
    }
    await dbConnect();
    const user = await userModel.findOne({
      username: username,
      isVerified: true,
      isAccepting: true,
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User does not exits or is currently not accepting Messages",
        },
        {
          status: 404,
        }
      );
    }
    const neomessage = {
      content: message,
      createdAt: new Date(),
    };
    user.messages.push(neomessage as message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message send successfully",
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
