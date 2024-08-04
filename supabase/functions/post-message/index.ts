import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// Environment variables (to be set in the Supabase dashboard or local .env file)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  console.log("Received request with method:", req.method);

  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Request body:", body);

      const { name, message, image } = body;

      if (!name || !message || !image) {
        console.log("Name, message, and image are required");
        return new Response(JSON.stringify({ error: "Name, message, and image are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from('Messages')
        .insert([{ name, message, image }]);

      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }

      console.log("Message inserted successfully:", data);
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Error handling request:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    console.log("Method not allowed");
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
});
