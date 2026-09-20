import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Users, Clock, IndianRupee, FileText, Search, Loader2, X, PlusCircle, BarChart3, Settings } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verifications'); // verifications, schemes, analytics

  // Verifications State
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Schemes State
  const [schemes, setSchemes] = useState<any[]>([]);
  const [isCreateSchemeOpen, setIsCreateSchemeOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({
    scheme_name: "", description: "", benefit_type: "Household", benefit_amount: "", numeric_benefit_value: "",
    max_income: "", target_gender: "all", min_age: "", max_age: ""
  });
  const [isCreatingScheme, setIsCreatingScheme] = useState(false);

  // Analytics State
  const [applications, setApplications] = useState<any[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(false);

  const fetchFamilies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('families').select(`
        family_id, status, created_at, address,
        members ( aadhaar_number, full_name, relation_to_hof )
      `).order('created_at', { ascending: false });
      if (data) setFamilies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchemes = async () => {
    const { data } = await supabase.from('schemes').select('*').order('scheme_id', { ascending: false });
    if (data) setSchemes(data);
  };

  const fetchAnalytics = async () => {
    setIsAppsLoading(true);
    try {
      const { data } = await supabase.from('scheme_applications').select(`
        application_id, family_id, applicant_aadhaar, status, applied_at,
        schemes ( scheme_id, scheme_name, numeric_benefit_value )
      `).order('applied_at', { ascending: false });
      if (data) setApplications(data);
    } catch(e) {
      console.error(e);
    } finally {
      setIsAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
    fetchSchemes();
    fetchAnalytics();
  }, []);

  const handleUpdateFamilyStatus = async (familyId: string, newStatus: string) => {
    setIsUpdating(familyId);
    try {
      await supabase.from('families').update({ status: newStatus }).eq('family_id', familyId);
      await fetchFamilies();
    } catch (e) {
      console.error("Failed to update", e);
    } finally {
      setIsUpdating("");
    }
  };

  const handleUpdateAppStatus = async (appId: number, newStatus: string) => {
    try {
      await supabase.from('scheme_applications')
        .update({ status: newStatus, disbursed_at: newStatus === 'Disbursed' ? new Date().toISOString() : null })
        .eq('application_id', appId);
      await fetchAnalytics();
    } catch(e) {
      console.error(e);
    }
  };

  const handleCreateScheme = async () => {
    setIsCreatingScheme(true);
    try {
      const constraints = {
        max_income_limit: newScheme.max_income ? Number(newScheme.max_income) : null,
        target_gender: newScheme.target_gender,
        min_age: newScheme.min_age ? Number(newScheme.min_age) : null,
        max_age: newScheme.max_age ? Number(newScheme.max_age) : null,
      };

      await supabase.from('schemes').insert({
        scheme_name: newScheme.scheme_name,
        description: newScheme.description,
        benefit_type: newScheme.benefit_type,
        benefit_amount: newScheme.benefit_amount,
        numeric_benefit_value: Number(newScheme.numeric_benefit_value) || 0,
        constraints: constraints
      });
      setIsCreateSchemeOpen(false);
      await fetchSchemes();
    } catch (e) {
      console.error(e);
      alert("Failed to create scheme");
    } finally {
      setIsCreatingScheme(false);
    }
  };

  const pendingCount = families.filter(f => f.status === 'Pending').length;
  
  // Analytics Calculations
  const disbursedApps = applications.filter(a => a.status === 'Disbursed');
  const totalDisbursedAmount = disbursedApps.reduce((sum, a) => sum + (a.schemes?.numeric_benefit_value || 0), 0);
  
  const analyticsByScheme = applications.reduce((acc, app) => {
    const sName = app.schemes?.scheme_name || "Unknown";
    if (!acc[sName]) acc[sName] = { total: 0, disbursed: 0, amount: 0 };
    acc[sName].total += 1;
    if (app.status === 'Disbursed') {
      acc[sName].disbursed += 1;
      acc[sName].amount += (app.schemes?.numeric_benefit_value || 0);
    }
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto mt-8 w-full px-4 pb-16">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">State Admin Portal</h1>
          <p className="text-slate-500 mt-1">Manage Families, Schemes, and Financials</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('verifications')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'verifications' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Family Verifications</button>
          <button onClick={() => setActiveTab('schemes')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'schemes' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Scheme Management</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Financial Analytics</button>
        </div>
      </div>

      {activeTab === 'verifications' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500 mb-1">Total Families Registered</p><h3 className="text-3xl font-bold text-slate-900">{families.length}</h3></div><div className="p-4 bg-blue-50 rounded-full"><Users className="text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500 mb-1">Pending Verifications</p><h3 className="text-3xl font-bold text-slate-900">{pendingCount}</h3></div><div className="p-4 bg-orange-50 rounded-full"><Clock className="text-orange-500" /></div></CardContent></Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Recent Family Registrations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Family ID</th>
                    <th className="px-6 py-4">Head of Family</th>
                    <th className="px-6 py-4">Members</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((f, i) => {
                    const head = f.members?.find((m: any) => m.relation_to_hof === 'Self' || m.relation_to_hof === 'Head of Family');
                    return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">{f.family_id}</td>
                      <td className="px-6 py-4 font-medium">{head?.full_name || "N/A"}</td>
                      <td className="px-6 py-4">{f.members?.length || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${f.status === 'Approved' ? 'bg-green-100 text-green-700' : f.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {f.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-green-700 border-green-200" onClick={() => handleUpdateFamilyStatus(f.family_id, 'Approved')}>Approve</Button>
                            <Button variant="outline" size="sm" className="text-red-700 border-red-200" onClick={() => handleUpdateFamilyStatus(f.family_id, 'Rejected')}>Reject</Button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs uppercase">Verified</span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'schemes' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Active Welfare Schemes</h2>
            <Button onClick={() => setIsCreateSchemeOpen(true)} className="flex items-center gap-2"><PlusCircle className="w-4 h-4"/> Create Scheme</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map(s => (
              <Card key={s.scheme_id} className="relative overflow-hidden border-t-4 border-t-blue-600 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{s.scheme_name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">{s.benefit_type}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{s.description}</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Constraints</p>
                    <div className="text-sm space-y-1 text-slate-700">
                      {s.constraints?.max_income_limit && <p>• Max Income: ₹{s.constraints.max_income_limit.toLocaleString()}</p>}
                      {s.constraints?.target_gender && s.constraints.target_gender !== 'all' && <p className="capitalize">• Gender: {s.constraints.target_gender}</p>}
                      {(s.constraints?.min_age || s.constraints?.max_age) && <p>• Age: {s.constraints.min_age || 0} to {s.constraints.max_age || 'Any'}</p>}
                      {Object.keys(s.constraints || {}).length === 0 && <p className="text-slate-400 italic">No constraints</p>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Benefit Amount</span>
                    <span className="font-bold text-slate-900">{s.benefit_amount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-blue-200 font-medium mb-2 flex items-center gap-2"><IndianRupee className="w-5 h-5"/> Total Funds Disbursed</p>
                <h2 className="text-5xl font-extrabold tracking-tight">₹{totalDisbursedAmount.toLocaleString()}</h2>
                <p className="text-sm text-blue-300 mt-4">Across {disbursedApps.length} successful applications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400"/> Scheme Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsByScheme).map(([name, data]: any) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{name}</span>
                        <span className="font-bold text-slate-900">₹{data.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(data.amount / totalDisbursedAmount) * 100 || 0}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{data.disbursed} / {data.total} disbursed</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Pending Scheme Disbursals</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Application ID</th>
                    <th className="px-6 py-4">Scheme</th>
                    <th className="px-6 py-4">Family / Applicant ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.filter(a => a.status !== 'Disbursed' && a.status !== 'Rejected').map(app => (
                    <tr key={app.application_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">APP-{app.application_id}</td>
                      <td className="px-6 py-4">{app.schemes?.scheme_name}</td>
                      <td className="px-6 py-4 text-slate-600">{app.applicant_aadhaar || app.family_id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">{app.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'Applied' && <Button variant="outline" size="sm" onClick={() => handleUpdateAppStatus(app.application_id, 'Approved')}>Approve</Button>}
                          {app.status === 'Approved' && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateAppStatus(app.application_id, 'Disbursed')}>Disburse Funds</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applications.filter(a => a.status !== 'Disbursed' && a.status !== 'Rejected').length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending disbursals.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* CREATE SCHEME MODAL */}
      {isCreateSchemeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto pt-24 pb-12">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Create New Scheme</h3>
              <button onClick={() => setIsCreateSchemeOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">General Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Scheme Name</label>
                    <input type="text" className="w-full border p-2 rounded" placeholder="e.g. Mukhyamantri Kanya Vidyadhan" value={newScheme.scheme_name} onChange={e => setNewScheme({...newScheme, scheme_name: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea className="w-full border p-2 rounded" placeholder="Brief description of the scheme..." value={newScheme.description} onChange={e => setNewScheme({...newScheme, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Benefit Type</label>
                    <select className="w-full border p-2 rounded" value={newScheme.benefit_type} onChange={e => setNewScheme({...newScheme, benefit_type: e.target.value})}>
                      <option value="Household">Household (One per family)</option>
                      <option value="Individual">Individual (Per eligible member)</option>
                      <option value="Nuclear">Nuclear (Applicant + Parents Income)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Amount</label>
                    <input type="text" className="w-full border p-2 rounded" placeholder="e.g. ₹50,000 / Year" value={newScheme.benefit_amount} onChange={e => setNewScheme({...newScheme, benefit_amount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Numeric Value (For Analytics)</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="e.g. 50000" value={newScheme.numeric_benefit_value} onChange={e => setNewScheme({...newScheme, numeric_benefit_value: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 text-blue-700 flex items-center gap-2"><Settings className="w-4 h-4"/> Dynamic Constraints</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Income Limit (₹)</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="Leave blank if none" value={newScheme.max_income} onChange={e => setNewScheme({...newScheme, max_income: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Gender</label>
                    <select className="w-full border p-2 rounded" value={newScheme.target_gender} onChange={e => setNewScheme({...newScheme, target_gender: e.target.value})}>
                      <option value="all">All Genders</option>
                      <option value="female">Female Only</option>
                      <option value="male">Male Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Age</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="Min" value={newScheme.min_age} onChange={e => setNewScheme({...newScheme, min_age: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum Age</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="Max" value={newScheme.max_age} onChange={e => setNewScheme({...newScheme, max_age: e.target.value})} />
                  </div>
                </div>
              </div>

            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateSchemeOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateScheme} disabled={isCreatingScheme || !newScheme.scheme_name}>
                {isCreatingScheme ? "Creating..." : "Deploy Scheme"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}