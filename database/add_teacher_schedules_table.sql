-- SQL script to add teacher_schedules table to Render database
-- This script is safe to run on production as it includes existence checks

-- Create teacher_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS teacher_schedules (
    id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    semester_id INTEGER REFERENCES semesters(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_teacher_id ON teacher_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_day_of_week ON teacher_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_semester_id ON teacher_schedules(semester_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedules_available ON teacher_schedules(is_available);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_teacher_schedules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'UTC';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_teacher_schedules_timestamp ON teacher_schedules;
CREATE TRIGGER trigger_update_teacher_schedules_timestamp
    BEFORE UPDATE ON teacher_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_teacher_schedules_timestamp();

-- Verify the table was created successfully
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_schedules') 
        THEN 'teacher_schedules table created successfully'
        ELSE 'Failed to create teacher_schedules table'
    END as result;
