'use server'; // Mark this file as containing Server Actions

import { db, recipes } from './lib/db';
import { eq } from 'drizzle-orm';

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