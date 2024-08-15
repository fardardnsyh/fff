"use client";
import React from "react";
import Header from "./Header.js";
import { Box, Typography } from "@mui/material";

const Homepage = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url('/backgroundImage.avif')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "auto",
          zIndex: 10,
        }}
      >
        <Header />
      </Box>
      <Box
        sx={{
          textAlign: "center",
          color: "white",
          p: 3,
          textShadow: "0px 0px 8px rgba(0,0,0,0.7)",
          maxWidth: "600px",
        }}
      >
        <Typography variant="h3" gutterBottom>
          Bro Code Javascript Support AI
        </Typography>
        <Typography variant="h6">
          Based off of Bro Code&apos;s 12 Hour Javascript Tutorial, you may ask this
          support bot any clarifying questions you may have.
        </Typography>
      </Box>
    </Box>
  );
};

export default Homepage;
