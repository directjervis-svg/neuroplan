-- Add age verification fields for LGPD compliance
ALTER TABLE users ADD COLUMN birth_date DATE NULL;
ALTER TABLE users ADD COLUMN age_verified BOOLEAN DEFAULT FALSE NOT NULL;
