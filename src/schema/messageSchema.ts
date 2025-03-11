import { z } from "zod";
export const messageSchema = z.object({
  content: z
    .string()
    .min(3, "Message should be atleast 3 characters long")
    .max(300, "Maximum message Limit is of 300 characters"),
  createdAt: z.string().date(),
});
