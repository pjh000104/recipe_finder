'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { getFiveRecipes } from '@/app/actions';

interface Recipe {
  id: number;
  name: string;
  minutes: number;
  tags: string;
  nutrition: string;
  n_steps: number;
  steps: string;
  description: string;
  ingredients: string;
  n_ingredients: number;
  tags_embedding: string;
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getFiveRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div>
      <h1>Recipes</h1>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <h2>{recipe.name}</h2>
            <p>Cooking Time: {recipe.minutes} minutes</p>
            <p>Tags: {recipe.tags}</p>
            <p>Nutrition: {recipe.nutrition}</p>
            <p>Steps: {recipe.steps}</p>
            <p>Description: {recipe.description}</p>
            <p>Ingredients: {recipe.ingredients}</p>
            <p>Number of Ingredients: {recipe.n_ingredients}</p>
            <p>Tags Embedding: {recipe.tags_embedding}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}