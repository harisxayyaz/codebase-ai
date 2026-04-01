import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("repos")       // <- query the repos table
      .select("id, name")  // <- get both id and human-readable name
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ repos: data || [] });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ repos: [], error: "Failed to fetch repos" });
  }
}