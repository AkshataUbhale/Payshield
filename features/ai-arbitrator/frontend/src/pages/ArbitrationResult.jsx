import { useLocation, Link } from "react-router-dom";

export default function ArbitrationResult() {
  const location = useLocation();
  const data = location.state?.formData;
  const aiDecision = location.state?.aiDecision;
  const citedPrecedents = location.state?.citedPrecedents || [];
  const suggestedSplit = location.state?.suggestedSplit;
  const confidenceScore = location.state?.confidenceScore;

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-xl backdrop-blur-md">
          <h1 className="text-3xl font-bold mb-4">No Dispute Data Found</h1>
          <p className="text-slate-300 mb-6">Please submit a dispute form first.</p>
          <Link to="/" className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-2xl font-semibold transition-all">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const isClient = data.userRole === "client";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto bg-slate-900/80 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Web3 RAG Arbitration
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Kleros-Aligned Precedent Model
              </span>
              {confidenceScore && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {confidenceScore}% Confidence
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">AI Arbitration Ruling</h1>
            <p className="text-slate-400 text-sm mt-1">Submitted by: <span className="text-indigo-300 font-semibold">{isClient ? "Client" : "Freelancer"}</span></p>
          </div>
          
          <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            <p className="text-xs text-slate-400">Escrow Value</p>
            <p className="text-xl font-bold text-emerald-400">{data.paymentAmount ? `${data.paymentAmount} SOL / USDC` : "Escrowed"}</p>
          </div>
        </div>

        {/* Project Meta Details */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Info title="Project Name" value={data.projectName} />
          <Info title="Milestone" value={data.milestoneName} />
          <Info title={isClient ? "Freelancer Name" : "Client Name"} value={isClient ? data.freelancerName : data.clientName} />
        </div>

        {/* Escrow Split Visualization */}
        {suggestedSplit && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 text-slate-200">Recommended Escrow Split</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-blue-400 font-semibold">Client: {suggestedSplit.clientPercent}%</span>
                  <span className="text-emerald-400 font-semibold">Freelancer: {suggestedSplit.freelancerPercent}%</span>
                </div>
                <div className="h-4 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full rounded-l-full transition-all"
                    style={{
                      width: `${suggestedSplit.clientPercent}%`,
                      background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                    }}
                  />
                  <div
                    className="h-full rounded-r-full transition-all"
                    style={{
                      width: `${suggestedSplit.freelancerPercent}%`,
                      background: "linear-gradient(90deg, #10b981, #06b6d4)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RAG Precedent Citations */}
        {citedPrecedents.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-bold text-indigo-200 flex items-center gap-2">
              <span>⚖️</span> Cited Web3 Precedents ({citedPrecedents.length})
            </h2>
            {citedPrecedents.map((prec, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-inner"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-indigo-500/25 text-indigo-300 text-xs font-bold rounded-lg">
                    {prec.id}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-lg capitalize">
                    {prec.category?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-100 mb-1">{prec.title}</p>
                <p className="text-xs text-slate-400 mb-2">{prec.caseSummary}</p>
                <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/20 px-3 py-1 rounded-xl text-xs text-indigo-300 font-semibold">
                  <span>Precedent Split:</span>
                  <span className="text-white font-bold">Client {prec.clientSplitPercent}% / Freelancer {prec.freelancerSplitPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evidence & Statements Breakdown */}
        <div className="space-y-4 mb-8">
          <Section title="Dispute Summary" text={isClient ? data.clientComplaint : data.clientIssue} />
          <Section title={isClient ? "Expected Deliverable" : "Work Completed"} text={isClient ? data.expectedWork : data.workCompleted} />
          <Section title={isClient ? "Delivered Work Observed" : "Freelancer Explanation"} text={isClient ? data.workReceived : data.freelancerExplanation} />
        </div>

        {/* AI Final Decision */}
        <div className="bg-indigo-900/30 border border-indigo-500/40 rounded-3xl p-6 md:p-8 mt-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold text-white">Official Arbitrator Verdict</h2>
          </div>
          <div className="text-slate-200 whitespace-pre-line leading-relaxed text-sm md:text-base bg-slate-950/60 p-5 rounded-2xl border border-white/5">
            {aiDecision || "No AI decision received."}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <Link to="/" className="w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3.5 rounded-2xl font-semibold transition-all">
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => alert("Simulated on-chain Solana escrow split transaction signed & executed!")}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Execute Split on Solana
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-slate-400 text-xs uppercase tracking-wide">{title}</p>
      <p className="text-base font-semibold text-slate-100 mt-1 truncate">{value || "Not provided"}</p>
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{title}</h3>
      <p className="text-slate-200 text-sm leading-relaxed">{text || "Not provided"}</p>
    </div>
  );
}