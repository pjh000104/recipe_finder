// scripts/test-faiss-search.ts
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import path from "path";
import { fileURLToPath } from "url";
import { db, recipes } from '@/app/lib/db'
import { like, or, eq, and, sql } from "drizzle-orm";


export async function getStepsForRecipe(recipeId: number): Promise<string[]> {
  
  const result = await db
    .select({
      steps: recipes.steps,
    })
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (!result.length) return [];

  const rawSteps = result[0].steps;

  // Split by comma and trim each step
  const stepsArray = rawSteps.split(",").map((step) => step.trim());

  return stepsArray;
}

// Get current module path

async function testFaissSearch(description: string) {
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Initialize Groq LLM (OpenAI-compatible)
  const llm = new ChatGroq({
    apiKey: "",
    model: "llama-3.3-70b-versatile", // Or llama3-8b-8192, gemma-7b-it, etc.
  });

  try {
    // 1. Load your FAISS store
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });

    const store = await FaissStore.load(
      path.join(__dirname, "../public/faiss-store"),
      embeddings
    );

    console.log("✅ FAISS store loaded successfully");

    // 2. Test queries

    console.log(`\n🔍 Query: "${description}"`);

    const results = await store.similaritySearch(description, 10);

    const contextParts = [];
    
    for (let i = 0; i < results.length; i++) {
      const doc = results[i];
      const id = doc.metadata.id;
    
      // 🔍 Query the steps from DB
      const stepsFromDB = await getStepsForRecipe(id);
      const formattedSteps = stepsFromDB
      .map((step, idx) => `Step ${idx + 1}: ${step}`)
      .join("\n");
    
      contextParts.push(
        `Recipe #${i + 1} (ID: ${id}, Name: ${doc.metadata.name}):\n${doc.pageContent}\n\nSteps:\n${formattedSteps}`
      );
    }
    
    const context = contextParts.join("\n\n");

    const response = await llm.invoke([
      new SystemMessage("You are a helpful cooking assistant. Based on the provided recipes and their preparation steps, find the best match and explain why."),
      new HumanMessage(`User Query: "${description}"\n\nAvailable Recipes:\n${context}\n\nGive me the best three match and explain why.`)
    ]);

    console.log(`🤖 Response:\n${response.text}`);

    
  } catch (error) {
    console.error("Error testing FAISS search with Groq RAG:", error);
  }
}

testFaissSearch("healthy garlic chicken");
