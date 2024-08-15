"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

const Header = () => {
  const router = useRouter();
  const handleClickChat = () => {
    router.push("/chat");
  };
  const handleClickHome = () => {
    router.push("/");
  };

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleClickHome}
        sx={{
          backgroundColor: "black",
          color: "white",
          borderColor: "white",
        }}
      >
        Home
      </Button>
      <Button
        variant="outlined"
        onClick={handleClickChat}
        sx={{
          backgroundColor: "black",
          color: "white",
          borderColor: "white",
        }}
      >
        Chat
      </Button>
    </div>
  );
};

export default Header;
