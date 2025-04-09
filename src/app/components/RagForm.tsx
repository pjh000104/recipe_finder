"use client";
import { testSupabaseSearch, Recipe } from "../actions";
import {useState } from "react";

export default function RagForm() {
    const [description, setDescription] = useState<string>("");
    const [recipes, setRecipes] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    function onDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDescription(e.target.value);
    }
    async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true); // Set loading to true before fetching
        const fetchedRecipes = await testSupabaseSearch(description);
        setRecipes(fetchedRecipes); // Store recipes in state
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
                    <h2>recipes</h2>
                    <p>{recipes}</p>
                </div>
            )}
        </div>
       
    )
}