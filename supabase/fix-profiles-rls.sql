-- ============================================
-- Fix profiles RLS: Allow authenticated users to view profiles
-- This is needed so sellers can see buyer info on messages
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop the old restrictive policy (only allowed viewing own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Replace with a policy that allows any authenticated user to view profiles
-- (needed so sellers can see buyer name/company/phone on messages)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
