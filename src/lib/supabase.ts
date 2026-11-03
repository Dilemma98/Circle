import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from("groups")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error.message);
    return false;
  }

  console.log("Supabase connection successful!");
  return true;
}