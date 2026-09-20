import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const eligibilityRouter = Router();

// --- Helper: Calculate age from ISO date string -------------------------------
function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// --- GET /api/eligibility/evaluate/:family_id ---------------------------------
// Full deterministic scheme eligibility engine.

eligibilityRouter.get('/evaluate/:family_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { family_id } = req.params;

    // 1. Fetch family status - must be Approved
    const { data: family, error: familyErr } = await supabase
      .from('families')
      .select('family_id, status')
      .eq('family_id', family_id)
      .single();

    if (familyErr || !family) {
      res.status(404).json({ success: false, error: 'Family not found.' });
      return;
    }

    // 2. Fetch all members of this family
    const { data: members, error: membersErr } = await supabase
      .from('members')
      .select('aadhaar_number, full_name, gender, date_of_birth, relation_to_hof, individual_income, father_aadhaar, mother_aadhaar')
      .eq('family_id', family_id);

    if (membersErr || !members) {
      throw new Error('Failed to fetch family members.');
    }

    // 3. Fetch all schemes
    const { data: schemes, error: schemesErr } = await supabase
      .from('schemes')
      .select('scheme_id, scheme_name, benefit_type, benefit_amount, description, constraints');

    if (schemesErr || !schemes) {
      throw new Error('Failed to fetch schemes.');
    }

    // 4. Fetch already claimed scheme applications
    const { data: applications } = await supabase
      .from('scheme_applications')
      .select('scheme_id, applicant_aadhaar')
      .eq('family_id', family_id);

    const claimedMap = new Set(
      (applications ?? []).map((a: any) => `${a.scheme_id}:${a.applicant_aadhaar}`)
    );

    // 5. Compute household aggregate income
    const householdIncome = members.reduce((sum: number, m: any) => sum + (Number(m.individual_income) || 0), 0);

    // 6. Run eligibility rules per scheme
    const eligible: any[] = [];

    for (const scheme of schemes) {
      const constraints = scheme.constraints || {};
      const maxIncome: number | null = constraints.max_income_limit ?? null;
      const targetRole: string | null = constraints.target_gender ?? null;
      const minAge: number | null = constraints.min_age ?? null;
      const maxAge: number | null = constraints.max_age ?? null;
      const benefitType: string = scheme.benefit_type ?? 'Household';

      if (benefitType === 'Household') {
        // Check aggregate household income
        const incomeOk = maxIncome === null || householdIncome <= maxIncome;
        if (!incomeOk) continue;

        // Check if already claimed at the household level
        const claimed = (applications ?? []).some((a: any) => a.scheme_id === scheme.scheme_id);
        if (claimed) continue;

        eligible.push({
          scheme_id: scheme.scheme_id,
          scheme_name: scheme.scheme_name,
          benefit_type: scheme.benefit_type,
          benefit_amount: scheme.benefit_amount,
          description: scheme.description,
          qualifying_member: null,
          scope: 'Household',
          already_claimed: false,
        });
      } else {
        // Individual or Nuclear - evaluate per member
        for (const member of members) {
          const alreadyClaimed = claimedMap.has(`${scheme.scheme_id}:${member.aadhaar_number}`);
          if (alreadyClaimed) continue;

          // Income check
          let incomeToCheck = Number(member.individual_income) || 0;

          if (benefitType === 'Nuclear') {
            // Sum applicant + parents' incomes
            const fatherIncome = members.find((m: any) => m.aadhaar_number === member.father_aadhaar)?.individual_income ?? 0;
            const motherIncome = members.find((m: any) => m.aadhaar_number === member.mother_aadhaar)?.individual_income ?? 0;
            incomeToCheck += Number(fatherIncome) + Number(motherIncome);
          }

          const incomeOk = maxIncome === null || incomeToCheck <= maxIncome;
          if (!incomeOk) continue;

          // Gender check
          if (targetRole && targetRole.toLowerCase() !== 'all' && targetRole.toLowerCase() !== member.gender?.toLowerCase()) continue;

          // Age check
          const age = calculateAge(member.date_of_birth);
          if (age !== null) {
            if (minAge !== null && age < minAge) continue;
            if (maxAge !== null && age > maxAge) continue;
          }

          eligible.push({
            scheme_id: scheme.scheme_id,
            scheme_name: scheme.scheme_name,
            benefit_type: scheme.benefit_type,
            benefit_amount: scheme.benefit_amount,
            description: scheme.description,
            qualifying_member: {
              aadhaar_number: member.aadhaar_number,
              full_name: member.full_name,
              age,
              gender: member.gender,
              relation_to_hof: member.relation_to_hof,
            },
            scope: benefitType,
            already_claimed: false,
          });
        }
      }
    }

    res.json({
      success: true,
      family_id,
      family_status: family.status,
      household_income: householdIncome,
      member_count: members.length,
      eligible_schemes: eligible,
      eligible_count: eligible.length,
    });
  } catch (err) {
    next(err);
  }
});