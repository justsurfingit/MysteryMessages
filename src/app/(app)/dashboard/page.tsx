"use client";
import { MessageCard } from "@/components/internal/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { acceptMessageSchema } from "@/schema/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Page = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { data: session } = useSession();

  const { watch, register, setValue } = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });
  //   handle delete Message
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message: any) => message._id !== messageId));
  };
  const isAccepting = watch("isAccepting");
  //   isAccepting will have to current value of is Accepting

  const fetchAcceptMessage = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/accepting-message");
      const value = response.data.message;
      setValue("isAccepting", value);
    } catch (err) {
      console.log(err);
      const error = err as AxiosError<ApiResponse>;
      toast("Something went wrong", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, setValue]);
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/get-messages");

      setMessages(response.data.messages || []);
      toast("Message Fetched successfully!!", {
        description: "You can now read them",
      });
    } catch (err) {
      console.log(err);
      const error = err as AxiosError<ApiResponse>;
      toast("Message Fetching Failed", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, session, setMessages, setIsLoading]);
  //   intial Rendering
  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessage();
    fetchMessages();
  }, [fetchAcceptMessage, fetchMessages, toast, session, setValue]);
  //handle switch change
  //   this is also needed to be done kr
  const handleSwitchChange = async () => {
    try {
      setIsLoading(true);
      setIsSwitching(true);
      const val = !isAccepting;
      setValue("isAccepting", !isAccepting);
      const response = await axios.post("/api/accepting-message", {
        acceptingMessage: val,
      });
      const what = val === true ? "accepting message" : "not accepting message";
      toast(`Hey ${session?.user.username}`, {
        description: `You are now ${what}`,
      });
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast("Failed to Change message Setting", {
        description: error.response?.data.message || "Internal Server Error",
      });
    } finally {
      setIsLoading(false);
      setIsSwitching(false);
    }
  };
  if (!session || !session.user) {
    return <div></div>;
  }
  //   fetch the url for the user
  const { username } = session.user;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;
  const copyToClipboard = async () => {
    await navigator.clipboard?.writeText(profileUrl);
    toast("Link copied to the clipboard", {
      description: "Visit the Link to send anonymous Messages.",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register("isAccepting")}
          checked={isAccepting}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitching}
        />
        <span className="ml-2">
          Accept Messages: {isAccepting ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages();
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message: any, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
