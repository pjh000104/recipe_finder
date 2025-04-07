import 'dotenv/config'; // Load .env before anything else
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Document } from "@langchain/core/documents";
import { db } from "./db";  // Your db import
import { sql } from 'drizzle-orm';
import path from 'path';

// Define the expected shape of the recipe data
interface Recipe {
  id: number;
  name: string;
  tags_embedding: string;  // Stored as a JSON string
}

// Define the metadata shape for documents
interface RecipeMetadata {
  id: number;
  name: string;
}

// src/app/lib/faiss_db_update.ts
export async function createVectorStore() {
    try {
      const embeddings = new HuggingFaceTransformersEmbeddings({
        model: "all-MiniLM-L6-v2"
      });
      
      const faissStore = await FaissStore.fromTexts([], [], embeddings);
  
      const batchSize = 500;
      let processedCount = 0;
      let hasMore = true;
  
      while (hasMore) {
        const recipes = await db.all<Recipe>(
          sql`SELECT id, name, tags_embedding FROM recipes LIMIT ${batchSize} OFFSET ${processedCount}`
        );
  
        if (recipes.length === 0) {
          hasMore = false;
          break;
        }
  
        const vectors: number[][] = [];
        const documents: Document[] = [];
  
        for (const recipe of recipes) {
          // Skip if critical fields are missing
          if (!recipe.tags_embedding || !recipe.name || !recipe.id) {
            console.warn(`Skipping recipe ${recipe.id} - missing required fields`);
            continue;
          }
  
          try {
            vectors.push(JSON.parse(recipe.tags_embedding));
            documents.push(new Document({
              pageContent: recipe.name.toString(), // Ensure string conversion
              metadata: { 
                id: recipe.id,
                name: recipe.name.toString() 
              }
            }));
          } catch (error) {
            console.error(`Error processing recipe ${recipe.id}:`, error);
          }
        }
  
        // Only add if we have matching pairs
        if (vectors.length > 0 && vectors.length === documents.length) {
          await faissStore.addVectors(vectors, documents);
        } else {
          console.warn(`Skipping batch - vectors (${vectors.length}) and documents (${documents.length}) count mismatch`);
        }
  
        processedCount += recipes.length;
        console.log(`Processed ${processedCount} recipes...`);
      }
  
      return faissStore;
    } catch (error) {
        console.error("error creating database: ", error);
    }
}