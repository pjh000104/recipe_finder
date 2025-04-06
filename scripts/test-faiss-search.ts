// scripts/test-faiss-search.ts
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import path from "path";
import { fileURLToPath } from "url";

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFaissSearch() {
  try {
    // 1. Load your FAISS store
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2" 
    });
    
    const store = await FaissStore.load(
      path.join(__dirname, "../public/faiss-store"),
      embeddings
    );

    console.log("FAISS store loaded successfully");

    // 2. Test queries
    const testQueries = [
      "chicken recipe",
      "vegetarian pasta",
      "quick dessert",
      "healthy breakfast"
    ];

    // 3. Search and log results
    for (const query of testQueries) {
      console.log(`\n🔍 Searching for: "${query}"`);
      
      const results = await store.similaritySearchWithScore(query, 3);
      
      results.forEach(([doc, score], i) => {
        console.log(
          `#${i + 1}: ${doc.metadata.name}\n` +
          `ID: ${doc.metadata.id}\n` +
          `Score: ${score.toFixed(4)}\n` +
          `Content: ${doc.pageContent}\n` +
          "-".repeat(40)
        );
      });
    }

  } catch (error) {
    console.error("Error testing FAISS search:", error);
  }
}

// Run the test
testFaissSearch();