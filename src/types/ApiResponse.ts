import { message } from "../model/User";
// this is the format in which we are accepting the response
export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean;
  messages?: Array<message>;
}
