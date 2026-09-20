import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { User, Users, GraduationCap, Flame, Home, CheckCircle, Clock, ShieldCheck, AlertTriangle, Settings, Trash2, SplitSquareHorizontal, X, MapPin, Plus, IdCard, IndianRupee, Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabase";

const IconMap: Record<string, any> = {
  GraduationCap: <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />,
  Flame: <Flame className="h-8 w-8 text-orange-500 mb-3" />,
  Home: <Home className="h-8 w-8 text-green-600 mb-3" />
};

export function CitizenDashboard() {
  const [familyId, setFamilyId] = useState("GUJ-2026-001");
  const [status, setStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [showToast, setShowToast] = useState("");

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [schemesList, setSchemesList] = useState<any[]>([]);
  const [appliedSchemes, setAppliedSchemes] = useState<string[]>([]);
  const [activeApps, setActiveApps] = useState<any[]>([]);

  // Modals State
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [removeReason, setRemoveReason] = useState("");

  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitStep, setSplitStep] = useState(1);
  const [selectedSplitIds, setSelectedSplitIds] = useState<string[]>([]);
  const [splitHeadId, setSplitHeadId] = useState("");
  const [splitRoles, setSplitRoles] = useState<Record<string, string>>({});

  const [isSplitSuccess, setIsSplitSuccess] = useState(false);
  const [newFamilyId, setNewFamilyId] = useState("");
  const [splitAddress, setSplitAddress] = useState("");
  const [splitCity, setSplitCity] = useState("");
  const [splitPincode, setSplitPincode] = useState("");

  // ── Add Member State ───────────────────────────────────────────
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Identity
  const [ekycId, setEkycId] = useState("");
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);

  // Details
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberDob, setNewMemberDob] = useState("");
  const [newMemberGender, setNewMemberGender] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("Son");
  const [newMemberIncome, setNewMemberIncome] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const resetAddMemberModal = () => {
    setEkycId(""); setIsIdVerified(false);
    setIsTransfer(false); setTransferFromFamilyId(""); setMaskedTransferFamilyId("");
    setNewMemberName(""); setNewMemberDob(""); setNewMemberGender("");
    setNewMemberRelation("Son"); setNewMemberIncome("");
  };

  // Transfer state
  const [isTransfer, setIsTransfer] = useState(false);
  const [transferFromFamilyId, setTransferFromFamilyId] = useState("");
  const [maskedTransferFamilyId, setMaskedTransferFamilyId] = useState("");

  const fetchData = async (fid: string) => {
    try {
      const { data: family } = await supabase.from('families').select('*').eq('family_id', fid).single();
      if (family) setStatus(family.status);

      const { data: members } = await supabase.from('members').select('*').eq('family_id', fid);
      if (members) {
        const mapped = members.map((m: any) => {
          let age = 0;
          if (m.date_of_birth) {
            const dob = new Date(m.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
              age--;
            }
          }
          return {
            id: m.aadhaar_number,
            name: m.full_name,
            relation: m.relation_to_hof === 'Self' ? 'Head of Family' : m.relation_to_hof,
            nationalId: m.aadhaar_number,
            age: age
          };
        });
        mapped.sort((a, b) => (a.relation === "Head of Family" ? -1 : 1));
        setFamilyMembers(mapped);
      }

      try {
        const res = await fetch(`/api/eligibility/evaluate/${fid}`);
        const result = await res.json();
        if (result.success && result.eligible_schemes) {
           const mappedSchemes = result.eligible_schemes.map((s: any, index: number) => ({
             id: String(s.scheme_id),
             unique_id: `${s.scheme_id}-${s.qualifying_member?.aadhaar_number || 'household'}-${index}`,
             title: s.scheme_name,
             amount: s.benefit_amount,
             description: s.description,
             applicable_for: s.qualifying_member?.full_name || 'Household',
             tag: s.benefit_type,
             icon: s.benefit_type === 'Housing' ? 'Home' : s.benefit_type === 'Individual' ? 'GraduationCap' : 'Flame',
             qualifying_aadhaar: s.qualifying_member?.aadhaar_number || ''
           }));
           setSchemesList(mappedSchemes);
        }
      } catch (err) {
        console.error("Eligibility Engine error:", err);
      }

      const { data: apps } = await supabase
        .from('scheme_applications')
        .select(`application_id, scheme_id, applicant_aadhaar, status, applied_at, schemes(scheme_name)`)
        .eq('family_id', fid)
        .order('applied_at', { ascending: false });
      
      if (apps) {
        setAppliedSchemes(apps.map((a: any) => `${a.scheme_id}-${a.applicant_aadhaar || 'household'}`));
        setActiveApps(apps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const sessionFid = sessionStorage.getItem('activeFamilyId');
    if (!sessionFid) {
      window.location.href = "/login";
      return;
    }
    setFamilyId(sessionFid);
    fetchData(sessionFid);
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    await supabase.from('members').delete().eq('aadhaar_number', memberToRemove.id);
    setFamilyMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
    setMemberToRemove(null);
    setShowToast("Member removed from household records.");
  };

  const handleSplitSubmit = async () => {
    const newId = `GUJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAddress = `${splitAddress}, ${splitCity} - ${splitPincode}`;

    await supabase.from('families').insert({
      family_id: newId,
      address: fullAddress,
      status: 'Approved'
    });

    for (const id of selectedSplitIds) {
      const isHead = id === splitHeadId;
      const relation = isHead ? "Self" : splitRoles[id];
      await supabase.from('members').update({ family_id: newId, relation_to_hof: relation }).eq('aadhaar_number', id);
    }

    setNewFamilyId(newId);
    setIsSplitOpen(false);
    setIsSplitSuccess(true);
  };

  const handleGoToNewFamily = () => {
    sessionStorage.setItem('activeFamilyId', newFamilyId);
    setFamilyId(newFamilyId);
    fetchData(newFamilyId);
    setIsSplitSuccess(false);
  };

  const handleApplyScheme = async (scheme: any) => {
    const head = familyMembers.find(m => m.relation === "Head of Family");
    const applicantAadhaar = scheme.qualifying_aadhaar || head?.nationalId || "";
    await supabase.from('scheme_applications').insert({
      family_id: familyId,
      scheme_id: Number(scheme.id),
      applicant_aadhaar: applicantAadhaar,
      status: "Applied"
    });
    setAppliedSchemes(prev => [...prev, `${scheme.id}-${applicantAadhaar || 'household'}`]);
    fetchData(familyId);
    setShowToast("Application submitted successfully.");
  };

  // ── Verify ID ───────────────────────────────────────────
  const handleVerifyId = async () => {
    if (ekycId.length !== 12) return;
    setIsVerifyingId(true);
    try {
      const { data: existing } = await supabase
        .from('members')
        .select('aadhaar_number, family_id')
        .eq('aadhaar_number', ekycId)
        .maybeSingle();

      if (existing) {
        // ── TRANSFER PATH
        const masked = 'GUJ-****-' + (existing.family_id as string).slice(-4);
        setIsTransfer(true);
        setTransferFromFamilyId(existing.family_id);
        setMaskedTransferFamilyId(masked);
      } else {
        // ── NEW MEMBER PATH
        setIsTransfer(false);
        setTransferFromFamilyId("");
        setMaskedTransferFamilyId("");
      }
      setIsIdVerified(true);
    } catch (e: any) {
      alert("Error verifying ID: " + e.message);
    } finally {
      setIsVerifyingId(false);
    }
  };

  // ── Link to Household (INSERT or UPDATE) ────────────────────
  const handleLinkToHousehold = async () => {
    if (!isTransfer && (!newMemberName.trim() || !newMemberDob || !newMemberGender)) return;
    setIsLinking(true);
    try {
      if (isTransfer) {
        // ── TRANSFER: UPDATE existing member row ───────────────────────────
        const { error } = await supabase
          .from('members')
          .update({
            family_id: familyId,
            relation_to_hof: newMemberRelation,
          })
          .eq('aadhaar_number', ekycId);
        if (error) { alert("Transfer failed: " + error.message); return; }
        await fetchData(familyId);
        setIsAddMemberOpen(false);
        resetAddMemberModal();
        setShowToast("Member successfully transferred from their previous household.");
      } else {
        // ── NEW MEMBER: INSERT ─────────────────────────────────────────────
        const age = new Date().getFullYear() - new Date(newMemberDob).getFullYear();
        const { error } = await supabase.from('members').insert({
          family_id: familyId,
          full_name: newMemberName.trim(),
          aadhaar_number: ekycId,
          relation_to_hof: newMemberRelation,
          gender: newMemberGender,
          date_of_birth: newMemberDob,
          age,
          individual_income: Number(newMemberIncome) || 0,
        });
        if (error) { alert("Failed to add member: " + error.message); return; }
        await fetchData(familyId);
        setIsAddMemberOpen(false);
        resetAddMemberModal();
        setShowToast("New member successfully linked to household.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 w-full px-4 pb-16 relative">

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in-up flex items-center gap-3 border border-slate-700">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{showToast}</span>
        </div>
      )}



      {/* Top Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
          <Users className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h2 className="text-blue-100 font-medium mb-1">Your Unified Family ID</h2>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{familyId}</h1>
              <div className={`border px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium backdrop-blur-md ${status === 'Approved' ? 'bg-green-500/20 text-green-100 border-green-400/30' :
                  status === 'Pending' ? 'bg-amber-500/20 text-amber-100 border-amber-400/30' :
                    'bg-red-500/20 text-red-100 border-red-400/30'
                }`}>
                {status === 'Approved' && <CheckCircle className="w-4 h-4" />}
                {status === 'Pending' && <Clock className="w-4 h-4" />}
                {status === 'Rejected' && <AlertTriangle className="w-4 h-4" />}
                {status}
              </div>
            </div>
            <p className="mt-4 text-blue-100 max-w-lg">
              This ID represents your family unit and provides 1-click access to all eligible state and central government schemes.
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Status Banner */}
      <div className="mb-10 animate-fade-in-up">
        {status === 'Pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-0.5"><Clock className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-amber-900">Verification in Progress</h3>
              <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                Your household details have been submitted and are pending field verification by your local Gram Panchayat/BDO. Scheme applications will unlock upon approval.
              </p>
            </div>
          </div>
        )}
        {status === 'Approved' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-0.5"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-emerald-900">Verified Household ID</h3>
              <p className="text-emerald-800 text-sm mt-1 leading-relaxed">
                Your family data is cryptographically secured and approved for proactive benefit matching.
              </p>
            </div>
          </div>
        )}
        {status === 'Rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
            <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-0.5"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-red-900">Application Rejected</h3>
              <p className="text-red-800 text-sm mt-1 leading-relaxed">
                There was a discrepancy in your household data. Please visit the nearest Common Service Center (CSC) to resolve this issue.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Visual Tree */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Family Overview</h2>
          <div className="flex gap-3">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="w-4 h-4" /> Add Member
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-300 text-slate-700 bg-white shadow-sm" onClick={() => setIsManageOpen(true)}>
              <Settings className="w-4 h-4" /> Manage Family
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {familyMembers.map((member, i) => (
            <Card key={member.id} className="relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-transparent hover:border-t-blue-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-full ${member.relation === 'Head of Family' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    <User className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${member.relation === 'Head of Family' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                    {member.relation}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{member.name}</h3>
                <div className="text-sm text-slate-500 space-y-1">
                  <p>ID: <span className="font-medium text-slate-700">{member.nationalId}</span></p>
                  <p>Age: {member.age} yrs</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Section: Matched Schemes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Schemes You Are Eligible For</h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Proactive Matching Active</span>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 -mx-4 px-4 snap-x">
          {schemesList.map((scheme, i) => {
            const checkId = `${scheme.id}-${scheme.qualifying_aadhaar || 'household'}`;
            const hasApplied = appliedSchemes.includes(checkId);
            return (
              <Card key={i} className={`min-w-[320px] max-w-[320px] snap-center shrink-0 transition-all duration-300 hover:shadow-xl border border-slate-200 flex flex-col ${status !== 'Approved' ? 'opacity-80' : 'hover:-translate-y-1'}`}>
                <CardContent className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className={status !== 'Approved' ? 'grayscale opacity-70' : ''}>{IconMap[scheme.icon] || IconMap.Home}</div>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {scheme.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{scheme.title}</h3>
                  <div className={`text-xl font-black mb-3 ${status !== 'Approved' ? 'text-slate-400' : 'text-orange-600'}`}>{scheme.amount}</div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{scheme.description}</p>
                  <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 font-medium">
                    Applicable for: <span className="text-slate-900">{scheme.applicable_for}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 border-t border-slate-100 mt-auto">
                  <Button
                    className={`w-full text-white mt-4 shadow-sm ${status === 'Approved' && !hasApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                    disabled={status !== 'Approved' || hasApplied}
                    onClick={() => handleApplyScheme(scheme)}
                  >
                    {hasApplied ? 'Applied' : status === 'Pending' ? 'Locked (Pending)' : status === 'Rejected' ? 'Unavailable' : '1-Click Apply'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Active Applications Section */}
      <div className="mt-12 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Active Applications</h2>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">App ID</th>
                  <th className="px-6 py-4 font-medium">Scheme Name</th>
                  <th className="px-6 py-4 font-medium">Applied On</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeApps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No active applications.</td>
                  </tr>
                ) : activeApps.map((app, i) => (
                  <tr key={i} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">APP-{app.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{app.schemes?.scheme_name || "Unknown Scheme"}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                        app.status === 'Disbursed' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                        app.status === 'Under Review' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {app.status || 'Applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MANAGE FAMILY MODAL */}
      {isManageOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Manage Household Members</h3>
              <button onClick={() => setIsManageOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              {familyMembers.map(m => (
                <div key={m.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{m.relation}</p>
                  </div>
                  {m.relation !== 'Head of Family' && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => { setMemberToRemove(m); setIsManageOpen(false); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12" onClick={() => { setIsManageOpen(false); setIsSplitOpen(true); setSplitStep(1); setSelectedSplitIds([]); }}>
                <SplitSquareHorizontal className="w-4 h-4 mr-2" /> Split Household / Move Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MEMBER DIALOG */}
      {memberToRemove && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Remove Member from Household</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">You are about to remove <b className="text-slate-900">{memberToRemove.name}</b>.</p>
              <div className="space-y-2">
                <Label>Reason for Removal</Label>
                <select className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={removeReason} onChange={e => setRemoveReason(e.target.value)}>
                  <option value="">Select a reason...</option>
                  <option value="marriage">Marriage / Relocation to another household</option>
                  <option value="deceased">Deceased</option>
                  <option value="duplicate">Duplicate Entry</option>
                </select>
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-medium flex gap-2 border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Removing a member will update your household benefit calculations immediately.
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3 border-t border-slate-100 bg-slate-50">
              <Button variant="outline" onClick={() => { setMemberToRemove(null); setRemoveReason(""); }}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={!removeReason} onClick={handleRemoveConfirm}>Confirm Removal</Button>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT HOUSEHOLD WIZARD */}
      {isSplitOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in-up flex flex-col max-h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Split Household</h3>
              <button onClick={() => setIsSplitOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
              {splitStep === 1 && (
                <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  <h4 className="font-bold text-slate-800 text-lg">Step 1: Who is moving out?</h4>
                  <p className="text-sm text-slate-500">Select the members migrating to a new physical address.</p>
                  <div className="space-y-3 mt-4">
                    {familyMembers.map(m => (
                      <label key={m.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedSplitIds.includes(m.id) ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" checked={selectedSplitIds.includes(m.id)} onChange={(e) => {
                          if (e.target.checked) setSelectedSplitIds(p => [...p, m.id]);
                          else setSelectedSplitIds(p => p.filter(id => id !== m.id));
                        }} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{m.relation}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {splitStep === 2 && (
                <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  <h4 className="font-bold text-slate-800 text-lg">Step 2: Designate Head & Roles</h4>
                  <p className="text-sm text-slate-500">Assign the roles for the new independent family unit.</p>
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label>Who is the new Head of Family?</Label>
                      <select className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={splitHeadId} onChange={e => {
                        setSplitHeadId(e.target.value);
                        setSplitRoles(prev => ({ ...prev, [e.target.value]: "Head of Family" }));
                      }}>
                        <option value="">Select a member...</option>
                        {familyMembers.filter(m => selectedSplitIds.includes(m.id)).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {splitHeadId && selectedSplitIds.length > 1 && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <Label>Set relations to the new Head of Family</Label>
                        {selectedSplitIds.map(id => {
                          if (id === splitHeadId) return null;
                          const member = familyMembers.find(m => m.id === id);
                          return (
                            <div key={id} className="grid grid-cols-2 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-sm font-medium text-slate-700">{member?.name}</span>
                              <select className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={splitRoles[id] || ''} onChange={e => setSplitRoles(prev => ({ ...prev, [id]: e.target.value }))}>
                                <option value="">Select relation...</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Parent">Parent</option>
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {splitStep === 3 && (
                <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  <h4 className="font-bold text-slate-800 text-lg">Step 3: New Address</h4>
                  <p className="text-sm text-slate-500">Where is the new family unit relocating?</p>
                  <div className="space-y-5 mt-6">
                    <div className="space-y-2">
                      <Label>House/Street Address</Label>
                      <Input icon={<MapPin className="w-4 h-4" />} placeholder="e.g. 12B, Navrangpura Society" value={splitAddress} onChange={e => setSplitAddress(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City / Taluka</Label>
                        <Input placeholder="Ahmedabad" value={splitCity} onChange={e => setSplitCity(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Pincode</Label>
                        <Input placeholder="380009" value={splitPincode} onChange={e => setSplitPincode(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              {splitStep > 1 ? (
                <Button variant="outline" onClick={() => setSplitStep(s => s - 1)}>Back</Button>
              ) : <div />}

              {splitStep < 3 ? (
                <Button onClick={() => setSplitStep(s => s + 1)} disabled={
                  (splitStep === 1 && selectedSplitIds.length === 0) ||
                  (splitStep === 2 && (!splitHeadId || selectedSplitIds.some(id => !splitRoles[id])))
                }>
                  Next Step
                </Button>
              ) : (
                <Button className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white" onClick={handleSplitSubmit}>
                  Create Independent Family ID
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPLIT SUCCESS CELEBRATION MODAL */}
      {isSplitSuccess && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Split Successful!</h2>
            <p className="text-slate-600 mb-6 text-sm">A new independent household has been established.</p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 text-left shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">New Family ID</p>
              <p className="text-2xl font-mono font-bold text-blue-700 bg-blue-100/50 p-2 rounded-lg inline-block">{newFamilyId}</p>
              <div className="mt-5 text-sm text-slate-700 border-t border-slate-200 pt-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <b>{selectedSplitIds.length} Members Migrated</b>
              </div>
            </div>

            <Button className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" onClick={handleGoToNewFamily}>
              View New Family Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* ── ADD MEMBER MODAL ────────────────────────────────────── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">

            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Add Family Member</h3>
                  <p className="text-sm text-blue-200 mt-1">Add a new member or transfer an existing one.</p>
                </div>
                <button onClick={() => { setIsAddMemberOpen(false); resetAddMemberModal(); }} className="text-blue-200 hover:text-white transition-colors mt-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ekycId">12-Digit Aadhaar / ID Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ekycId"
                      icon={<IdCard className="h-4 w-4" />}
                      placeholder="e.g. 123456789012"
                      value={ekycId}
                      onChange={(e) => {
                        setEkycId(e.target.value.replace(/\D/g, '').slice(0, 12));
                        setIsIdVerified(false);
                        setIsTransfer(false);
                      }}
                      maxLength={12}
                      disabled={isIdVerified}
                    />
                    {!isIdVerified && (
                      <Button
                        className="shrink-0 text-white px-4 flex gap-2 items-center whitespace-nowrap bg-blue-700 hover:bg-blue-800"
                        onClick={handleVerifyId}
                        disabled={ekycId.length !== 12 || isVerifyingId}
                      >
                        {isVerifyingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Verify ID
                      </Button>
                    )}
                  </div>
                  {ekycId && ekycId.length !== 12 && <p className="text-xs text-red-500">Must be exactly 12 digits.</p>}
                </div>

                {isIdVerified && (
                  <div className="space-y-4 animate-fade-in-up">
                    {isTransfer ? (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-900 font-medium">This citizen is currently registered to Household <span className="font-mono font-bold">{maskedTransferFamilyId}</span>.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="newMemberName">Full Name</Label>
                          <Input id="newMemberName" icon={<User className="h-4 w-4" />} placeholder="e.g. Priya Patel" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newMemberDob">Date of Birth</Label>
                            <Input id="newMemberDob" type="date" max={new Date().toISOString().split("T")[0]} value={newMemberDob} onChange={(e) => setNewMemberDob(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Gender</Label>
                            <select className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" value={newMemberGender} onChange={(e) => setNewMemberGender(e.target.value)}>
                              <option value="">Select...</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Annual Income (₹)</Label>
                          <Input icon={<IndianRupee className="h-4 w-4" />} type="number" placeholder="e.g. 80000" value={newMemberIncome} onChange={(e) => setNewMemberIncome(e.target.value)} />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Relation to Head</Label>
                      <select className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" value={newMemberRelation} onChange={(e) => setNewMemberRelation(e.target.value)}>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Parent">Parent</option>
                        <option value="Grandson">Grandson</option>
                        <option value="Granddaughter">Granddaughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Daughter-in-law">Daughter-in-law</option>
                        <option value="Father-in-law/Mother-in-law">Father/Mother-in-law</option>
                      </select>
                    </div>

                    <Button
                      className={`w-full h-12 text-white font-semibold flex items-center justify-center gap-2 shadow-lg mt-2 ${isTransfer ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                      onClick={handleLinkToHousehold}
                      disabled={isLinking || (!isTransfer && (!newMemberName.trim() || !newMemberDob || !newMemberGender))}
                    >
                      {isLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      {isLinking ? "Processing..." : (isTransfer ? "Transfer to this Household" : "Add to Household")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
