"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "./messages.json";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  return (
    <div className="h-[calc(100vh-84px)]">
      {" "}
      {/* Subtract navbar height (approx 76px) */}
      {/* Main content */}
      <main className="h-[calc(100%-56px)] flex flex-col items-center justify-center px-4 md:px-24 py-6 bg-gray-800 text-white overflow-hidden">
        <section className="text-center mb-4 md:mb-6">
          <h1 className="text-2xl md:text-4xl font-bold">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-2 md:mt-3 text-sm md:text-base">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message: any, index: number) => (
              <CarouselItem key={index} className="p-2">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle>{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 flex flex-col md:flex-row items-start space-y-1 md:space-y-0 md:space-x-3">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
      {/* Footer */}
      <footer className="h-14 text-center p-2 md:p-4 bg-gray-900 text-white flex items-center justify-center">
        <p className="text-sm">
          © 2025 Mystery Messages. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
