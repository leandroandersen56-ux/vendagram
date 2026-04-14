-- Fix is_verified for partners who already signed up
UPDATE profiles SET is_verified = true 
WHERE lower(email) IN (
  SELECT lower(email) FROM partners WHERE is_active = true
) AND is_verified = false;