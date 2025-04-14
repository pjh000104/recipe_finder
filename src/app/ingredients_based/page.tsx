"use server"
import Form from "../components/form"


export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-3">
        <h2 className="text-5xl">Ingredients Based Search</h2>
        <p>Enter the ingredients you have and keywords to search for the recipe</p>
        <div>
            <Form></Form>
        </div>
        
    </div>

  )
}