import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey(), // Unique ID for each recipe
  name: text('name').notNull(), // Name of the recipe
  minutes: integer('minutes').notNull(), // Cooking time in minutes
  tags: text('tags').notNull(), // Tags associated with the recipe
  nutrition: text('nutrition').notNull(), // Nutritional information
  n_steps: integer('n_steps').notNull(), // Number of steps
  steps: text('steps').notNull(), // Detailed steps
  description: text('description').notNull(), // Description of the recipe
  ingredients: text('ingredients').notNull(), // List of ingredients
  n_ingredients: integer('n_ingredients').notNull(), // Number of ingredients
  tags_embedding: text('tags_embedding').notNull(), // Embedding for tags (e.g., vector or JSON)
});

// TypeScript types for the schema
export type Recipe = typeof recipes.$inferSelect; // For selecting rows
export type NewRecipe = typeof recipes.$inferInsert; // For inserting rows