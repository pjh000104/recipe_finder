"use server"
import Form from "./components/form"

// export default async function Page() {
//   const sampleRecipes = ['oil', 'onion'];
//   const keywords = "healthy, vegan"
//   const recipes = await searchRecipes(sampleRecipes,keywords);

//   return (
//     <div>
//       <h1>Recipes</h1>
//       {recipes.length > 0 ? (
//         <ul>
//           {recipes.map((recipe) => (
//             <li key={recipe.id}>
//               <h2>{recipe.name}</h2>
//               <p>{recipe.ingredients}</p>
//               <p>{recipe.extraIngredientsCount}</p>
              
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No recipes found.</p>
//       )}
//     </div>
//   );
// }

export default async function Page() {
  return (
    <Form></Form>
  )
}