"use client"
import { testSupabaseSearch } from '@/app/actions';

export default function SamplePage() {
  async function handleSearch() {
    try {
      const result = await testSupabaseSearch("healthy chicken dish");
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <button onClick={handleSearch}>Test Search</button>
    </div>
  );
}