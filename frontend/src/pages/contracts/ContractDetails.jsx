import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, FileText, CheckCircle, Clock, ArrowLeft, Send } from 'lucide-react';
import * as api from '../../services/api';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadContract() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('ps_token');
        const data = await api.getContract(id, token);
        if (!data) throw new Error('Contract not found');
        setContract(data);
      } catch (err) {
        console.error('Failed to load contract details:', err);
        setError('Contract not found or network error.');
      } finally {
        setLoading(false);
      }
    }
    loadContract();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 pt-24 text-center text-neutral-400">
        Loading on-chain contract details...
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-neutral-900 pt-24 text-center text-neutral-400 px-4">
        <h2 className="text-xl font-bold text-white mb-2">Contract Not Found</h2>
        <p className="mb-4">{error || 'Contract does not exist.'}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </button>
      </div>
    );
  }

  const isClient = user?.role === 'client' || user?.publicKey === contract.clientPubkey;
  const status = (contract.status || 'open').toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-white">{contract.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                status === 'COMPLETED'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : status === 'IN_PROGRESS'
                  ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <h2 className="text-lg font-bold text-white mb-4">Project Overview</h2>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {contract.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
                <div>
                  <label className="text-xs text-neutral-400">Client Public Key</label>
                  <p className="text-sm text-white font-mono truncate">
                    {contract.clientPubkey || 'Verified Client'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Freelancer Public Key</label>
                  <p className="text-sm text-white font-mono truncate">
                    {contract.freelancerPubkey || 'Unassigned / Open'}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <h2 className="text-lg font-bold text-white mb-4">Milestones & Payout Schedule</h2>
              <div className="space-y-4">
                {contract.milestones && contract.milestones.length > 0 ? (
                  contract.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border bg-neutral-900 border-neutral-700 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium text-white text-sm">{m.title || `Milestone ${idx + 1}`}</h3>
                        <span className="text-xs text-neutral-400">Status: {m.status || 'Pending'}</span>
                      </div>
                      <span className="text-primary-500 font-bold">{m.amount} USDC</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border bg-neutral-900 border-neutral-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white text-sm">Full Project Deliverable</h3>
                      <span className="text-xs text-neutral-400">Status: {contract.status}</span>
                    </div>
                    <span className="text-green-400 font-bold">{contract.budget} USDC</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Escrow Status */}
            <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
              <div className="flex gap-2 items-center mb-4">
                <Shield className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Solana Escrow</h2>
              </div>
              <div className="text-center p-4 bg-neutral-900 rounded-xl mb-4 border border-neutral-700">
                <span className="text-xs text-neutral-400">Total Budget Locked</span>
                <p className="text-2xl font-black text-green-400 mt-1">{contract.budget} USDC</p>
                {contract.escrowPda && (
                  <p className="text-xs text-neutral-500 font-mono mt-2 truncate">
                    PDA: {contract.escrowPda}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {isClient && contract.status === 'in_progress' && (
                  <button
                    className="btn btn-primary w-full justify-center"
                    onClick={() => navigate('/payment-approval')}
                  >
                    Review & Release Payment
                  </button>
                )}
                {!isClient && contract.status === 'in_progress' && (
                  <button
                    className="btn btn-primary w-full justify-center"
                    onClick={() => navigate('/submit-work')}
                  >
                    Submit Proof-of-Work
                  </button>
                )}
                <button
                  className="btn btn-secondary w-full justify-center"
                  onClick={() => navigate('/chat')}
                >
                  Direct Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
