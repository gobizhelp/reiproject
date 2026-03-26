-- ============================================
-- Fix profiles RLS: Allow authenticated users to view profiles
-- This is needed so sellers can see buyer info on messages
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add policy to allow any authenticated user to view profiles
-- (The existing "Users can view own profile" policy is too restrictive
-- and prevents sellers from seeing buyer sender info on messages)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Authenticated users can view profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view profiles"
      ON profiles FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
