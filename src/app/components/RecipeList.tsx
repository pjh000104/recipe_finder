import React from 'react';
import { Recipe } from "../actions";
const RecipeList = ({ recipes }: {recipes: Recipe[]}) => {
  return (
    <div>
      <h2>Recipes:</h2>
      <ul>
        {recipes.map((recipe, index) => (
            <div key={index}>
                <li >{recipe.name}</li>
                <p>{recipe.steps}</p>
            </div>
        ))};
      </ul>
    </div>
  );
};

export default RecipeList;
