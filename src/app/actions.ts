'use server'; // Mark this file as containing Server Actions

import { db, recipes } from './lib/db';
import { like, or, eq, and, sql } from "drizzle-orm";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";



function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be the same length");
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: string;
  extraIngredientsCount: number;
  similarity?: number; // This will store the cosine similarity
  tags: string;
  steps: string;
}

export async function searchRecipes(userIngredients: string[], keyword: string): Promise<Recipe[]> {
  if (userIngredients.length === 0 && !keyword) return []; // No search criteria

  // Create SQL conditions to check if all userIngredients exist in ingredients
  const containsAllIngredients = userIngredients.map(
    ing => sql`ingredients LIKE ${'%' + ing + '%'}` 
  );
  console.log("searching for results");
  const result = await db.all(
    sql`
      SELECT id, name, ingredients, tags, steps,
      (
        LENGTH(ingredients) - LENGTH(REPLACE(ingredients, ',', '')) + 1
      ) - ${userIngredients.length} AS extraIngredientsCount
      FROM recipes
      WHERE ${sql.join(containsAllIngredients, sql` AND `)}
      ORDER BY extraIngredientsCount ASC
      LIMIT 10
    `
  );
  console.log(result);


  try {
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2"
    });
    const userKeywordEmbedding = await embeddings.embedQuery(keyword)

    const recipeEmbeddings = await Promise.all(
      (result as Recipe[]).map(async (recipe) => {
        if (!recipe.tags) {
          console.warn(`Recipe ID ${recipe.id} is missing a keyword`);
          return { recipe, embedding: null }; // Handle missing keywords
        }
    
        return {
          recipe,
          embedding: await embeddings.embedQuery(recipe.tags)
        };
      })
    );

    // Compute similarity scores against user input
    const scoredResults = recipeEmbeddings
    .filter(({ embedding }) => embedding !== null)
    .map(({ recipe, embedding }) => {
      // Ensure embedding is treated as number[]
      const recipeEmbedding = embedding as number[];
      return {
        recipe,
        score: cosineSimilarity(userKeywordEmbedding, recipeEmbedding)
      };
    })
    .sort((a, b) => b.score - a.score);

    console.log("Top Similar Recipes:", scoredResults.slice(0, 3));
    return scoredResults.slice(0, 3).map(({ recipe }) => recipe);
  } catch (error) {
    console.error("Error filtering with FAISS:", error);
    return [];
  }

}



import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getRecipeById(recipeId: number): Promise<Recipe | null> {
  const result = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      ingredients: recipes.ingredients,
      tags: recipes.tags,
      steps: recipes.steps,
    })
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (!result.length) return null;

  return result[0] as Recipe;
}


export async function testSupabaseSearch(description: string): Promise<{
  explanation: string;
  topRecipes: Recipe[];
}> {
  // Initialize Groq LLM (OpenAI-compatible)
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
  });

  try {
    // 1. Initialize embeddings
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });

    // 2. Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(description);

    // 3. Perform vector search in Supabase
    const { data: results, error } = await supabase.rpc("search_recipes", {
      query_embedding: queryEmbedding,
      similarity_threshold: 0.6,
      match_count: 10,
    });

    if (error) throw error;
    if (!results || results.length === 0) {
      return {
        explanation: "No matching recipes found.",
        topRecipes: [],
      };
    }

    // 4. Process results
    const contextParts: string[] = [];
    const topRecipes: Recipe[] = [];

    for (let i = 0; i < results.length; i++) {
      const recipeMeta = results[i];
      const recipeFromDB = await getRecipeById(recipeMeta.id);
      if (!recipeFromDB) continue;

      topRecipes.push(recipeFromDB);

      const stepsArray = recipeFromDB.steps.split(",").map((step) => step.trim());
      const formattedSteps = stepsArray
        .map((step, idx) => `Step ${idx + 1}: ${step}`)
        .join("\n");

      contextParts.push(
        `Recipe #${i + 1} (ID: ${recipeFromDB.id}, Name: ${recipeFromDB.name}):\n${recipeFromDB.name}\n\nSteps:\n${formattedSteps}`
      );
    }

    const context = contextParts.join("\n\n");

    // 5. Get LLM response
    const response = await llm.invoke([
      new SystemMessage(
        "You are a helpful cooking assistant. Based on the provided recipes and their preparation steps, find the best match and explain why."
      ),
      new HumanMessage(
        `User Query: "${description}"\n\nAvailable Recipes:\n${context}\n\nGive me the best three matches and explain why.`
      ),
    ]);

    return {
      explanation: response.text,
      topRecipes: topRecipes.slice(0, 3), // Return top 3 full recipes
    };
  } catch (error) {
    console.error("Error testing Supabase vector search with Groq RAG:", error);
    return {
      explanation: "",
      topRecipes: [],
    };
  }
}

