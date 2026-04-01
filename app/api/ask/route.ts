import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Number of chunks to retrieve for context
const TOP_K = 30;

// Maximum length of a chunk for GPT context (tokens)
const MAX_CHUNK_LENGTH = 2000; // roughly ~1000 words

export async function POST(req: Request) {
  try {
    const { repoId, question } = await req.json();

    if (!repoId || !question) {
      return NextResponse.json(
        { error: "repoId and question are required" },
        { status: 400 },
      );
    }

    // 🔹 Step 1: Generate embedding for the question
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const [questionEmbedding] = embeddingRes.data.map((d) => d.embedding);

    // 🔹 Step 2: Fetch relevant chunks from Supabase
    const searchRes = await supabase.rpc("match_code_chunks", {
      query_embedding: questionEmbedding,
      match_count: TOP_K,
      repo_id_param: repoId,
    });

    if (searchRes.error) {
      console.log("Supabase search error:", searchRes.error);
      return NextResponse.json({ error: "Failed to search repo" });
    }

    let matchedChunks = searchRes.data as {
      content: string;
      path: string;
      chunk_index: number;
    }[];

    if (!matchedChunks || matchedChunks.length === 0) {
      return NextResponse.json({ answer: "No relevant code found." });
    }

    // 🔹 Step 3: Prioritize README.md or main files first
    matchedChunks.sort((a, b) => {
      if (a.path.toLowerCase().includes("readme")) return -1;
      if (b.path.toLowerCase().includes("readme")) return 1;
      return 0;
    });

    // 🔹 Step 4: Truncate large chunks to MAX_CHUNK_LENGTH
    matchedChunks = matchedChunks.map((chunk) => {
      if (chunk.content.length > MAX_CHUNK_LENGTH) {
        return {
          ...chunk,
          content:
            chunk.content.slice(0, MAX_CHUNK_LENGTH) + "\n...[truncated]",
        };
      }
      return chunk;
    });

    // 🔹 Step 5: Build context for GPT
    const contextText = matchedChunks
      .map((c) => `File: ${c.path}, Chunk ${c.chunk_index}:\n${c.content}`)
      .join("\n\n");

    const prompt = `
You are an AI assistant that answers questions about a codebase.
Use the following context to answer the question.

Context:
${contextText}

Question:
${question}

Answer the question based on the context only. If the answer is not in the context, say "I don't know".
`;

    // 🔹 Step 6: Call GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const answer =
      completion.choices[0]?.message?.content || "No answer generated";

    return NextResponse.json({ answer });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to answer question" },
      { status: 500 },
    );
  }
}