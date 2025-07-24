-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Create new simplified RLS policies for profiles
CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users" ON profiles
    FOR SELECT USING (auth.uid() = id OR true); -- Allow reading other profiles for business info

CREATE POLICY "Enable update for own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Ensure products policies allow viewing
DROP POLICY IF EXISTS "products_select_policy" ON products;
CREATE POLICY "products_select_policy" ON products
  FOR SELECT USING (true);

-- Ensure cart_items policies work correctly
DROP POLICY IF EXISTS "cart_items_select_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_insert_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_update_policy" ON cart_items;
DROP POLICY IF EXISTS "cart_items_delete_policy" ON cart_items;

CREATE POLICY "cart_items_select_policy" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
