/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./src/database/schema/index.js",
    out: "./src/database/migration",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    }
};
