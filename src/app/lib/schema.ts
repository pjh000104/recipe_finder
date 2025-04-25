import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey(), 
  name: text('name').notNull(), 
  minutes: integer('minutes').notNull(), 
  tags: text('tags').notNull(), 
  nutrition: text('nutrition').notNull(), 
  n_steps: integer('n_steps').notNull(), 
  steps: text('steps').notNull(), 
  description: text('description').notNull(), 
  ingredients: text('ingredients').notNull(), 
  n_ingredients: integer('n_ingredients').notNull(), 
  tags_embedding: text('tags_embedding').notNull(), // Embedding for tags  
});
