import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method === 'POST') {
    try {
      const { email, password } = await req.json();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 401 });
      }

      if (data && data.session) {
        const { access_token } = data.session;
        return new Response(
          JSON.stringify({ access_token }), 
          { status: 200, headers: { 'Content-Type': 'application/json','Access-Control-Allow-Origin': '*' } }
        );
      } else {
        return new Response(
          JSON.stringify({ message: 'No session data available.' }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: 'An unexpected error occurred.' }), { status: 500 });
    }
  } else {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
  }
});