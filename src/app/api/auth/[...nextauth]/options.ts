import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signIn } from "next-auth/react";
export const NextOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        // now we have to write the logic for authorization for the user and then we would be good to go
        try {
          await dbConnect();
          console.log(credentials.username);
          const user = await userModel.findOne({
            username: credentials.username,
          });
          if (!user) {
            throw new Error("No user found with this username");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your email before login");
          }
          // now check the password
          const res = await bcrypt.compare(credentials.password, user.password);
          if (res) {
            return user;
          } else throw new Error("Incorrect Credentials Please try again");
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong.Please try again later");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // how to store value here
      if (user) {
        token.id = user._id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
