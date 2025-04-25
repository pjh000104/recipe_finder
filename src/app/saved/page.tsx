"use client";
import { useEffect, useState } from "react";
import { Recipe } from "../actions";

// Saved recipes page
export default function SavedRecipesPage() {
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("savedRecipes");
        if (stored) {
            setSavedRecipes(JSON.parse(stored));
        }
    }, []);

    const deleteRecipe = (name: string) => {
        const updated = savedRecipes.filter(recipe => recipe.name !== name);
        setSavedRecipes(updated);
        localStorage.setItem("savedRecipes", JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen p-6 flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-4">Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
                <p className="text-gray-500">No recipes saved yet.</p>
            ) : (
                <ul className="w-full max-w-xl space-y-4">
                    {savedRecipes.map((recipe, index) => (
                        <li key={index} className="p-4 border rounded shadow relative">
                            <p className="text-lg font-semibold mb-2">{recipe.name}</p>
                            <ul className="list-decimal list-inside mt-2 space-y-1">
                                {recipe.steps
                                    .match(/'(.*?)'/g)
                                    ?.map((step, i) => (
                                        <li key={i}>{step.slice(1, -1)}</li>
                                    ))}
                            </ul>
                            <button
                                onClick={() => deleteRecipe(recipe.name)}
                                className="absolute top-2 right-2 text-sm text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-100"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {savedRecipes.length > 0 && (
                <button
                    onClick={() => {
                        localStorage.removeItem("savedRecipes");
                        setSavedRecipes([]);
                    }}
                    className="mt-6 text-sm text-red-500 underline"
                >
                    Clear All
                </button>
            )}
        </div>
    );
}
