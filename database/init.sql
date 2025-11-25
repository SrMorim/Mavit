-- Database initialization script for Mavit
-- This script creates the initial database structure with security focus

-- Create database extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database extension for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security by default for all tables
-- This ensures data isolation between users (Zero-Trust architecture)

-- The actual table creation will be handled by Prisma migrations
-- This init script just sets up the basic database configuration

-- Create a function to automatically set updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant necessary permissions to the mavit_user
GRANT ALL PRIVILEGES ON DATABASE mavit_db TO mavit_user;
GRANT ALL ON SCHEMA public TO mavit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mavit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mavit_user;

-- Set timezone to UTC for consistent timestamps
SET timezone = 'UTC';