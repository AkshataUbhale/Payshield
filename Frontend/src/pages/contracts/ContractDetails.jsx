import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('ACTIVE');

  // Mock data
  const contract = {
    id: id,
    title: 'Smart Contract Development for DeFi Protocol',
    clientName: 'DeFi Labs',
    freelancerName: 'Alex.eth',
    amount: '15,000 USDC',
    totalMilestones: 3,
    completedMilestones: 1,
    status: status, // ACTIVE, PENDING_APPROVAL, COMPLETED, DISPUTED
    createdAt: '2026-03-01',
    deadline: '2026-04-15'
  };

  const isClient = user?.role === 'client';

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Contract Details</h1>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              status === 'ACTIVE' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' :
              status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400">Project Title</label>
                  <p className="text-lg text-white font-medium">{contract.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400">Client</label>
                    <p className="text-white">{contract.clientName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">Freelancer</label>
                    <p className="text-white">{contract.freelancerName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <h2 className="text-xl font-bold text-white mb-6">Milestones</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((m) => (
                  <div key={m} className={`p-4 rounded-xl border ${m === 1 ? 'bg-primary-900/10 border-primary-500/30' : 'bg-neutral-900 border-neutral-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">Milestone {m}</h3>
                      <span className="text-primary-500 font-medium">5,000 USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Due: 2026-03-{m * 10}</span>
                      {m === 1 ? (
                        <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Completed</span>
                      ) : m === 2 && contract.status === 'ACTIVE' ? (
                        <span className="text-amber-500 flex items-center gap-1"><Clock className="w-4 h-4"/> In Progress</span>
                      ) : (
                        <span className="text-neutral-500 flex items-center gap-1"><FileText className="w-4 h-4"/> Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Escrow Status */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <div className="flex gap-3 items-center mb-6">
                <Shield className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold text-white">Escrow</h2>
              </div>
              <div className="text-center p-6 bg-neutral-900 rounded-xl mb-6 border border-neutral-700">
                <p className="text-sm text-neutral-400 mb-1">Locked Funds</p>
                <p className="text-3xl font-bold text-primary-500">{contract.amount}</p>
              </div>

              {/* Action Buttons based on Role */}
              <div className="space-y-3">
                {!isClient && status === 'ACTIVE' && (
                  <button 
                    onClick={() => navigate('/freelancer/submit')}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
                  >
                    Submit Deliverable
                  </button>
                )}
                
                {isClient && status === 'PENDING_APPROVAL' && (
                  <button 
                    onClick={() => setStatus('COMPLETED')}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
                  >
                    Approve & Release Funds
                  </button>
                )}

                <button 
                  onClick={() => navigate('/dispute')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-red-500 rounded-xl font-medium border border-neutral-700 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" /> File Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
