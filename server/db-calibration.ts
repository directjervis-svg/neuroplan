/**
 * Database functions for user calibration
 */

import { getDb } from "./db";
import { userCalibration, type UserCalibration, type NewUserCalibration } from "../drizzle/schema-calibration";
import { eq } from "drizzle-orm";

let dbInstance: Awaited<ReturnType<typeof getDb>> | null = null;

async function getDbInstance() {
  if (!dbInstance) {
    dbInstance = await getDb();
  }
  return dbInstance;
}

/**
 * Get user calibration profile
 */
export async function getUserCalibration(userId: number): Promise<UserCalibration | null> {
  const db = await getDbInstance();
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
  const db = await getDbInstance();
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
