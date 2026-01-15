/**
 * Database functions for user calibration
 */

import { getDb } from "./db";
import { userCalibration, type UserCalibration, type NewUserCalibration } from "../drizzle/schema-calibration";
import { eq } from "drizzle-orm";

const db = await getDb();

/**
 * Get user calibration profile
 */
export async function getUserCalibration(userId: number): Promise<UserCalibration | null> {
  const [calibration] = await db
    .select()
    .from(userCalibration)
    .where(eq(userCalibration.userId, userId))
    .limit(1);
  
  return calibration || null;
}

/**
 * Save or update user calibration
 */
export async function saveUserCalibration(
  userId: number,
  data: Omit<NewUserCalibration, 'userId'>
): Promise<UserCalibration> {
  // Check if calibration exists
  const existing = await getUserCalibration(userId);
  
  if (existing) {
    // Update existing
    await db
      .update(userCalibration)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userCalibration.userId, userId));
    
    // Return updated
    const [updated] = await db
      .select()
      .from(userCalibration)
      .where(eq(userCalibration.userId, userId))
      .limit(1);
    
    return updated!;
  } else {
    // Insert new
    await db.insert(userCalibration).values({
      userId,
      ...data,
    });
    
    // Return inserted
    const [inserted] = await db
      .select()
      .from(userCalibration)
      .where(eq(userCalibration.userId, userId))
      .limit(1);
    
    return inserted!;
  }
}
