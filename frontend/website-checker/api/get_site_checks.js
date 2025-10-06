import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all rows from the `website_checker` table
    const { data, error } = await supabase
      .from("website_checker")
      .select("*")
      .order("log", { ascending: false }); // latest first

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return res.status(500).json({ error: "Failed to fetch data" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
