"use client";
import { testSupabaseSearch, Recipe } from "../actions";
import { useState } from "react";
import RecipeList from "./RecipeList";

export default function RagForm() {
    const [description, setDescription] = useState<string>("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    function handleRecipeClick(recipe: Recipe) {
        const existing = JSON.parse(localStorage.getItem("savedRecipes") || "[]");

        const isAlreadySaved = existing.some((r: Recipe) => r.name === recipe.name);
        if (!isAlreadySaved) {
            const updated = [...existing, recipe];
            localStorage.setItem("savedRecipes", JSON.stringify(updated));
            setSaveMessage(`${recipe.name} has been saved!`);
        } else {
            setSaveMessage(`${recipe.name} is already saved.`);
        }

        setTimeout(() => setSaveMessage(null), 3000); 
    }
    
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
        <div className="flex flex-col items-center justify-center w-full gap-4">
            <form onSubmit={onFormSubmit}>
                <p>Input Description</p>
                <input 
                    className=" input shadow-lg focus:border-2 border-gray-300 px-5 py-2 rounded-xl w-56  outline-none" 
                    type="text" 
                    value={description}
                    onChange={onDescriptionChange}
                />
                <button className=" ml-3  p-1 cursor-pointer transition-all bg-blue-500 text-white px-3 py-1 rounded-lg
                                border-blue-600
                                border-b-[4px]"
                                type="submit">
                        Submit
                </button>
            </form>
            {loading && <p>Loading recipes...</p>}

            {saveMessage && (
            <p className="text-green-600 font-medium">{saveMessage}</p>
            )}
            
            {!loading && recipes.length > 0 && (
                <div>
                    <RecipeList recipes = {recipes} onRecipeClick={handleRecipeClick}/>
                </div>
            )}
            
        </div>
       
    )
}