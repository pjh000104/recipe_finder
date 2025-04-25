import React from 'react';
import { Recipe } from "../actions";

// List component that displays the list of recipes
const parseSteps = (stepsStr: string): string[] => {
  const matches = stepsStr.match(/'(.*?)'/g);
  if (!matches) return [];

  return matches.map(step => step.slice(1, -1)); // remove the surrounding quotes
};


const RecipeList = ({recipes, onRecipeClick,}: {recipes: Recipe[];onRecipeClick: (recipe: Recipe) => void;}) => {
  return (
    <div>
      <h2>Recipes:</h2>
      <ul>
        {recipes.map((recipe, index) => {
          const steps = parseSteps(recipe.steps);

          return (
            <li key={index} 
              className="mb-4 p-3 border rounded">
              <p className="font-bold text-lg">{recipe.name}</p>
              <button onClick={() => onRecipeClick(recipe)} className='bg-amber-400 px-1'>Save Recipe</button>
              <p>Ingredients: {recipe.ingredients.slice(1,-1)}</p>
              <ul className="list-decimal list-inside mt-2 space-y-1">
                {steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecipeList;
