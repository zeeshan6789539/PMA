import { defineConfig } from "drizzle-kit";

import { DATABASE_URL } from "../utils/constant.ts";

export default defineConfig({
    schema: "./src/database/schema/index.ts",
    out: "./src/database/migration",
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL,
    }
});
