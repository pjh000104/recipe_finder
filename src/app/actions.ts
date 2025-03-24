'use server'; // Mark this file as containing Server Actions

import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { db, recipes } from './lib/db';
import { like, or, eq, and, sql } from "drizzle-orm";


export type RecipeWithExtra = {
  id: number;
  name: string;
  ingredients: string;
  extraIngredientsCount: number;
};

export async function searchRecipes(userIngredients: string[]): Promise<RecipeWithExtra[]> {
  if (userIngredients.length === 0) return [];

  // Create SQL conditions to check if all userIngredients exist in ingredients
  const containsAllIngredients = userIngredients.map(
    ing => sql`ingredients LIKE ${'%' + ing + '%'}`
  );

  const result = await db.all(
    sql`
      SELECT id, name, ingredients,
      (
        LENGTH(ingredients) - LENGTH(REPLACE(ingredients, ',', '')) + 1
      ) - ${userIngredients.length} AS extraIngredientsCount
      FROM recipes
      WHERE ${sql.join(containsAllIngredients, sql` AND `)}
      ORDER BY extraIngredientsCount ASC
      LIMIT 10
    `
  );

  return result as RecipeWithExtra[];
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