"use client";
import { testSupabaseSearch, Recipe } from "../actions";
import { useState } from "react";
import RecipeList from "./RecipeList";

export default function RagForm() {
    const [description, setDescription] = useState<string>("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    function onDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDescription(e.target.value);
    }
    async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true); // Set loading to true before fetching
        const result = await testSupabaseSearch(description);
        setRecipes(result.topRecipes); // Store recipes in state
        setLoading(false); // Set loading to false after fetching
    }
    return (
        <div>
            <form onSubmit={onFormSubmit}>
                <p>Input Description</p>
                <input 
                    type="text" 
                    value={description}
                    onChange={onDescriptionChange}
                />
                <button type="submit">Submit</button>
            </form>
            {loading && <p>Loading recipes...</p>}

            {!loading && (
                <div>
                    <RecipeList recipes = {recipes}/>
                </div>
            )}
        </div>
       
    )
}