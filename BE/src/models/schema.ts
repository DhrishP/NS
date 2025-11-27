import { pgTable, text, serial, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const nodes = pgTable('nodes', {
  id: text('id').primaryKey(), // ENS Name
  data: jsonb('data'), // Store avatar, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  source: text('source').references(() => nodes.id, { onDelete: 'cascade' }),
  target: text('target').references(() => nodes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

