"use server"
import Form from "../components/form"

// Ingredients/keywords based search page
export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-3">
        <h2 className="text-5xl">Ingredients Based Search</h2>
        <p>Enter the ingredients you have (comma separated) and keywords to search for recipes</p>
        <div>
            <Form></Form>
        </div>
        
    </div>

  )
}