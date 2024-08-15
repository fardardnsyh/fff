"use client";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Header from "../components/Header.js";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I am your Code Buddy for Javascript! How can I help you today?`,
    },
  ]);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    setMessage("");
    const userMessage = { role: "user", content: message };
    setMessages((messages) => [...messages, userMessage]);
    setIsTyping(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([userMessage]), // Send the current message as an array
    });

    if (response.ok) {
      const data = await response.text();
      simulateTyping(data);
    } else {
      console.error("Failed to fetch the chat response");
      setIsTyping(false);
    }
  };

  const simulateTyping = (text) => {
    const speed = 10; // Typing speed
    let index = 0;
    let currentText = "";
    const length = text.length;

    const typeNextChar = () => {
      if (index < length) {
        currentText += text.charAt(index);
        index++;
        setMessages((messages) => [
          ...messages.slice(0, -1),
          { role: "assistant", content: currentText },
        ]);
        if (index < length) {
          setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
        }
      }
    };

    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: "" },
    ]);
    typeNextChar();
  };

  return (
    <div>
      <Box backgroundColor="black" width="100vw" height="100vh">
        <Header />
        <Box
          backgroundColor="black"
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Stack
            direction={"column"}
            width="500px"
            height="700px"
            border="2px solid grey"
            borderRadius="16px"
            p={2}
            spacing={3}
          >
            <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      message.role === "assistant" ? "gray" : "primary.main"
                    }
                    color="white"
                    borderRadius={16}
                    p={2}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                </Box>
              ))}
              {isTyping && (
                <Typography color="white" style={{ margin: "0 auto" }}>
                  Code Buddy is Typing...
                </Typography>
              )}
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  bgcolor: "grey",
                  borderRadius: 1,
                  textColor: "white",
                  input: {
                    color: "white",
                  },
                }}
              />
              <Button variant="contained" onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
