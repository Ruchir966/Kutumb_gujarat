import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Plus, Trash2, CheckCircle2, User, IdCard, Calendar, Users, FileText, IndianRupee, MapPin, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State
  const [headName, setHeadName] = useState("");
  const [headId, setHeadId] = useState("");
  const [headDob, setHeadDob] = useState("");
  const [headGender, setHeadGender] = useState("");
  const [headIncome, setHeadIncome] = useState("");
  const [legacyId, setLegacyId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Step 2 State
  const [dependents, setDependents] = useState<any[]>([]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addDependent = () => {
    setDependents([...dependents, { id: Date.now(), name: "", nationalId: "", relation: "Son", income: "", dob: "" }]);
  };

  const removeDependent = (id: number) => {
    setDependents(dependents.filter((d) => d.id !== id));
  };

  const updateDependent = (id: number, field: string, value: string) => {
    setDependents(dependents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleGenerateId = async () => {
    setIsSubmitting(true);
    try {
      const familyId = `GUJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const fullAddress = `${address}, ${city} - ${pincode}`;
      
      const { error: familyError } = await supabase.from('families').insert({
        family_id: familyId,
        address: fullAddress,
        ration_card_number: legacyId || null,
        status: 'Pending'
      });
      if (familyError) throw familyError;

      const age = new Date().getFullYear() - new Date(headDob).getFullYear();
      const { error: hofError } = await supabase.from('members').insert({
        family_id: familyId,
        full_name: headName,
        aadhaar_number: headId,
        relation_to_hof: 'Self',
        gender: headGender,
        age: age,
        date_of_birth: headDob,
        individual_income: Number(headIncome) || 0
      });
      if (hofError) {
        // Rollback: delete the family row we just created
        await supabase.from('families').delete().eq('family_id', familyId);
        throw hofError;
      }

      const validDependents = dependents.filter(d => d.name.trim() && d.nationalId.trim());
      if (validDependents.length > 0) {
        const dependentData = validDependents.map(d => ({
          family_id: familyId,
          full_name: d.name,
          aadhaar_number: d.nationalId,
          relation_to_hof: d.relation,
          individual_income: Number(d.income) || 0,
          date_of_birth: d.dob || null,
          age: d.dob ? new Date().getFullYear() - new Date(d.dob).getFullYear() : 0,
          gender: 'other' // default for now if not captured
        }));
        const { error: depError } = await supabase.from('members').insert(dependentData);
        if (depError) {
          // Rollback: delete HoF from members and the family itself
          await supabase.from('members').delete().eq('family_id', familyId);
          await supabase.from('families').delete().eq('family_id', familyId);
          throw depError;
        }
      }

      sessionStorage.setItem('activeFamilyId', familyId);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating family:", error);
      if (error?.code === '23505') {
        alert("Registration Failed: One of the Aadhaar numbers you entered is already registered to an existing household. Please verify all 12-digit IDs.");
      } else {
        alert("Failed to generate family ID: " + (error?.message || error?.details || JSON.stringify(error)));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = () => {
    if (!headName.trim()) return false;
    
    // Aadhaar must be exactly 12 digits numeric
    const aadhaarDigits = headId.replace(/\D/g, '');
    if (aadhaarDigits.length !== 12) return false;

    if (!headGender) return false;
    if (!headIncome) return false;
    if (!headDob) return false;
    const dob = new Date(headDob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob >= today) return false;

    if (!address.trim() || !city.trim() || !pincode.trim()) return false;

    return true;
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 w-full px-4">
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${step >= i ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
            </div>
            {i < 3 && (
              <div className={`h-1 w-20 md:w-32 mx-2 rounded ${step > i ? 'bg-blue-700' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="shadow-lg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl">Step 1: Head of Family</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Register the primary applicant for the family ID.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headName">Full Name</Label>
                  <Input id="headName" icon={<User className="h-4 w-4" />} placeholder="e.g. Kalpesh Joshi" value={headName} onChange={(e) => setHeadName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headId">Aadhaar / 12-digit ID Number</Label>
                  <Input 
                    id="headId" 
                    icon={<IdCard className="h-4 w-4" />} 
                    placeholder="123456789012" 
                    value={headId} 
                    onChange={(e) => setHeadId(e.target.value.replace(/\D/g, '').slice(0, 12))} 
                    maxLength={12} 
                  />
                  {headId && headId.replace(/\D/g, '').length !== 12 && (
                    <p className="text-xs text-red-500 font-medium">Must be exactly 12 numeric digits.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="headDob">Date of Birth</Label>
                    <Input 
                      id="headDob" 
                      icon={<Calendar className="h-4 w-4" />} 
                      type="date" 
                      max={new Date().toISOString().split("T")[0]}
                      value={headDob} 
                      onChange={(e) => setHeadDob(e.target.value)} 
                    />
                    {headDob && new Date(headDob) >= new Date(new Date().setHours(0,0,0,0)) && (
                      <p className="text-xs text-red-500 font-medium">DOB must be in the past.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headGender">Gender</Label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-slate-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <select 
                        id="headGender"
                        className="flex h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow hover:border-slate-400"
                        value={headGender} 
                        onChange={(e) => setHeadGender(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="headIncome">Individual Annual Income (₹)</Label>
                    <Input 
                      id="headIncome" 
                      icon={<IndianRupee className="h-4 w-4" />} 
                      type="number" 
                      placeholder="e.g. 250000" 
                      value={headIncome} 
                      onChange={(e) => setHeadIncome(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-700">Household Address</h4>
                  <div className="space-y-2">
                    <Label htmlFor="address">House/Street Address</Label>
                    <Input id="address" icon={<MapPin className="h-4 w-4" />} placeholder="e.g. 12B, Navrangpura Society" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / Taluka</Label>
                      <Input id="city" placeholder="Ahmedabad" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" placeholder="380009" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Label htmlFor="legacyId">Legacy Ration Card Number (Optional)</Label>
                  <Input id="legacyId" icon={<FileText className="h-4 w-4" />} placeholder="e.g. APL-12345" value={legacyId} onChange={(e) => setLegacyId(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={nextStep} disabled={!isStep1Valid()}>Continue to Dependents</Button>
              </CardFooter>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl">Step 2: Add Dependents</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Add immediate family members for collective benefits.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {dependents.map((dep, index) => (
                  <div key={dep.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4 relative">
                    <div className="absolute top-4 right-4">
                      <button onClick={() => removeDependent(dep.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-700">Family Member {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input icon={<User className="h-4 w-4" />} placeholder="Name" value={dep.name} onChange={(e) => updateDependent(dep.id, 'name', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>12-digit ID Number</Label>
                        <Input icon={<IdCard className="h-4 w-4" />} placeholder="XXXX XXXX XXXX" value={dep.nationalId} onChange={(e) => updateDependent(dep.id, 'nationalId', e.target.value.replace(/\D/g, '').slice(0, 12))} maxLength={12} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input icon={<Calendar className="h-4 w-4" />} type="date" max={new Date().toISOString().split("T")[0]} value={dep.dob || ""} onChange={(e) => updateDependent(dep.id, 'dob', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Relation to Head</Label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3 text-slate-400">
                            <Users className="h-4 w-4" />
                          </div>
                          <select 
                            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-shadow hover:border-slate-400"
                            value={dep.relation} 
                            onChange={(e) => updateDependent(dep.id, 'relation', e.target.value)}
                          >
                            <option value="Spouse">Spouse</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Parent">Parent</option>
                            <option value="Grandson">Grandson</option>
                            <option value="Granddaughter">Granddaughter</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Daughter-in-law">Daughter-in-law</option>
                            <option value="Father-in-law/Mother-in-law">Father-in-law/Mother-in-law</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Individual Annual Income (₹)</Label>
                        <Input icon={<IndianRupee className="h-4 w-4" />} type="number" placeholder="e.g. 150000" value={dep.income} onChange={(e) => updateDependent(dep.id, 'income', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={addDependent}>
                  <Plus className="h-4 w-4" /> Add Member
                </Button>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Review Summary</Button>
              </CardFooter>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <CardTitle className="text-2xl">Step 3: Review & Submit</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Please verify all details before generating the Family ID.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Head of Family</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Name:</div>
                    <div className="font-medium">{headName || 'N/A'}</div>
                    <div className="text-slate-500">ID Number:</div>
                    <div className="font-medium">{headId || 'N/A'}</div>
                    <div className="text-slate-500">Gender/DOB:</div>
                    <div className="font-medium capitalize">{headGender || 'N/A'} - {headDob || 'N/A'}</div>
                    <div className="text-slate-500">Income:</div>
                    <div className="font-medium text-green-700">₹{headIncome || '0'}</div>
                    <div className="text-slate-500">Address:</div>
                    <div className="font-medium truncate" title={`${address}, ${city} - ${pincode}`}>{address}, {city} - {pincode}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Dependents ({dependents.length})</h4>
                  <div className="space-y-3">
                    {dependents.map((dep, i) => (
                      <div key={dep.id} className={`text-sm ${i !== 0 ? 'border-t border-slate-200 pt-3' : ''}`}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{dep.name || 'Unnamed'}</span>
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-semibold">{dep.relation}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-xs">
                          <span>ID: {dep.nationalId || 'N/A'}</span>
                          <span>Income: ₹{dep.income || '0'}</span>
                        </div>
                      </div>
                    ))}
                    {dependents.length === 0 && <div className="text-sm text-slate-500">No dependents added.</div>}
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-orange-800 text-sm flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                  <p>By submitting this form, you declare that all provided information is accurate and true to the best of your knowledge.</p>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={prevStep} disabled={isSubmitting}>Back</Button>
                <Button variant="primary" onClick={handleGenerateId} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500 text-white flex gap-2 items-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? 'Generating...' : 'Generate Family ID'}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
