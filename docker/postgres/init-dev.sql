-- PostgreSQL Development Initialization Script
-- Create development and test databases
CREATE DATABASE nestjs_docs_dev;
CREATE DATABASE nestjs_docs_test;
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Create custom functions
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nestjs_docs_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE nestjs_docs_test TO postgres;
-- Create some sample data for development (optional)
\ c nestjs_docs_dev;
-- Log the initialization
DO $$ BEGIN RAISE NOTICE 'Development database initialized successfully';
END $$;