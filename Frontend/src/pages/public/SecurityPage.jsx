import React from 'react';
import { Shield, Lock, CheckCircle, Cpu, FileText } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Security at <span className="text-primary-500">PayShield</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Bank-grade security combined with decentralized trust to keep your funds and data safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/30 transition-colors">
            <Lock className="w-12 h-12 text-primary-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">Smart Contract Security</h3>
            <p className="text-neutral-400">
              Our escrow smart contracts are audited by top tier security firms. Funds are locked securely on the blockchain and can only be released when conditions are met.
            </p>
          </div>

          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/30 transition-colors">
            <Shield className="w-12 h-12 text-primary-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">Identity Verification</h3>
            <p className="text-neutral-400">
              All users on our platform go through a thorough KYC/KYB process ensuring trust and accountability in every transaction.
            </p>
          </div>

          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/30 transition-colors">
            <Cpu className="w-12 h-12 text-primary-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">Decentralized Storage</h3>
            <p className="text-neutral-400">
              Project deliverables and sensitive files are encrypted and stored on IPFS, ensuring maximum privacy and data persistence without a central point of failure.
            </p>
          </div>

          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/30 transition-colors">
            <CheckCircle className="w-12 h-12 text-primary-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">Fair Dispute Resolution</h3>
            <p className="text-neutral-400">
              In case of a disagreement, our decentralized arbitration system relies on impartial, randomly selected jurors with industry expertise.
            </p>
          </div>

          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/30 transition-colors">
            <FileText className="w-12 h-12 text-primary-500 mb-6" />
            <h3 className="text-xl font-semibold mb-4 text-white">End-to-End Encryption</h3>
            <p className="text-neutral-400">
              All communications and messages between clients and freelancers are encrypted end-to-end, so your intellectual property remains yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
