import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z, ZodError } from "zod"; // Ensure z and ZodError are imported
import { userSchema } from "@/schema/signUpSchema"; // Import usernameValidation

const UsernameQuerySchema = z.object({
  // Define UsernameQuerySchema using usernameValidation
  username: userSchema,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      console.log(result.error.format());
      return Response.json(
        {
          success: false,
          message: usernameErrors[0],
        },
        { status: 200 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      // Use UserModel here, consistent with first code
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
