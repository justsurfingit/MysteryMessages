import { MessageCard } from "@/components/internal/MessageCard";
import Navbar from "@/components/internal/Navbar";
import React from "react";
// so okay it was meant for catching the dynamic routes and that's it
const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default layout;
