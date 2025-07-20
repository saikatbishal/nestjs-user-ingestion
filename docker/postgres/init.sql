-- PostgreSQL Initialization Script for NestJS Document Ingestion System
-- This script will be executed when the PostgreSQL container starts for the first time
-- Create additional databases if needed
CREATE DATABASE nestjs_docs_test;
-- Create custom functions for better performance
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Performance optimizations
-- Set shared_preload_libraries in postgresql.conf for better performance
-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE nestjs_docs TO postgres;
GRANT ALL PRIVILEGES ON DATABASE nestjs_docs_test TO postgres;
-- Create indexes that will be useful for the application
-- These will be created by TypeORM migrations, but we prepare the database
-- Log the initialization
DO $$ BEGIN RAISE NOTICE 'NestJS Document Ingestion Database initialized successfully';
END $$;