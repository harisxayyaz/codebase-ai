import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("code_chunks")
    .select("repo_id")
    .limit(100)
    .order("repo_id");
  if (error) return NextResponse.json({ error });

  // Get unique repo IDs
  const uniqueRepos = Array.from(new Set(data.map((r: any) => r.repo_id))).map(
    (id) => ({ id, name: id }),
  );

  return NextResponse.json({ repos: uniqueRepos });
}
