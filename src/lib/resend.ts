import { Resend } from "resend";
// temp fix as it's not able to read fro env will fix that later
const re = process.env.RESEND_API_KEY || "";
export const resend = new Resend(re);
// there is nothing here just a resend ko init kr deya and then we are forwarding it
// problem hai ke mail nhi bhj skta mai tow koi fyda nhi h eska
