import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { generateAccountNumber } from "@/lib/utils";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountNumber: varchar("account_number", { length: 3 })
    .notNull()
    .unique()
    .default(generateAccountNumber()),
  cardNumber: varchar("card_number", { length: 16 }).notNull().unique(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  address: text("address"),
  bankName: varchar("bank_name", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const createUserSchema = createInsertSchema(users);
