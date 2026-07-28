import React from 'react';
import { Target, Users, Zap, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-primary-500">PayShield</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            We are revolutionizing freelance work by bringing trust, transparency, and speed into global payments through blockchain technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-lg text-neutral-400 mb-6">
              In a world where remote work is the standard, payment disputes and high fees remain the biggest hurdles. PayShield is designed to empower freelancers to work globally without worrying about not getting paid, and to give clients the peace of mind that their money only moves when the job is done right.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle className="text-primary-500 w-6 h-6" /> Zero borders, instant cross-border payments.
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle className="text-primary-500 w-6 h-6" /> Transparent smart contract-based escrows.
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle className="text-primary-500 w-6 h-6" /> Dispute resolution backed by decentralized juries.
              </li>
            </ul>
          </div>
          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
                <div className="text-3xl font-bold text-white mb-2">1M+</div>
                <div className="text-neutral-400 text-sm">Escrows Created</div>
              </div>
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
                <div className="text-3xl font-bold text-white mb-2">$50M+</div>
                <div className="text-neutral-400 text-sm">Total Volume</div>
              </div>
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
                <div className="text-3xl font-bold text-white mb-2">0%</div>
                <div className="text-neutral-400 text-sm">Payment Defaults</div>
              </div>
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700">
                <div className="text-3xl font-bold text-white mb-2">50k+</div>
                <div className="text-neutral-400 text-sm">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
              <Target className="w-12 h-12 text-primary-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Trustless Security</h3>
              <p className="text-neutral-400">No need to blindly trust the other party. Our immutable smart contracts guarantee fairness.</p>
            </div>
            <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
              <Users className="w-12 h-12 text-primary-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Community Driven</h3>
              <p className="text-neutral-400">Built by freelancers and top-tier clients, iterating on feedback to make the platform frictionless.</p>
            </div>
            <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
              <Zap className="w-12 h-12 text-primary-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-white">Lightning Fast</h3>
              <p className="text-neutral-400">Say goodbye to 5-day bank hold times. Accept crypto payments instantly with zero friction.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
