import NextAuth from "next-auth";
import { NextOptions } from "./options";
const handler = NextAuth(NextOptions);
export { handler as GET, handler as POST };
