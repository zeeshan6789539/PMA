import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/database/schema/index.ts",
    out: "./src/database/migration",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
});
