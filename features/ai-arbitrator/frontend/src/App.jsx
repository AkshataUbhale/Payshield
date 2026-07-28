
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import ClientArbitrator from "./pages/ClientArbitrator";
import FreelancerArbitrator from "./pages/FreelancerArbitrator";
import ArbitrationResult from "./pages/ArbitrationResult";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/client/ai-arbitrator"
          element={<ClientArbitrator />}
        />

        <Route
          path="/freelancer/ai-arbitrator"
          element={<FreelancerArbitrator />}
        />

        <Route
          path="/arbitration-result"
          element={<ArbitrationResult />}
        />

        

      </Routes>

    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-6">

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">

        <div className="flex items-center gap-4 mb-8">

          <div className="p-4 bg-indigo-500 rounded-2xl">
            <ShieldCheck size={32} />
          </div>

          <div>
            <h1 className="text-4xl font-bold">
              PayShield AI Arbitrator
            </h1>

            <p className="text-slate-300 mt-2">
              Smart AI-based freelancer dispute resolution system.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Link
            to="/client/ai-arbitrator"
            className="bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all"
          >

            <h2 className="text-2xl font-bold mb-3">
              Client AI Arbitrator
            </h2>

            <p className="text-slate-300 mb-5">
              Raise project disputes and receive fair AI recommendations.
            </p>

            <span className="inline-block bg-indigo-500 px-6 py-3 rounded-2xl font-semibold">
              Raise Dispute
            </span>

          </Link>

          <Link
            to="/freelancer/ai-arbitrator"
            className="bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all"
          >

            <h2 className="text-2xl font-bold mb-3">
              Freelancer AI Arbitrator
            </h2>

            <p className="text-slate-300 mb-5">
              Request AI payment and milestone dispute analysis.
            </p>

            <span className="inline-block bg-indigo-500 px-6 py-3 rounded-2xl font-semibold">
              Start Arbitration
            </span>

          </Link>

        </div>

      </div>

    </div>
  );
}