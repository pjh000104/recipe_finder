"use server"
import RagForm from "../components/RagForm"

export default async function Page() {

  return (
    <div>
      <h2>Description Based Search</h2>
      <RagForm></RagForm>
    </div>

  );
}