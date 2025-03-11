import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Try to add uniqueness in your reply and creativeness as well. Change the response with each request";

    const { text } = await generateText({
      model: google("gemini-2.0-flash-thinking-exp-01-21"),
      prompt,
      temperature: 1,
    });

    return Response.json({
      success: true,
      message: text,
    });
  } catch (err: any) {
    console.log(err);
    return Response.json({
      success: false,
      message: err.message || "An error occurred",
    });
  }
}
