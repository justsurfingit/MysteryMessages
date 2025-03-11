import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { isValid } from "zod";
// now let's just verify it
export async function POST(request: Request) {
  console.log("called\n");
  const { username, verificationCode } = await request.json();
  console.log(username, verificationCode);
  try {
    await dbConnect();
    const user = await userModel.findOne({ username: username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user does not exist",
        },
        { status: 200 }
      );
    }
    const originalCode = user.verificationCode;
    const isCodeCorrect = originalCode === verificationCode;
    const cur = new Date();
    const limit = user.verificationCodeExpiry;
    const isStillValid = limit > cur;
    if (isCodeCorrect && isStillValid) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User is successfully Verified",
        },
        { status: 200 }
      );
    }
    if (!isStillValid) {
      return Response.json(
        {
          success: false,
          message:
            "Verification Code is expired, Please signup again to generate new code.",
        },

        { status: 200 }
      );
    }
    return Response.json(
      {
        success: false,
        message: "Entered Code is invalid.Please enter a valid code",
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        success: false,
        message: "Something went wrong please try again later.",
      },
      { status: 500 }
    );
  }
}
