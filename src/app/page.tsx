"use server"
import Link from "next/link"
export default async function Page() {
  return (
    <div>
      <Link href="/ingredients_based">
        Ingredients Based Search
      </Link>
      <Link href="/description_based">
        Description Based Search
      </Link>
    </div>
  )
}