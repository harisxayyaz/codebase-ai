import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: Request,
  context: { params: Promise<{ repoId: string }> }, // 👈 IMPORTANT
) {
  try {
    // ✅ FIX: await params
    const { repoId } = await context.params;

    if (!repoId) {
      return NextResponse.json(
        { chats: [], error: "repoId is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("repo_chats")
      .select("id, role, message, created_at")
      .eq("repo_id", repoId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ chats: data || [] });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { chats: [], error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await context.params;

    if (!repoId) {
      return NextResponse.json({ error: "repoId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("repos")
      .delete()
      .eq("id", repoId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to delete repo" },
      { status: 500 }
    );
  }
}