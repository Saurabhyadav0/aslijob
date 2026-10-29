import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

async function main() {
  const supabaseUrl = "https://rqvwwudqyjoesvvgpfkx.supabase.co";
  const publishableKey = "sb_publishable_-yhP0HiqxbMuVc_fufuV6Q_pLy_dhPx";

  console.log("[Supabase Test] Connecting with URL:", supabaseUrl);
  const client = createClient(supabaseUrl, publishableKey, {
    realtime: { transport: WebSocket as unknown as undefined },
  });

  const { data, error } = await client.from("checks").select("*").limit(5);

  if (error) {
    console.error("[Supabase Test] Query error:", error.message);
  } else {
    console.log("[Supabase Test] SUCCESS! Connected to Supabase via JS Client!");
    console.log("[Supabase Test] Rows in 'checks' table:", data.length);
  }
}

main();
