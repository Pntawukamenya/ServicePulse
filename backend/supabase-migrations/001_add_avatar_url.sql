-- Add avatar_url column to users table for Cloudinary profile picture URLs
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
