

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { db, recipes } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = 'nodejs'; // Ensure Node.js runtime

// Reusable function to get steps (same as your original)
async function getStepsForRecipe(recipeId: number): Promise<string[]> {
  const result = await db
    .select({
      steps: recipes.steps,
    })
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (!result.length) return [];

  const rawSteps = result[0].steps;
  return rawSteps.split(",").map((step) => step.trim());
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    // Initialize components
    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "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", // Use environment variable
      model: "llama-3-70b-8192",
    });

    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });

    // Load FAISS store
    const store = await FaissStore.load(
      path.join(process.cwd(), 'public', 'faiss-store'),
      embeddings
    );

    // Perform similarity search
    const results = await store.similaritySearch(description, 10);

    // Build context with recipe steps
    const contextParts = [];
    for (let i = 0; i < results.length; i++) {
      const doc = results[i];
      const id = doc.metadata.id;
      const stepsFromDB = await getStepsForRecipe(id);
      const formattedSteps = stepsFromDB
        .map((step, idx) => `Step ${idx + 1}: ${step}`)
        .join("\n");
      
      contextParts.push(
        `Recipe #${i + 1} (ID: ${id}, Name: ${doc.metadata.name}):\n${doc.pageContent}\n\nSteps:\n${formattedSteps}`
      );
    }

    const context = contextParts.join("\n\n");

    // Get LLM response
    const response = await llm.invoke([
      new SystemMessage("You are a helpful cooking assistant. Based on the provided recipes and their preparation steps, find the best match and explain why."),
      new HumanMessage(`User Query: "${description}"\n\nAvailable Recipes:\n${context}\n\nGive me the best three matches and explain why.`)
    ]);

    return NextResponse.json({
      success: true,
      results: response.text,
      recipes: results.map(r => ({
        id: r.metadata.id,
        name: r.metadata.name,
        content: r.pageContent
      }))
    });

  } catch (error) {
    console.error("FAISS search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}

