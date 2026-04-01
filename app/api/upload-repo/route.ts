import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const allowedExtensions = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".java",
  ".json",
  ".md",
];

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();
    const repoId = uuidv4();

    // Extract repo name from GitHub URL
    const repoName = repoUrl.split("/").slice(-1)[0].replace(".git", "");

    // Store repo in Supabase
    const { error: repoError } = await supabase.from("repos").insert({
      id: repoId,
      name: repoName,
    });
    if (repoError) console.log("Repo insert error:", repoError);

    const baseDir = path.join(process.cwd(), "temp_repos");

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }

    const repoPath = path.join(baseDir, repoId);

    // Clone repo
    const git = simpleGit();
    await git.clone(repoUrl, repoPath);

    // Read files
    const fileData: { path: string; content: string }[] = [];

    function readFiles(dir: string) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (item === "node_modules" || item === ".git") continue;
          readFiles(fullPath);
        } else {
          const ext = path.extname(fullPath);
          if (allowedExtensions.includes(ext)) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              if (content.length > 20000 || content.length < 50) continue; // skip huge/small files
              const relativePath = path.relative(repoPath, fullPath);

              fileData.push({
                path: relativePath,
                content,
              });
            } catch (err) {
              console.log("Error reading file:", fullPath);
            }
          }
        }
      }
    }

    readFiles(repoPath);

    // Chunk files
    function chunkFile(file: { path: string; content: string }) {
      const CHUNK_SIZE = 1000; // 1000 chars per chunk
      const chunks: { path: string; index: number; text: string }[] = [];
      let start = 0;
      let index = 0;

      while (start < file.content.length) {
        const end = Math.min(start + CHUNK_SIZE, file.content.length);
        const chunkText = file.content.slice(start, end);

        chunks.push({
          path: file.path,
          index,
          text: chunkText,
        });

        start = end;
        index++;
      }

      return chunks;
    }

    let allChunks: { path: string; index: number; text: string }[] = [];
    for (const file of fileData) {
      const chunks = chunkFile(file);
      allChunks = allChunks.concat(chunks);
    }

    // 🔥 Batch embeddings for Supabase
    const BATCH_SIZE = 50; // process 50 chunks at a time
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);

      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch.map((c) => c.text),
      });

      const embeddings = embeddingRes.data.map((d) => d.embedding);

      const insertData = batch.map((chunk, idx) => ({
        repo_id: repoId,
        path: chunk.path,
        chunk_index: chunk.index,
        content: chunk.text,
        embedding: embeddings[idx],
      }));

      const { error } = await supabase.from("code_chunks").insert(insertData);
      if (error) console.log("Supabase insert error:", error);
    }
    // Delete cloned repo to save space
    fs.rmSync(repoPath, { recursive: true, force: true });
    return NextResponse.json({
      success: true,
      repoId,
      repoName, // <-- return readable name too
      filesCount: fileData.length,
      chunksCount: allChunks.length,
      message: "Embeddings created and stored successfully!",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Upload or embedding failed" });
  }
}
