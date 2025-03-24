import * as tf from '@tensorflow/tfjs-node'; // Use the Node.js backend
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { createClient } from '@libsql/client';

// Initialize Turso client
const turso = createClient({
    url: "libsql://recipe-new-embeddings-pjh000104.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDI3NDIzMjIsImlkIjoiMDY3NGE4MmEtNjI0OS00NzBjLWI4MzctOGYwMDhkYzM2NTI0In0.-u_46uvOMW6uEUz6v6jU2mGQ3vyN-DIlumRbbVljaBpNlqIWSH_5j8Vaw-UKYCIzJMasQ9_K9OKfAznvLAAOBQ"
});

// Load the Universal Sentence Encoder model
async function loadModel() {
    console.log('Using backend:', tf.getBackend()); // Verify backend
    const model = await use.load();
    return model;
}

// Encode a sentence into embeddings
async function encodeSentence(model: use.UniversalSentenceEncoder, sentence: string) {
    const embeddings = await model.embed(sentence);
    return embeddings.arraySync()[0]; // Convert tensor to array
}

// Function to update the database with new embeddings
async function updateDatabaseWithNewEmbeddings() {
    const model = await loadModel();

    let offset = 0;
    const limit = 100; // Fetch 100 rows at a time
    let hasMoreRows = true;

    while (hasMoreRows) {
        // Fetch a batch of recipes from the database (only the `id` and `tags` columns)
        const result = await turso.execute({
            sql: "SELECT id, tags FROM recipes LIMIT ? OFFSET ?",
            args: [limit, offset],
        });

        const recipes = result.rows;

        // If no more rows are returned, exit the loop
        if (recipes.length === 0) {
            hasMoreRows = false;
            break;
        }

        console.log(`Processing batch: offset=${offset}, limit=${limit}`);

        // Process each recipe in the batch
        for (const recipe of recipes) {
            // Extract the `tags` field
            const tags = recipe.tags;
        
            // Skip if `tags` is null or undefined
            if (tags == null) {
                console.log(`Skipping recipe id=${recipe.id} (tags is null or undefined)`);
                continue;
            }
        
            // Ensure `tags` is a string
            const tagsString = tags.toString();
        
            // Generate the embedding for the `tags` field
            const embedding = await encodeSentence(model, tagsString);
        
            // Update the database with the new embedding
            await turso.execute({
                sql: "UPDATE recipes SET tags_embedding = ? WHERE id = ?",
                args: [JSON.stringify(embedding), recipe.id],
            });
        }

        // Increment the offset for the next batch
        offset += limit;
    }

    console.log("Database updated with new embeddings.");
}

// Run the script
updateDatabaseWithNewEmbeddings().catch(console.error);