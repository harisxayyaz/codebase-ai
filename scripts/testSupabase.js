import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from("code_chunks")
      .select("*")
      .limit(1);
    if (error) throw error;

    console.log("✅ Supabase API works! Sample data:", data);
  } catch (err) {
    console.error("❌ Supabase API error:", err);
  }
}

test();
