import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Users, ShieldCheck, ArrowRight, IdCard, Lock, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function LoginPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'citizen' | 'official'>('citizen');
  const [citizenId, setCitizenId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleCitizenLogin = async () => {
    setIsLoggingIn(true);
    try {
      let fid = citizenId.trim();
      if (!fid.startsWith("GUJ-")) {
        // Assume it's Aadhaar
        const { data, error } = await supabase.from('members').select('family_id').eq('aadhaar_number', fid).single();
        if (data) {
          fid = data.family_id;
        } else {
          alert("Aadhaar not found in the system. Please register your family.");
          setIsLoggingIn(false);
          return;
        }
      } else {
        // Verify family ID exists
        const { data: family } = await supabase.from('families').select('family_id').eq('family_id', fid).single();
        if (!family) {
          alert("Family ID not found.");
          setIsLoggingIn(false);
          return;
        }
      }

      sessionStorage.setItem('activeFamilyId', fid);
      navigate("/dashboard");
    } catch (e) {
      alert("Error logging in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Pre-select tab based on query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "admin") {
      setActiveTab("official");
    } else {
      setActiveTab("citizen");
    }
  }, [location]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-84px)] px-4 py-12 relative">
      {/* Ambient Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        
        <Card className="bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-2xl rounded-3xl overflow-hidden">
          
          {/* Tabs */}
          <div className="flex w-full bg-slate-100/50 p-2">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'citizen' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('citizen')}
            >
              <Users className="w-4 h-4" /> Citizen
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'official' 
                  ? 'bg-slate-900 text-orange-400 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('official')}
            >
              <ShieldCheck className="w-4 h-4" /> Official
            </button>
          </div>

          <CardContent className="p-8">
            {activeTab === 'citizen' ? (
              <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Citizen Login</h2>
                  <p className="text-sm text-slate-500">Enter your Aadhaar or Family ID to access your dashboard.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Aadhaar / Family ID (12-Digit)</Label>
                    <Input 
                      icon={<IdCard className="h-4 w-4" />} 
                      placeholder="e.g. 1234-5678-9012" 
                      value={citizenId} 
                      onChange={(e) => setCitizenId(e.target.value)} 
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md shadow-lg shadow-blue-500/20 flex gap-2 items-center justify-center"
                    onClick={handleCitizenLogin}
                    disabled={citizenId.length < 5 || isLoggingIn}
                  >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Login to Dashboard {!isLoggingIn && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Official Portal</h2>
                  <p className="text-sm text-slate-500">Secure access for Block Development Officers & Admins.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Secure Credential ID</Label>
                    <Input 
                      icon={<Lock className="h-4 w-4" />} 
                      placeholder="BDO-XXXX-XXXX" 
                      value={adminId} 
                      onChange={(e) => setAdminId(e.target.value)} 
                      type="password"
                    />
                  </div>
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-md shadow-lg shadow-slate-900/20 text-orange-400"
                    onClick={() => {
                      if (adminId === '123456789') {
                        navigate("/admin");
                      } else {
                        alert("Invalid Credentials. Access Denied.");
                      }
                    }}
                    disabled={adminId.length < 4}
                  >
                    Authenticate <ShieldCheck className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
