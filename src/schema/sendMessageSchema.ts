import z from "zod";
const SendMessageSchema = z.object({
  content: z.string().min(5, {
    message: "Message should be atleast 5 character long",
  }),
});
export default SendMessageSchema;
