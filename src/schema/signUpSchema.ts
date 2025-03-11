// okay now we have to make signup schema
import { z } from "zod";
export const userSchema = z
  .string()
  .min(5, "Username should have atleast 5 characters")
  .max(20, "Username can have atmost 20 charaters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Invalid username, username can't have Special characters"
  );
export const signUpSchema = z.object({
  username: userSchema,
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters long" })
    .max(30, { message: "Password should be at most 30 characters long" }),
});
