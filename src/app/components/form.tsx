"use client";
import { searchRecipes, Recipe } from "../actions";
import { useState } from "react";
import RecipeList from "./RecipeList";
import Link from "next/link";

export default function Form() {
    const [ingredients, setIngredients] = useState<string>("");
    const [keywords, setKeywords] = useState<string>("");
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

    function sanitizeInput(input: string) {
        return input.replace(/[<>{};$]/g, "").trim();
      }

    function onIngredientsChange(e: React.ChangeEvent<HTMLInputElement>) {
        setIngredients(e.target.value);
    }

    function onKeywordsChange(e: React.ChangeEvent<HTMLInputElement>) {
        setKeywords(e.target.value);
    }

    async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true); // Set loading to true before fetching
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes); // Store recipes in state
        setLoading(false); // Set loading to false after fetching
    }

    async function fetchRecipes() {
        const sanitizedIngredients = sanitizeInput(ingredients);
        const sanitizedKeywords = sanitizeInput(keywords);

        const ingredientsList = sanitizedIngredients.split(",").map(ingredient => ingredient.trim());
        return await searchRecipes(ingredientsList, sanitizedKeywords);
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
            <form onSubmit={onFormSubmit} >
                <p>Input ingredients</p>

                <input
                    className=" input shadow-lg focus:border-2 border-gray-300 px-5 py-2 rounded-xl w-56  outline-none" 
                    type="text" 
                    value={ingredients} 
                    onChange={onIngredientsChange} 
                />
                <p>Input keywords</p>
                <input 
                    className="input shadow-lg focus:border-2 border-gray-300 px-5 py-2 rounded-xl w-56  outline-none"
                    type="text" 
                    value={keywords} 
                    onChange={onKeywordsChange} 
                />
                <button className=" ml-3  p-1 cursor-pointer transition-all bg-blue-500 text-white px-3 py-1 rounded-lg
                                border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                                border-b-[4px]" type="submit"
                                disabled={!ingredients.trim()}
                                
                >
                    Search
                </button>
            </form>


            {loading && <p>Loading recipes...</p>}

            {saveMessage && (
            <p className="text-green-600 font-medium">{saveMessage}</p>
            )}
            
            {!loading && recipes.length > 0 && (
                <RecipeList recipes = {recipes} onRecipeClick={handleRecipeClick}/>
            )}
        </div>
    );
}
