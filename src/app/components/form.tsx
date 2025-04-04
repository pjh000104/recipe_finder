"use client";
import { searchRecipes,Recipe } from "../actions";
import { useState } from "react";

export default function Form() {
    const [ingredients, setIngredients] = useState<string>("");
    const [keywords, setKeywords] = useState<string>("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

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
        const ingredientsList = ingredients.split(",").map(ingredient => ingredient.trim());
        return await searchRecipes(ingredientsList, keywords);
    }

    return (
        <div>
            <form onSubmit={onFormSubmit}>
                <p>Input ingredients</p>
                <input 
                    type="text" 
                    value={ingredients} 
                    onChange={onIngredientsChange} 
                />
                <p>Input keywords</p>
                <input 
                    type="text" 
                    value={keywords} 
                    onChange={onKeywordsChange} 
                />
                <button type="submit">Submit</button>
            </form>

            {loading && <p>Loading recipes...</p>}

            {!loading && recipes.length > 0 && (
                <div>
                    <h2>Recipes:</h2>
                    <ul>
                        {recipes.map((recipe, index) => (
                            <li key={index}>{recipe.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
