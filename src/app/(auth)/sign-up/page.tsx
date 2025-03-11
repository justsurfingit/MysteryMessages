"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { signUpSchema } from "@/schema/signUpSchema";
import { useDebounceCallback } from "usehooks-ts";

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
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300);
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  //   userName debouncing handled here
  useEffect(() => {
    const checkUniqueUsername = async () => {
      if (username) {
        setCheckingUsername(true);
        try {
          const res = await axios.get(
            `/api/check-unique-username/?username=${username}`
          );
          console.log(res);
          setUsernameMessage(res.data.message);
        } catch (err) {
          console.log(err);
          setUsernameMessage("Error Checking the Username");
        } finally {
          setCheckingUsername(false);
        }
      }
    };
    checkUniqueUsername();
  }, [username]);

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    // submit logic will be executed here
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/sign-up", data);
      toast(response.data.message, {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
      if (response.data.success === true) router.replace(`/verify/${username}`);
    } catch (err) {
      toast("Error occured during sign up", {
        description: "Internal Server Error",
      });
    } finally {
      //   setUsername("");
      //   setUsernameMessage("");
      setIsSubmitting(false);
      setCheckingUsername(false);
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join The Mystery Messaging
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "Username is unique"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
