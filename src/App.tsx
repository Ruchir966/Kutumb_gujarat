import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { LandingPage } from "./components/home/LandingPage";
import { LoginPortal } from "./components/auth/LoginPortal";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { CitizenDashboard } from "./components/citizen/CitizenDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative">
        {/* Tricolor Accent Bar */}
        <div className="h-[4px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-50 sticky top-0" />
        <Navbar />
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPortal />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
