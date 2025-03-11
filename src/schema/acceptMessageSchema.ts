import { z } from "zod";
export const acceptMessageSchema = z.object({
  isAccepting: z.boolean(),
});
