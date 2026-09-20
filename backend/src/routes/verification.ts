import { Router } from 'express';

export const verificationRouter = Router();

// --- STREAMLINED FLOW ---------------------------------------------------------
// Note: Verification and Inter-Household Migration checks have been moved 
// directly to the frontend via Supabase to speed up the demo.
// Mock OTP and Verhoeff checksum validation have been removed per request.
