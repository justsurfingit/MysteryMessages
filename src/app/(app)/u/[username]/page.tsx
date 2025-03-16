"use client";

import SendMessageSchema from "@/schema/sendMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, RefreshCw, MessageSquarePlus } from "lucide-react";

const Page = () => {
  const [suggestionMessages, setSuggestionMessages] = useState<string[]>([]);
  const [visibleChars, setVisibleChars] = useState<number[]>([]);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const params = useParams<{ username: string }>();
  const userName = params?.username;

  const form = useForm({
    resolver: zodResolver(SendMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      setIsSending(true);
      await axios.post("/api/send-message", {
        username: userName,
        message: data.content,
      });

      toast.success("Message sent successfully 🎉", {
        description: "Let's see how they react!",
      });

      form.reset();
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast.error("Error Sending Message", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsSending(false);
    }
  }

  const fetchSuggestions = async () => {
    try {
      setIsFetching(true);
      setVisibleChars([]);
      setActiveMessageIndex(0);
      setSuggestionMessages([]);

      const response = await axios.get("/api/suggest-messages");
      const separatedMessages = response.data.message
        .split("||")
        .filter((msg: string) => msg.trim() !== "");

      toast.info("Generating message suggestions...", {
        description: "Watch them appear before your eyes",
      });

      setSuggestionMessages(separatedMessages);
      setVisibleChars(new Array(separatedMessages.length).fill(0));

      if (separatedMessages.length > 0) setIsTyping(true);
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast.error("Failed to fetch suggestions", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!isTyping || !suggestionMessages.length) return;

    const currentMessage = suggestionMessages[activeMessageIndex];
    if (!currentMessage) return;

    if (visibleChars[activeMessageIndex] >= currentMessage.length) {
      if (activeMessageIndex < suggestionMessages.length - 1) {
        setActiveMessageIndex(activeMessageIndex + 1);
      } else {
        setIsTyping(false);
        toast.success("All suggestions generated!", {
          description: "Click on any suggestion to use it",
        });
      }
      return;
    }

    const typingTimer = setTimeout(() => {
      setVisibleChars((prev) =>
        prev.map((count, idx) =>
          idx === activeMessageIndex ? count + 1 : count
        )
      );
    }, 30);

    return () => clearTimeout(typingTimer);
  }, [isTyping, activeMessageIndex, visibleChars, suggestionMessages]);

  const useMessageSuggestion = (message: string) =>
    form.setValue("content", message);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 font-sans">
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-5">
          <CardTitle className="flex justify-between items-center">
            <span className="text-xl font-semibold">
              Send Anonymous Message
            </span>
            <MessageSquarePlus size={24} />
          </CardTitle>
          <p className="text-sm">
            Your identity remains secret. Feel free to express yourself!
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Anonymous Message</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Write something anonymous to ${userName}`}
                        {...field}
                        className="py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormDescription>
                      Your message will be sent anonymously.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchSuggestions}
                  disabled={isFetching || isTyping}
                >
                  {isFetching || isTyping ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  New Suggestions
                </Button>

                <Button type="submit" disabled={isSending}>
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={16} className="mr-2" /> Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {suggestionMessages.length > 0 && (
            <div className="mt-8 space-y-2">
              <h3 className="font-semibold">Suggestions</h3>
              {suggestionMessages.map((msg, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    visibleChars[idx] >= msg.length && useMessageSuggestion(msg)
                  }
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    visibleChars[idx] >= msg.length
                      ? "hover:bg-indigo-50 hover:border-indigo-300"
                      : ""
                  }`}
                >
                  {msg.substring(0, visibleChars[idx])}
                  {idx === activeMessageIndex && isTyping && (
                    <span className="inline-block w-2 h-4 bg-gray-800 animate-pulse ml-1"></span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
