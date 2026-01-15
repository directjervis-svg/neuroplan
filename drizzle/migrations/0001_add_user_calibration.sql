-- Migration: Add user_calibration table
-- Description: Stores user preferences for adaptive task generation
-- Date: 2026-01-15

CREATE TABLE IF NOT EXISTS `user_calibration` (
  `user_id` INT PRIMARY KEY NOT NULL,
  `granularity_level` ENUM('macro', 'meso', 'micro') NOT NULL DEFAULT 'meso',
  `structuring_style` ENUM('top_down', 'bottom_up') NOT NULL DEFAULT 'top_down',
  `cognitive_capacity_minutes` INT NOT NULL DEFAULT 90,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for faster lookups
CREATE INDEX `idx_user_calibration_user_id` ON `user_calibration`(`user_id`);
