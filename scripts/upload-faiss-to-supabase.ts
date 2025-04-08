import { createClient } from "@supabase/supabase-js";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  "https://lqvvlkqecexfugvexvlx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdnZsa3FlY2V4ZnVndmV4dmx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDEyODEzNywiZXhwIjoyMDU5NzA0MTM3fQ.pBrwDNa3zx7gsWW3VdALck-_C7pXU78EtQN92j6FKGw" // Only for backend/admin scripts
);

async function uploadToSupabase() {
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  const store = await FaissStore.load(
    path.join(__dirname, "../public/faiss-store"),
    embeddings
  );

  console.log("✅ FAISS store loaded");

  const docs = await store.similaritySearch("dummy", 10000); // returns all

  for (const doc of docs) {
    const { id, name } = doc.metadata;
    const description = doc.pageContent;
    const vector = await embeddings.embedQuery(description);

    const { error } = await supabase.from("recipes").upsert({
      id,
      name,
      description,
      embedding: vector,
    });

    if (error) {
      console.error(`❌ Failed to insert recipe ${id}:`, error.message);
    } else {
      console.log(`✅ Uploaded recipe ${id}: ${name}`);
    }
  }

  console.log("🎉 Done uploading all FAISS entries to Supabase!");
}

uploadToSupabase().catch(console.error);
