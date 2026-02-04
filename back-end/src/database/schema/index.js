const { pgTable, text, timestamp, uuid } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
    // Generates a random UUID automatically on the database side
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

module.exports = { users };
