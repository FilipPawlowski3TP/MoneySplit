-- Update user names for existing users
-- This migration updates the names in the profiles table for specific users

-- Update name for tmflyg@emailgen.uk to Filip
UPDATE profiles
SET name = 'Filip', updated_at = NOW()
WHERE email = 'tmflyg@emailgen.uk';

-- Update name for memaf71341@wacold.com to Janek
UPDATE profiles
SET name = 'Janek', updated_at = NOW()
WHERE email = 'memaf71341@wacold.com';



