import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight, LogIn, Cpu, QrCode, Users, Network, Zap, Landmark, CheckCircle2, Loader2, Circle, X, Search, XCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { supabase } from "../../lib/supabase";

export function LandingPage() {
  const navigate = useNavigate();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [trackError, setTrackError] = useState("");
  const [fetchedStatus, setFetchedStatus] = useState("");

  const handleTrackStatus = async () => {
    setIsTrackingLoading(true);
    setShowStatus(false);
    setTrackError("");
    setFetchedStatus("");
    
    try {
      const { data, error } = await supabase
        .from('families')
        .select('status')
        .eq('family_id', trackingId)
        .single();
        
      if (error || !data) {
        setTrackError("Application reference not found.");
      } else {
        setFetchedStatus(data.status);
        setShowStatus(true);
      }
    } catch (err) {
      setTrackError("An error occurred while tracking.");
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-84px)] overflow-hidden pb-24">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-12 lg:pt-20">
        
        {/* Two-Column Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center text-left">
          
          {/* Left Column: Copy & CTAs */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-md text-blue-800 font-semibold text-sm border border-blue-200 shadow-sm w-fit">
              <Shield className="h-4 w-4 text-orange-500" />
              <span>Government of Gujarat Initiative</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One State.<br />One Family.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-500">
                Endless Possibilities.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
              Kutumba Gujarat is your unified digital portal for proactive government service delivery. 
              Register your family once, and instantly discover schemes you are eligible for.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl text-lg font-medium h-14 px-8 bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-800 focus:outline-none"
                onClick={() => navigate("/onboarding")}
              >
                Register New Family <ArrowRight className="h-5 w-5" />
              </button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 rounded-xl text-lg h-14 px-8 bg-white/70 backdrop-blur-md shadow-xl border-slate-200 hover:bg-white hover:shadow-slate-200/50 transition-all text-slate-700"
                onClick={() => navigate("/login?type=citizen")}
              >
                <LogIn className="h-5 w-5 text-slate-500" /> Login to Portal
              </Button>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => setIsTrackingModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 transition-colors"
              >
                Track Application Status
              </button>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-8 border-t border-slate-200/60">
              {[
                { label: "Families", value: "1.2M+" },
                { label: "Schemes", value: "150+" },
                { label: "Disbursed", value: "₹428Cr" },
                { label: "Speed", value: "1-Click" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-700">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: ID Card Mockup & Motif */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Gujarat Motif Watermark (Abstract Sidi Saiyyed Jali style placeholder using pure CSS shapes) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none scale-150">
              <svg viewBox="0 0 200 200" className="w-full h-full fill-slate-900" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0 C44.8 0 0 44.8 0 100 C0 155.2 44.8 200 100 200 C155.2 200 200 155.2 200 100 C200 44.8 155.2 0 100 0 Z M100 180 C55.8 180 20 144.2 20 100 C20 55.8 55.8 20 100 20 C144.2 20 180 55.8 180 100 C180 144.2 144.2 180 100 180 Z" />
                <path d="M100 40 C66.9 40 40 66.9 40 100 C40 133.1 66.9 160 100 160 C133.1 160 160 133.1 160 100 C160 66.9 133.1 40 100 40 Z M100 140 C77.9 140 60 122.1 60 100 C60 77.9 77.9 60 100 60 C122.1 60 140 77.9 140 100 C140 122.1 122.1 140 100 140 Z" />
                <circle cx="100" cy="100" r="30" />
              </svg>
            </div>

            {/* Glowing Ambient Orb right behind the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/30 blur-[80px] rounded-full" />

            {/* Floating Card Mockup */}
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-[2rem] p-[2px] bg-gradient-to-br from-blue-400/50 via-indigo-500/30 to-orange-500/30 shadow-[0_30px_60px_-15px_rgba(30,58,138,0.3)] animate-[float_6s_ease-in-out_infinite] z-20">
              {/* Floating Badge */}
              <div className="absolute -left-6 md:-left-10 -top-6 bg-white/95 backdrop-blur-md border border-green-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-2 z-30">
                <span className="text-lg">✨</span>
                <span className="text-sm font-bold text-green-700">3 Schemes Auto-Matched</span>
              </div>

              <div className="bg-gradient-to-br from-[#0B192C] via-[#1A365D] to-[#0B192C] w-full rounded-[2rem] p-6 sm:p-8 overflow-hidden relative border border-white/10">
                {/* Holographic Watermark Inside Card */}
                <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                  <Shield className="w-80 h-80 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 sm:mb-10">
                    <div>
                      <h3 className="text-[10px] md:text-xs font-bold text-orange-400 tracking-[0.2em] uppercase">Government of Gujarat</h3>
                      <h2 className="text-sm md:text-base font-medium text-white tracking-widest mt-1">Family Identity Card</h2>
                    </div>
                    <Cpu className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                  </div>
                  
                  <div className="mb-8 sm:mb-10">
                    <div className="text-3xl sm:text-4xl font-mono text-white tracking-widest font-bold">
                      GUJ <span className="text-blue-400/50">-</span> 2026 <span className="text-blue-400/50">-</span> 8941
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] sm:text-xs text-blue-200/70 uppercase tracking-widest mb-1 font-medium">Head of Family</p>
                        <p className="text-white font-medium text-xl sm:text-2xl">Ramesh Patel</p>
                      </div>
                      <div className="flex items-center gap-2 text-blue-100 bg-blue-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-700/50 w-fit">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-semibold tracking-wide">4 Linked Members</span>
                      </div>
                    </div>
                    <div className="bg-white/95 p-2 rounded-xl shadow-inner">
                      <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Showcase */}
        <div className="w-full mt-32 space-y-12 pb-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">How Proactive Governance Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Moving away from reactive applications to a unified, suo-moto delivery system for all eligible citizens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-100 shadow-sm">
                  <Network className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Unified Household Registry</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Link all family members under one physical household ID with individual consent, creating a single source of truth for the state.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Dynamic Eligibility Engine</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Relational pointers prevent the joint family trap, automatically evaluating and qualifying eligible nuclear units for targeted schemes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-100 shadow-sm">
                  <Landmark className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Direct Benefit Transfer</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Experience 1-click paperless scheme sanctions without repeated document submissions or office visits. Funds go straight to the beneficiary.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Track Status</h3>
              <button onClick={() => { setIsTrackingModalOpen(false); setShowStatus(false); setTrackingId(""); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Application Reference or Family ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. GUJ-2026-..." 
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleTrackStatus} disabled={!trackingId || isTrackingLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 shadow-sm">
                    {isTrackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                {trackError && <p className="text-sm text-red-500 font-medium">{trackError}</p>}
              </div>

              {showStatus && (
                <div className="pt-4 border-t border-slate-100 animate-fade-in-up" style={{ animationDuration: '0.4s' }}>
                  <h4 className="text-sm font-bold text-slate-900 mb-6">Application Timeline</h4>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-slate-200">
                    
                    <div className="relative flex items-start gap-4">
                      <div className="bg-white relative z-10"><CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" /></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Registration Submitted</p>
                        <p className="text-xs text-slate-500 mt-0.5">Documents uploaded successfully.</p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      <div className="bg-white relative z-10">
                        {fetchedStatus === 'Approved' ? <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" /> : 
                         fetchedStatus === 'Rejected' ? <XCircle className="w-6 h-6 text-red-500 bg-white rounded-full" /> : 
                         <Loader2 className="w-6 h-6 text-amber-500 animate-spin bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${fetchedStatus === 'Approved' ? 'text-green-700' : fetchedStatus === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                          {fetchedStatus === 'Approved' ? 'Verification Complete' : fetchedStatus === 'Rejected' ? 'Verification Failed' : 'Pending Field Verification'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fetchedStatus === 'Approved' ? 'BDO has verified your details.' : fetchedStatus === 'Rejected' ? 'Discrepancy found. Please visit CSC.' : 'Block Development Officer review in progress.'}
                        </p>
                      </div>
                    </div>

                    <div className={`relative flex items-start gap-4 ${fetchedStatus === 'Approved' ? '' : 'opacity-50'}`}>
                      <div className="bg-white relative z-10">
                        {fetchedStatus === 'Approved' ? <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" /> : 
                         <Circle className="w-6 h-6 text-slate-300 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-700">ID Generation</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fetchedStatus === 'Approved' ? 'Completed' : 'Upcoming'}</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
