-- Database initialization script for Beginnings freelancing marketplace
-- This script sets up the initial database structure and permissions

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'FREELANCER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'UNPAID', 'TRIALING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO subscription_plans (name, description, price, interval, features, stripe_price_id, created_at, updated_at)
VALUES
    ('Free', 'Basic features for getting started', 0, 'month', '["Up to 3 projects", "Basic support", "Community access"]', 'price_free', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Pro', 'Professional features for growing businesses', 29.99, 'month', '["Unlimited projects", "Priority support", "Advanced analytics", "Custom integrations"]', 'price_pro_monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Enterprise', 'Full-featured solution for large teams', 99.99, 'month', '["Everything in Pro", "Dedicated support", "Custom development", "SLA guarantee"]', 'price_enterprise_monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Create function for cleaning up old data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old completed projects after 2 years
    DELETE FROM projects WHERE status = 'COMPLETED' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '2 years';

    -- Delete old messages after 1 year
    DELETE FROM messages WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';

    -- Log cleanup
    RAISE NOTICE 'Cleanup completed at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA public TO beginnings_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO beginnings_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO beginnings_user;
