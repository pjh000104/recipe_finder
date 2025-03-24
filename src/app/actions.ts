'use server'; // Mark this file as containing Server Actions

import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { db, recipes } from './lib/db';
import { like, or, eq, and, sql } from "drizzle-orm";


let model: use.UniversalSentenceEncoder | undefined;

// Ensure the model is loaded before calling any methods
async function loadModel() {
  if (!model) {
    model = await use.load();
  }
}

// Function to encode a user sentence to an embedding
async function encodeSentence(sentence: string) {
  if (!model) {
    // Ensure the model is loaded
    await loadModel();
  }

  const embeddings = await model!.embed(sentence);
  return embeddings.arraySync()[0]; // Convert tensor to array
}

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, index) => acc + val * vecB[index], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB); // Cosine similarity formula
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: string;
  tags_embedding: string;  // The tags embedding is stored as a JSON string
  extraIngredientsCount: number;
  similarity?: number; // This will store the cosine similarity
}


// Extend the Recipe type to include extraIngredientsCount
export type RecipeWithExtra = {
  id: number;
  name: string;
  ingredients: string;
  extraIngredientsCount: number;
};

export async function searchRecipes(userIngredients: string[], keyword: string): Promise<Recipe[]> {
  if (userIngredients.length === 0 && !keyword) return []; // No search criteria

  // Step 1: Encode the user input keyword (e.g., "vegan") into an embedding
  const userKeywordEmbedding = await encodeSentence(keyword);

  // Step 2: Get the recipes with ingredients matching user input
  const containsAllIngredients = userIngredients.map(
    ing => sql`ingredients LIKE ${'%' + ing + '%'}`
  );

  // Step 3: Query the database for matching recipes (we'll also select tags_embedding)
  const result = await db.all(
    sql`
      SELECT id, name, ingredients, tags_embedding,
      (
        LENGTH(ingredients) - LENGTH(REPLACE(ingredients, ',', '')) + 1
      ) - ${userIngredients.length} AS extraIngredientsCount
      FROM recipes
      WHERE ${sql.join(containsAllIngredients, sql` AND `)}
      LIMIT 10
    `
  );

  // Step 4: Calculate similarity between user keyword embedding and recipe tag embeddings
  const recipesWithSimilarity = await Promise.all(result.map(async (recipe) => {
    // Ensure recipe is typed
    const parsedRecipe: Recipe = recipe as Recipe;

    // Step 4a: Parse the tags_embedding column (which is stored as a JSON string)
    const tagsEmbedding = JSON.parse(parsedRecipe.tags_embedding); // Parse JSON string into an array

    // Step 4b: Calculate the cosine similarity between the user input embedding and the recipe's tags embedding
    const similarity = cosineSimilarity(userKeywordEmbedding, tagsEmbedding);

    // Step 4c: Return the recipe along with its similarity score
    return {
      ...parsedRecipe,
      similarity, // Add similarity score to the recipe object
    };
  }));

  // Step 5: Sort recipes by similarity (highest similarity first) and return top 3
  const top3Recipes = recipesWithSimilarity
    .sort((a: Recipe, b: Recipe) => b.similarity! - a.similarity!) // Explicitly type a and b
    .slice(0, 3);

  return top3Recipes;
}


// Fetch all recipes
export async function getFiveRecipes() {
    try {
      const fiveRecipes = await db.select().from(recipes).limit(5).all();
      return fiveRecipes;
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      throw new Error('Failed to fetch recipes');
    }
  }

// Add a new recipe
export async function addRecipe(newRecipe: typeof recipes.$inferInsert) {
  try {
    const result = await db.insert(recipes).values(newRecipe).run();
    return result;
  } catch (error) {
    console.error('Failed to add recipe:', error);
    throw new Error('Failed to add recipe');
  }
}

// Update a recipe
export async function updateRecipe(id: number, updatedRecipe: Partial<typeof recipes.$inferInsert>) {
  try {
    const result = await db.update(recipes).set(updatedRecipe).where(eq(recipes.id, id)).run();
    return result;
  } catch (error) {
    console.error('Failed to update recipe:', error);
    throw new Error('Failed to update recipe');
  }
}

// Delete a recipe
export async function deleteRecipe(id: number) {
  try {
    const result = await db.delete(recipes).where(eq(recipes.id, id)).run();
    return result;
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    throw new Error('Failed to delete recipe');
  }
}