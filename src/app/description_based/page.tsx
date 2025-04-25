"use server"
import RagForm from "../components/RagForm"

// Description baesd search page
export default async function Page() {

  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-3">
      <h2 className="text-5xl">Description Based Search</h2>
      <p>Enter the description of the dish you want to make</p>
      <div className="w-full flex justify-center">
        <RagForm></RagForm>
      </div>
    </div>

  )
}