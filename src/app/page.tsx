"use server"
import Link from "next/link"

// Homepage of the software
export default async function Page() {
  return (
    <div className="flex flex-col justify-center min-h-screen items-center gap-10">
        <div className="absolute top-4 right-4">
            <Link 
                href="/saved"
                className="text-blue-600 underline hover:text-blue-800 transition"
            >
                View Saved Recipes
            </Link>
        </div>
      <h2 className=" text-5xl">
          Recipe Recommendation Application
      </h2>
      <div className="flex items-center justify-center  gap-6">

        <div className="w-[300px] px-4 py-5 bg-bg-gray-300 flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
          <Link href="/ingredients_based">
            Ingredients Based Search
          </Link>
        </div>
        <div className="w-[300px] px-4 py-5 bg-bg-gray-300 flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
          <Link href="/description_based">
            Description Based Search
          </Link>
        </div>

      </div>
    </div>

  )
}