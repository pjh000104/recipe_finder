# Recipe Recommendation System
This project is a simple yet powerful web-based **recipe suggestion system** built using **Retrieval-Augmented Generation (RAG)**. The system is designed to help users find creative and compatible recipes based on leftover ingredients, emphasizing **simplicity**, **usability**, and **personalization**.

##  Features

- **Ingredient & Keyword Search**: Input your ingredients or keywords to find matching recipes.
- **Description-Based Search**: Describe your cravings and let the system interpret and suggest options.
- **Favorites Page**: Save and manage your favorite recipes.


## Getting Started

Clone the github repository 
```bash
git clone https://github.com/pjh000104/recipe_finder.git
```
Run the following command to install dependencies

```bash
npm install
```

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Project Structure
```bash
.
├── .next/                
├── node_modules/         # Installed dependencies
├── public/               
src/
└── app/
    ├── components/                
    │   ├── form.tsx               # Ingredient input form
    │   ├── RagForm.tsx            # Form integrated with RAG
    │   └── RecipeList.tsx         # Displays recommended recipes
    │
    ├── description_based/         # Page for description-based search
    │   └── page.tsx
    │
    ├── ingredients_based/         # Page for ingredient-based search
    │   └── page.tsx
    │
    ├── lib/                       # Backend-related logic
    │   ├── db.ts                  # Database configuration or mock setup
    │   └── schema.ts              # Data schema or types
    │
    ├── saved/                     # Page for saved/favorite recipes
    │   └── page.tsx
    │
    ├── actions.ts                 # Server actions or logic handlers
    ├── favicon.ico               
    ├── globals.css                # Global CSS styles
    ├── layout.tsx                 # Global layout wrapper
    └── page.tsx                   # Home page or landing page
├── .env.local            # Environment variables
├── .gitattributes        # Git attributes config
├── .gitignore            # Files and folders to ignore in Git
├── README.md             # Project documentation
├── tsconfig.json         # TypeScript configuration
...
```
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

