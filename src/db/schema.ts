import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Enums
export const types = pgEnum("type", ["income", "expense"]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "trialing",
]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().unique(),
  plaidId: text("plaid_id"),
  kindeId: text("kinde_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
  goals: many(goals),
  plaidItems: many(plaidItems),
}));

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripeProductId: text("stripe_product_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: subscriptionStatus("status").notNull(),
  productName: text("product_name"),
  priceAmount: numeric("price_amount", { precision: 10, scale: 2 }),
  currency: text("currency"),
  interval: text("interval"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  icon: text("icon"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const plaidItems = pgTable("plaid_items", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  accessToken: text("access_token").notNull(),
  transactionCursor: text("transaction_cursor"),
  bankName: text("bank_name"),
  institutionId: text("institution_id").notNull().unique(),
  logo: text("logo"),
  url: text("url"),
  isActive: boolean("is_active").notNull().default(true),
});

export const plaidItemsRelations = relations(plaidItems, ({ one, many }) => ({
  account: one(accounts, {
    fields: [plaidItems.accountId],
    references: [accounts.id],
  }),
  accounts: many(plaidAccounts),
  transactions: many(transactions),
}));

export const plaidAccounts = pgTable("plaid_accounts", {
  id: text("id").primaryKey(),
  itemId: text("item_id").references(() => plaidItems.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  plaidId: text("plaid_id").unique().notNull(),
});

export const plaidAccountsRelations = relations(plaidAccounts, ({ one, many }) => ({
  item: one(plaidItems, {
    fields: [plaidAccounts.itemId],
    references: [plaidItems.id],
  }),
  transactions: many(transactions),
}));

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  name: text("name"),
  date: timestamp("date", { mode: "date" }).notNull(),
  userId: text("user_id").notNull(),
  plaidId: text("plaid_id").unique(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  accountId: text("account_id").references(() => plaidAccounts.plaidId, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(plaidAccounts, {
    fields: [transactions.accountId],
    references: [plaidAccounts.plaidId],
  }),
}));

// Goals Table
export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  description: text("description"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  description: text("description"),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));
