"use client";
import { verifySchema } from "@/schema/verifySchema";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
const page = () => {
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });
  const route = useRouter();
  const params = useParams<{ username: string }>();
  async function onSubmit(data: any) {
    // params needed to be fetched
    try {
      console.log(params);
      const response = await axios.post("/api/verify-user", {
        username: params?.username,
        verificationCode: data.code,
      });
      console.log(response);
      if (response.data.success === true) {
        toast("Verified successfully. 🎉");
        route.replace("/sign-in");
      }
      if (response.data.success === false) {
        toast(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast("Something went wrong. Please try again");
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default page;
