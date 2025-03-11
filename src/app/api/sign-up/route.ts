import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";
import { userSchema } from "@/schema/signUpSchema";
import { z, ZodError } from "zod";
export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  // parse it myself
  const res = userSchema.safeParse(username);
  if (!res.success) {
    const wtf = res.error.message;
    return Response.json(
      {
        success: false,
        message: "Enter a valid username",
      },
      {
        status: 200,
      }
    );
  }
  console.log("reach");
  const em = z.string().email();
  const secres = em.safeParse(email);
  console.log("this is it", secres);
  if (!secres.success) {
    return Response.json(
      {
        success: false,
        message: "Enter a valid email",
      },
      {
        status: 200,
      }
    );
  }
  try {
    await dbConnect();
    const ExistingUserByUsername = await userModel.findOne({
      username: username,
      isVerified: true,
    });
    if (ExistingUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "The username is already taken",
        },
        {
          status: 200,
        }
      );
    }
    const ExistingUserByEmail = await userModel.findOne({
      email: email,
    });
    const verificationCode = Math.floor(Math.random() * 900000 + 100000);
    if (!ExistingUserByEmail) {
      // user has visited for the first TIME
      // register the user and send VerifcationEmail to get it done
      const hashedPassword = await bcrypt.hash(password, 10);

      const cur = new Date();
      cur.setHours(cur.getHours() + 1);
      const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        verificationCode,
        isVerified: false,
        verificationCodeExpiry: cur,
        isAccepting: true,
        messages: [],
      });
      if (!user) {
        return Response.json(
          {
            success: false,
            message:
              "Unable to create user at the moment. Please try again later..",
          },
          {
            status: 200,
          }
        );
      }
    } else {
      // someone is registered with this email so okay let's fix that
      if (ExistingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message:
              "A user is already registered with this email. Try using different email.",
          },
          {
            status: 200,
          }
        );
      }
      //   now we can verify thing or maybe update the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const cur = new Date(Date.now() + 3600000);
      ExistingUserByEmail.password = hashedPassword;
      ExistingUserByEmail.username = username;
      ExistingUserByEmail.verificationCode = verificationCode.toString();
      ExistingUserByEmail.verificationCodeExpiry = cur;
      await ExistingUserByEmail.save();
    }
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verificationCode.toString()
    );
    if (emailResponse.success) {
      return Response.json({
        success: true,
        message: "Verification code send Successfully.Please verify your email",
      });
    }
    return Response.json({
      success: false,
      message: "Unable to Send Verification code.Please try again later.",
    });
  } catch (err: any) {
    console.log(err);
    console.log("Error connecting to the DB: ", err?.errors);
    return Response.json(
      {
        success: false,
        message: { err },
      },
      {
        status: 200,
      }
    );
  }
}
