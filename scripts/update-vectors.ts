// scripts/update-vectors.ts
import { createVectorStore } from '../src/app/lib/faiss_db_update';
import path from 'path';

async function main() {
  try {
    console.log('Starting vector store update from local SQLite...');
    const store = await createVectorStore();
    
    const savePath = path.resolve(process.cwd(), 'public/faiss-store');
    await store.save(savePath);
    
    console.log(`Vector store saved to ${savePath}`);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

main();