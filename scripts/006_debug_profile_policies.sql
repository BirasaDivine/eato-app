-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Temporarily disable RLS for debugging (re-enable after testing)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_role enum exists
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;
