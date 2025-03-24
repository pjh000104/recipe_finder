import { searchRecipes} from "./actions";

export default async function Page() {
  const sampleRecipes = ['oil', 'onion'];
  const keywords = "healthy, vegan"
  const recipes = await searchRecipes(sampleRecipes);

  return (
    <div>
      <h1>Recipes</h1>
      {recipes.length > 0 ? (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <h2>{recipe.name}</h2>
              <p>{recipe.ingredients}</p>
              <p>{recipe.extraIngredientsCount}</p>
              
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
}