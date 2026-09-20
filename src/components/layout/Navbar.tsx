import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, User, LayoutDashboard, Database, LogOut, ChevronDown, ShieldCheck, Users } from "lucide-react";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [userName, setUserName] = useState("Citizen");
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLoginMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCitizenDashboard = location.pathname === '/dashboard';
  const isAdminDashboard = location.pathname === '/admin';

  useEffect(() => {
    if (isCitizenDashboard) {
      const fid = sessionStorage.getItem('activeFamilyId');
      if (fid) {
        supabase.from('members')
          .select('full_name')
          .eq('family_id', fid)
          .in('relation_to_hof', ['Self', 'Head of Family'])
          .maybeSingle()
          .then(({data}) => {
             if (data) setUserName(data.full_name);
          });
      }
    }
  }, [isCitizenDashboard, location.pathname]);

  return (
    <nav className="glass-nav py-4 px-6 md:px-12 flex items-center justify-between shadow-sm z-50 sticky top-0 bg-white/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-800" />
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">Kutumba <span className="text-orange-500">Gujarat</span></span>
          <span className="text-[10px] text-slate-500 font-medium mt-1 tracking-wider uppercase">વસુધૈવ કુટુમ્બકમ્</span>
        </div>
      </Link>
      
      <div className="flex gap-4 md:gap-6 items-center">
        {isCitizenDashboard ? (
          <>
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-medium text-blue-700 shadow-sm">
              <User className="h-4 w-4" />
              <span>Logged in: {userName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : isAdminDashboard ? (
          <>
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full text-sm font-medium text-orange-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Logged in: BDO Official</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Link 
              to="/onboarding" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-700 ${location.pathname === '/onboarding' ? 'text-blue-700' : 'text-slate-600'}`}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Register Family</span>
            </Link>
            
            <div className="relative" ref={menuRef}>
              <Button 
                size="sm" 
                onClick={() => setShowLoginMenu(!showLoginMenu)} 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md"
              >
                Login <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showLoginMenu ? 'rotate-180' : ''}`} />
              </Button>
              
              {showLoginMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { setShowLoginMenu(false); navigate("/login?type=citizen"); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Citizen Login</div>
                        <div className="text-[10px] text-slate-500 font-normal">Access family benefits</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => { setShowLoginMenu(false); navigate("/login?type=admin"); }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <div className="bg-orange-100 text-orange-600 p-1.5 rounded-md">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Official Login</div>
                        <div className="text-[10px] text-slate-500 font-normal">BDO & Admin Access</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
