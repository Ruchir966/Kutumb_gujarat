import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { validate } from '../middleware/validate';

export const adminRouter = Router();

// --- Zod Schemas -------------------------------------------------------------

const CreateSchemeSchema = z.object({
  scheme_name: z.string().min(3, 'scheme_name must be at least 3 characters'),
  benefit_type: z.enum(['Individual', 'Household', 'Nuclear'], {
    errorMap: () => ({ message: "benefit_type must be 'Individual', 'Household', or 'Nuclear'" }),
  }),
  benefit_amount: z.string().min(1, 'benefit_amount is required'),
  description: z.string().optional(),
  constraints: z
    .object({
      max_income_limit: z.number().nonnegative().optional(),
      target_gender: z.enum(['male', 'female', 'other', 'all']).optional(),
      min_age: z.number().int().nonnegative().optional(),
      max_age: z.number().int().nonnegative().optional(),
      education_requirement: z.string().optional(),
    })
    .optional(),
});

// --- POST /api/admin/schemes --------------------------------------------------
// Dynamically create a new welfare scheme in the database.

adminRouter.post(
  '/schemes',
  validate(CreateSchemeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scheme_name, benefit_type, benefit_amount, description, constraints } = req.body;

      const payload: Record<string, unknown> = {
        scheme_name,
        benefit_type,
        benefit_amount,
        description: description ?? null,
      };

      // Flatten constraints into top-level columns
      if (constraints) {
        if (constraints.max_income_limit !== undefined) payload.max_income_limit = constraints.max_income_limit;
        if (constraints.target_gender !== undefined) payload.target_role = constraints.target_gender;
      }

      const { data, error } = await supabase.from('schemes').insert(payload).select().single();

      if (error) {
        const err = new Error(error.message) as any;
        err.statusCode = 500;
        return next(err);
      }

      res.status(201).json({ success: true, scheme: data });
    } catch (err) {
      next(err);
    }
  }
);

// --- GET /api/admin/metrics ---------------------------------------------------
// Aggregate dashboard statistics.

adminRouter.get('/metrics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [familiesRes, membersRes, applicationsRes] = await Promise.all([
      supabase.from('families').select('status'),
      supabase.from('members').select('aadhaar_number', { count: 'exact', head: true }),
      supabase.from('scheme_applications').select('application_id', { count: 'exact', head: true }),
    ]);

    if (familiesRes.error) throw new Error(familiesRes.error.message);

    const families = familiesRes.data ?? [];
    const statusCounts = families.reduce(
      (acc: Record<string, number>, f: { status: string }) => {
        const key = f.status ?? 'Unknown';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );

    res.json({
      success: true,
      metrics: {
        families: {
          total: families.length,
          by_status: statusCounts,
        },
        members: {
          total: membersRes.count ?? 0,
        },
        scheme_applications: {
          total: applicationsRes.count ?? 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});
