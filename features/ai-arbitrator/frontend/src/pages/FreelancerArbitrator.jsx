import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FreelancerArbitrator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userRole: "freelancer",
    projectName: "",
    clientName: "",
    milestoneName: "",
    paymentAmount: "",
    workCompleted: "",
    clientIssue: "",
    freelancerExplanation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3001/api/ai/disputes/arbitrate-precedents",
        {
          projectName: formData.projectName,
          milestoneName: formData.milestoneName,
          paymentAmount: formData.paymentAmount,
          userRole: formData.userRole,
          complaint: formData.clientIssue,
          workExpected: formData.workCompleted,
          workDelivered: formData.freelancerExplanation,
        }
      );

      navigate("/arbitration-result", {
        state: {
          formData,
          aiDecision: response.data.aiDecision,
          citedPrecedents: response.data.citedPrecedents || [],
          suggestedSplit: response.data.suggestedSplit,
          confidenceScore: response.data.confidenceScore,
        },
      });
    } catch (error) {
        console.log("Axios error:", error);
        alert("Backend error: " + error.message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Freelancer AI Arbitrator</h1>

      <div className="max-w-4xl bg-white/10 border border-white/20 rounded-3xl p-8">
        <input name="projectName" onChange={handleChange} className="input mb-4" placeholder="Project Name" />
        <input name="clientName" onChange={handleChange} className="input mb-4" placeholder="Client Name" />
        <input name="milestoneName" onChange={handleChange} className="input mb-4" placeholder="Milestone Name" />
        <input name="paymentAmount" onChange={handleChange} className="input mb-4" placeholder="Payment Amount" />

        <textarea name="workCompleted" onChange={handleChange} className="input mb-4 h-32" placeholder="What work did you complete?" />
        <textarea name="clientIssue" onChange={handleChange} className="input mb-4 h-32" placeholder="What is the client issue?" />
        <textarea name="freelancerExplanation" onChange={handleChange} className="input mb-6 h-32" placeholder="Explain your side..." />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all py-4 rounded-2xl font-semibold text-lg disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze Dispute"}
        </button>
      </div>
    </div>
  );
}