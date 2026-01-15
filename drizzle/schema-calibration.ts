/**
 * User Calibration Schema
 * 
 * Stores user preferences for adaptive task generation:
 * - Granularity level (macro/meso/micro)
 * - Structuring style (top-down/bottom-up)
 * - Cognitive capacity (minutes of sustained focus)
 */

import { mysqlTable, int, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const userCalibration = mysqlTable('user_calibration', {
  userId: int('user_id').primaryKey().notNull(),
  granularityLevel: mysqlEnum('granularity_level', ['macro', 'meso', 'micro']).notNull().default('meso'),
  structuringStyle: mysqlEnum('structuring_style', ['top_down', 'bottom_up']).notNull().default('top_down'),
  cognitiveCapacityMinutes: int('cognitive_capacity_minutes').notNull().default(90), // 1-2h default
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type UserCalibration = typeof userCalibration.$inferSelect;
export type NewUserCalibration = typeof userCalibration.$inferInsert;
