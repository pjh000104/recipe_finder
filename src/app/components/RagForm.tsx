"use client";
import { SupabaseSearch, Recipe } from "../actions";
import { useState } from "react";
import RecipeList from "./RecipeList";
import Link from "next/link";

// Form component for description based search
export default function RagForm() {
    const [description, setDescription] = useState<string>("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Saves recipes in locasl storage
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
    
    function sanitizeInput(input: string) {
        return input.replace(/[<>{};$]/g, "").trim();
      }

    function onDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDescription(e.target.value);
    }

    // Sanatizes user input and preforms description based search function from actions.ts
    async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const sanatizedDescription = sanitizeInput(description);
        setLoading(true); 
        
        const result = await SupabaseSearch(sanatizedDescription);
        setRecipes(result.topRecipes); 
        setLoading(false); 
    }

    return (
        <div className="flex flex-col items-center justify-center w-full gap-4">
             <div className="absolute top-4 right-4">
                <Link 
                    href="/saved"
                    className="text-blue-600 underline hover:text-blue-800 transition"
                >
                    View Saved Recipes
                </Link>
            </div>
            <form onSubmit={onFormSubmit}>
                <p>Input Description</p>
                <input 
                    className=" input shadow-lg focus:border-2 border-gray-300 px-5 py-2 rounded-xl w-56  outline-none" 
                    type="text" 
                    value={description}
                    onChange={onDescriptionChange}
                />
                <button className=" ml-3  p-1 cursor-pointer transition-all bg-blue-500 text-white px-3 py-1 rounded-lg
                                border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                                border-b-[4px]"
                        type="submit"
                        disabled={!description.trim()}
                >
                        Search
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