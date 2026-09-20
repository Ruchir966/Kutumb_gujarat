import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { validate } from '../middleware/validate';

export const familyRouter = Router();

// --- Zod Schema ---------------------------------------------------------------

const SplitSchema = z.object({
  source_family_id: z.string().min(1, 'source_family_id is required'),
  new_hof_aadhaar: z.string().regex(/^\d{12}$/, 'new_hof_aadhaar must be exactly 12 numeric digits'),
  migrating_member_ids: z
    .array(z.string().regex(/^\d{12}$/, 'Each member ID must be a 12-digit Aadhaar'))
    .min(1, 'At least one member must be migrating'),
  new_address: z.string().min(5, 'new_address must be at least 5 characters'),
});

// --- POST /api/family/split ---------------------------------------------------
// Atomically splits a family household into a new registered unit.

familyRouter.post(
  '/split',
  validate(SplitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { source_family_id, new_hof_aadhaar, migrating_member_ids, new_address } = req.body;

      // 1. Verify source family exists
      const { data: sourceFamily, error: sourceFamilyErr } = await supabase
        .from('families')
        .select('family_id, status')
        .eq('family_id', source_family_id)
        .single();

      if (sourceFamilyErr || !sourceFamily) {
        res.status(404).json({ success: false, error: `Source family '${source_family_id}' not found.` });
        return;
      }

      // 2. Verify the new HoF exists and belongs to the source family
      const { data: newHof, error: hofErr } = await supabase
        .from('members')
        .select('aadhaar_number, full_name, family_id')
        .eq('aadhaar_number', new_hof_aadhaar)
        .single();

      if (hofErr || !newHof) {
        res.status(404).json({ success: false, error: `New Head of Family Aadhaar '${new_hof_aadhaar}' not found.` });
        return;
      }

      if (newHof.family_id !== source_family_id) {
        res.status(400).json({ success: false, error: 'New Head of Family does not belong to the source family.' });
        return;
      }

      // Ensure new HoF is in migrating list
      if (!migrating_member_ids.includes(new_hof_aadhaar)) {
        migrating_member_ids.push(new_hof_aadhaar);
      }

      // 3. Generate new Family ID
      const newFamilyId = `GUJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Insert new family record
      const { error: insertFamilyErr } = await supabase.from('families').insert({
        family_id: newFamilyId,
        address: new_address,
        status: 'Approved',
        ration_card_number: null,
      });

      if (insertFamilyErr) {
        throw new Error(`Failed to create new family: ${insertFamilyErr.message}`);
      }

      // 5. Migrate members — update their family_id
      const { error: migrateErr } = await supabase
        .from('members')
        .update({ family_id: newFamilyId })
        .in('aadhaar_number', migrating_member_ids);

      if (migrateErr) {
        // Attempt rollback
        await supabase.from('families').delete().eq('family_id', newFamilyId);
        throw new Error(`Failed to migrate members: ${migrateErr.message}`);
      }

      // 6. Set new HoF relation_to_hof = 'Self'
      const { error: hofUpdateErr } = await supabase
        .from('members')
        .update({ relation_to_hof: 'Self' })
        .eq('aadhaar_number', new_hof_aadhaar);

      if (hofUpdateErr) {
        throw new Error(`Failed to update new Head of Family: ${hofUpdateErr.message}`);
      }

      // 7. Fetch updated member data to return
      const { data: updatedMembers } = await supabase
        .from('members')
        .select('aadhaar_number, full_name, relation_to_hof, gender')
        .eq('family_id', newFamilyId);

      res.status(201).json({
        success: true,
        message: `Family successfully split. New family '${newFamilyId}' created.`,
        new_family_id: newFamilyId,
        new_hof: { aadhaar_number: new_hof_aadhaar, full_name: newHof.full_name },
        migrated_members: updatedMembers ?? [],
      });
    } catch (err) {
      next(err);
    }
  }
);
