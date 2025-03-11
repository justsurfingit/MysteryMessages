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
      const response = await axios.post("/api/send-message", {
        username: userName,
        message: data.content,
      });

      toast("Message sent successfully 🎉", {
        description: "Let's see how they will react!!",
      });

      form.reset();
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast("Error Sending Message", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsSending(false);
    }
  }

  const fetchSuggestions = async () => {
    try {
      setIsFetching(true);
      // Reset all typing states
      setVisibleChars([]);
      setActiveMessageIndex(0);
      setSuggestionMessages([]);

      const response = await axios.get("/api/suggest-messages");
      const str = response.data.message;
      const separatedMessages = str
        .split("||")
        .filter((msg: string) => msg.trim() !== "");

      toast("Generating message suggestions...", {
        description: "Watch them appear before your eyes",
      });

      // Set messages and initialize typing
      setSuggestionMessages(separatedMessages);

      // Initialize with 0 visible characters for each message
      setVisibleChars(new Array(separatedMessages.length).fill(0));

      // Start typing if we have messages
      if (separatedMessages.length > 0) {
        setIsTyping(true);
      }
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast("Failed to fetch suggestions", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSuggestions();
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isTyping || suggestionMessages.length === 0) return;

    const currentMessage = suggestionMessages[activeMessageIndex];
    if (!currentMessage) return;

    const currentVisible = visibleChars[activeMessageIndex];

    // If we've typed the full message
    if (currentVisible >= currentMessage.length) {
      // Move to the next message
      if (activeMessageIndex < suggestionMessages.length - 1) {
        setActiveMessageIndex(activeMessageIndex + 1);
      } else {
        // Done with all messages
        setIsTyping(false);
        toast("All suggestions generated!", {
          description: "Click on any suggestion to use it",
        });
      }
      return;
    }

    // Type the next character
    const typingTimer = setTimeout(() => {
      const newVisibleChars = [...visibleChars];
      newVisibleChars[activeMessageIndex] = currentVisible + 1;
      setVisibleChars(newVisibleChars);
    }, 30); // typing speed

    return () => clearTimeout(typingTimer);
  }, [isTyping, activeMessageIndex, visibleChars, suggestionMessages]);

  const useMessageSuggestion = (message: string) => {
    form.setValue("content", message);
  };

  const getDisplayedText = (message: string, visibleCount: number) => {
    return message.substring(0, visibleCount);
  };

  return (
    <div className="container w-600 mx-auto px-4 py-8 ">
      <Card className="bg-gray-50 border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r bg-gray-800 to bg-gray-900 text-white">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Send Anonymous Message</span>
            <MessageSquarePlus size={24} />
          </CardTitle>
          <p className="text-gray-100 text-sm">
            Your identity will remain a secret. Feel free to express yourself!
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
                    <FormLabel className="text-gray-700 font-semibold">
                      Your Anonymous Message
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="What would you like to say anonymously?"
                          className="pr-10 py-3 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Your message will be sent anonymously to {userName}
                    </FormDescription>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
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
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-indigo-900 text-white"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={16} className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {suggestionMessages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                Message Suggestions
                {isTyping && (
                  <RefreshCw
                    size={14}
                    className="ml-2 animate-spin text-indigo-600"
                  />
                )}
              </h3>
              <div className="grid gap-2">
                {suggestionMessages.map((message, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      // Only allow clicking if fully typed
                      if (visibleChars[index] >= message.length) {
                        useMessageSuggestion(message);
                      }
                    }}
                    className={`p-3 bg-white border border-gray-200 rounded-md text-sm ${
                      visibleChars[index] >= message.length
                        ? "cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors duration-200"
                        : ""
                    }`}
                  >
                    {getDisplayedText(message, visibleChars[index])}
                    {index === activeMessageIndex && isTyping && (
                      <span className="ml-1 inline-block w-2 h-4 bg-gray-900 animate-pulse"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
