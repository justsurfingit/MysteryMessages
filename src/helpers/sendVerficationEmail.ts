// now we will create a function that will send verifcation email let's do it and get it done
import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "../types/ApiResponse";
export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Message Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    console.log(res);
    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}
