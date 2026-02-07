import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { roles } from "./roles-permissions";

export const users = pgTable("users", {
    // Generates a random UUID automatically on the database side
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    roleId: uuid("roleId").references(() => roles.id),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});
