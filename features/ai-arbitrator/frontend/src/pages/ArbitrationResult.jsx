import { useLocation, Link } from "react-router-dom";

export default function ArbitrationResult() {
  const location = useLocation();
  const data = location.state?.formData;
  const aiDecision = location.state?.aiDecision;

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-xl">
          <h1 className="text-3xl font-bold mb-4">No Dispute Data Found</h1>
          <p className="text-slate-300 mb-6">Please submit a dispute form first.</p>
          <Link to="/" className="bg-indigo-500 px-6 py-3 rounded-2xl font-semibold">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const isClient = data.userRole === "client";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto bg-white/10 border border-white/20 rounded-3xl p-8">
        <h1 className="text-4xl font-bold mb-2">AI Arbitration Result</h1>
        <p className="text-slate-300 mb-8">Role: {isClient ? "Client" : "Freelancer"}</p>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <Info title="Project Name" value={data.projectName} />
          <Info title="Milestone" value={data.milestoneName} />
          <Info title="Payment Amount" value={data.paymentAmount} />
          <Info title={isClient ? "Freelancer Name" : "Client Name"} value={isClient ? data.freelancerName : data.clientName} />
        </div>

        <Section title="Dispute Summary" text={isClient ? data.clientComplaint : data.clientIssue} />
        <Section title={isClient ? "Expected Work" : "Work Completed"} text={isClient ? data.expectedWork : data.workCompleted} />
        <Section title={isClient ? "Work Received" : "Freelancer Explanation"} text={isClient ? data.workReceived : data.freelancerExplanation} />

        <div className="bg-indigo-500/20 border border-indigo-400 rounded-2xl p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-3">AI Decision</h2>
          <p className="text-slate-200 whitespace-pre-line">
            {aiDecision || "No AI decision received."}
          </p>
        </div>

        <Link to="/" className="inline-block mt-8 bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-2xl font-semibold">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className="bg-white/10 rounded-2xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-lg font-semibold mt-1">{value || "Not provided"}</p>
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="bg-white/10 rounded-2xl p-5 mb-5">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-slate-300">{text || "Not provided"}</p>
    </div>
  );
}