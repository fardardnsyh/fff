import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { YoutubeTranscript } from "youtube-transcript";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

function splitText(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, Math.min(text.length, i + chunkSize)));
  }
  return chunks;
}

export const POST = async (req) => {
  try {
    const queryObjects = await req.json();

    // Extracting text from user
    const queryText = queryObjects
      .filter((obj) => obj.role === "user")
      .map((obj) => obj.content)
      .join(" ");

    const responseText = analyzeUserInput(queryText);

    if (responseText) {
      // If the responseText is true, it means the message was a casual conversation and doesn't need JS help
      console.log("Returning early response:", responseText);
      return new NextResponse(responseText);
    }

    const videoId = "lfmg-EJ8gm4";

    // Fetch YouTube transcript using the youtube-transcript package
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    const text = transcriptItems.map((item) => item.text).join(" ");
    const chunks = splitText(text, 2000);

    // Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
          encoding_format: "float",
        });

        if (response && response.data && response.data.length > 0) {
          // each response has one chunk
          return {
            id: `${videoId}-${index}`, // Id for each chunk
            values: response.data[0].embedding, // embedding vector
            metadata: { text: chunk },
          };
        } else {
          console.error("Invalid embedding response:", response);
          return null;
        }
      })
    );

    const index = pc.index("chatbot");
    const filteredEmbeddings = embeddings.filter((e) => e); // Filter out any undefined entries

    await index.upsert(filteredEmbeddings);

    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
      encoding_format: "float",
    });
    const queryVector = queryResponse.data[0].embedding;

    const searchResults = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const relevantTexts = searchResults.matches
      .filter((match) => match.metadata && match.metadata.text)
      .map((match) => match.metadata.text)
      .join("\n");

    const systemPrompt = `
      You are an AI named Code Buddy, and your job is to assist with JavaScript queries based on specific content from the JavaScript tutorial video by Bro Code. Please restrict your assistance and examples to JavaScript only. Tell the user that you aren't able to process their request if they ask for non-javascript related questions.
    `;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: queryText,
      },
      {
        role: "assistant",
        content: `Focusing on JavaScript, here's what's relevant from the video:\n${relevantTexts}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      stream: true,
    });

    let generatedText = "";
    for await (const chunk of completion) {
      generatedText += chunk.choices[0]?.delta?.content || "";
    }

    return new NextResponse(generatedText, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

function analyzeUserInput(queryText) {
  const lowercased = queryText.toLowerCase().trim();

  if (lowercased === "hello" || lowercased === "hi") {
    return "Hello! How can I assist you with JavaScript today?";
  }

  if (lowercased.startsWith("my name is")) {
    const name = queryText.split(" ").pop();
    return `Nice to meet you, ${name}! How can I help you with JavaScript today?`;
  }

  return null; // Return null to answer technical JS questions
}

