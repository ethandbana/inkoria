import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.storage.from("uploads").download(filePath);
    if (error) throw error;

    // Simple text extraction from PDF binary
    const bytes = new Uint8Array(await data.arrayBuffer());
    const text = extractTextFromPdf(bytes);

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractTextFromPdf(bytes: Uint8Array): string {
  // Decode PDF binary looking for text streams
  const raw = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Extract text between BT and ET markers (text objects in PDF)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1]);
    }
    // TJ array
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let inner;
      while ((inner = innerRegex.exec(arrMatch[1])) !== null) {
        textParts.push(inner[1]);
      }
    }
  }

  // Clean up extracted text
  let text = textParts.join(" ").replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\s+/g, " ").trim();

  if (!text) {
    text = "Could not extract text from this PDF. The file may use embedded fonts or be image-based.";
  }

  return text;
}
