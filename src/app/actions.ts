'use server'; // Mark this file as containing Server Actions

import { db, recipes } from './lib/db';
import { like, or, eq, and, sql } from "drizzle-orm";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { fileURLToPath } from "url";



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
      SELECT id, name, ingredients, tags,
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

    console.log("🔍 Top Similar Recipes:", scoredResults.slice(0, 3));
    return scoredResults.slice(0, 3).map(({ recipe }) => recipe);
  } catch (error) {
    console.error("Error filtering with FAISS:", error);
    return [];
  }

}


