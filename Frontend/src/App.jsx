import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";

// Public
import LandingPage       from "./pages/LandingPage";

// Auth
import Login             from "./pages/Login";
import RoleSelection     from "./pages/auth/RoleSelection";
import Signup            from "./pages/auth/Signup";

// Freelancer pages
import FreelancerDashboard    from "./pages/freelancer/FreelancerDashboard";
import RecommendedJobs        from "./pages/freelancer/RecommendedJobs";
import JobDetails             from "./pages/freelancer/JobDetails";
import ApplyJob               from "./pages/freelancer/ApplyJob";
import ActiveContracts        from "./pages/freelancer/ActiveContracts";
import FreelancerPayments     from "./pages/freelancer/FreelancerPayments";
import FreelancerProfile      from "./pages/freelancer/FreelancerProfile";
import EditFreelancerProfile  from "./pages/freelancer/EditFreelancerProfile";

// Client pages
import ClientDashboard          from "./pages/client/ClientDashboard";
import PostJob                  from "./pages/client/PostJob";
import JobManagement            from "./pages/client/JobManagement";
import FreelancerRecommendations from "./pages/client/FreelancerRecommendations";
import HireFreelancer           from "./pages/client/HireFreelancer";
import ClientProfile            from "./pages/client/ClientProfile";
import EditClientProfile        from "./pages/client/EditClientProfile";

// Shared / existing pages
import Dashboard         from "./pages/Dashboard";
import CreateContract    from "./pages/CreateContract";
import Contracts         from "./pages/Contracts";
import SubmitWork        from "./pages/SubmitWork";
import PaymentApproval   from "./pages/PaymentApproval";
import DisputeCenter     from "./pages/DisputeCenter";
import ContractDetails   from "./pages/contracts/ContractDetails";

// New shared pages
import WalletPage        from "./pages/WalletPage";
import TransactionHistory from "./pages/TransactionHistory";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage      from "./pages/SettingsPage";

// Public Pages
import AboutPage         from "./pages/public/AboutPage";
import FeaturesPage      from "./pages/public/FeaturesPage";
import HowItWorksPage    from "./pages/public/HowItWorksPage";
import SecurityPage      from "./pages/public/SecurityPage";
import ContactPage       from "./pages/public/ContactPage";

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ─────────────────────────────────── */}
            <Route path="/"             element={<LandingPage />} />
            <Route path="/about"        element={<AboutPage />} />
            <Route path="/features"     element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/security"     element={<SecurityPage />} />
            <Route path="/contact"      element={<ContactPage />} />

            {/* ── Auth ───────────────────────────────────── */}
            <Route path="/login"        element={<Login />} />
            <Route path="/signup"       element={<Signup />} />
            <Route path="/role"         element={<RoleSelection />} />

            {/* ── Freelancer Portal ──────────────────────── */}
            <Route path="/freelancer/dashboard"     element={<FreelancerDashboard />} />
            <Route path="/freelancer/jobs"          element={<RecommendedJobs />} />
            <Route path="/freelancer/job/:id"       element={<JobDetails />} />
            <Route path="/freelancer/apply/:id"     element={<ApplyJob />} />
            <Route path="/freelancer/contracts"     element={<ActiveContracts />} />
            <Route path="/freelancer/payments"      element={<FreelancerPayments />} />
            <Route path="/freelancer/profile"       element={<FreelancerProfile />} />
            <Route path="/freelancer/edit-profile"  element={<EditFreelancerProfile />} />

            {/* ── Client Portal ──────────────────────────── */}
            <Route path="/client/dashboard"         element={<ClientDashboard />} />
            <Route path="/client/post-job"          element={<PostJob />} />
            <Route path="/client/jobs"              element={<JobManagement />} />
            <Route path="/client/freelancers"       element={<FreelancerRecommendations />} />
            <Route path="/client/hire/:id"          element={<HireFreelancer />} />
            <Route path="/client/profile"           element={<ClientProfile />} />
            <Route path="/client/edit-profile"      element={<EditClientProfile />} />

            {/* ── Generic (legacy) dashboard ─────────────── */}
            <Route path="/dashboard"    element={<Dashboard />} />

            {/* ── Escrow / Contract flows ─────────────────── */}
            <Route path="/create"       element={<CreateContract />} />
            <Route path="/contracts"    element={<Contracts />} />
            <Route path="/contract/:id" element={<ContractDetails />} />
            <Route path="/submit"       element={<SubmitWork />} />
            <Route path="/approve"      element={<PaymentApproval />} />
            <Route path="/dispute"      element={<DisputeCenter />} />

            {/* ── Shared pages ────────────────────────────── */}
            <Route path="/wallet"       element={<WalletPage />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings"     element={<SettingsPage />} />

            {/* ── Fallback ────────────────────────────────── */}
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
