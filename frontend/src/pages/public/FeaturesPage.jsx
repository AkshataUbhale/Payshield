import React from 'react';
import { Layers, Zap, Hexagon, Shield, Smartphone, Globe } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-500" />,
      title: "Smart Contract Escrow",
      description: "Funds are locked in a trustless smart contract. They are released only when both parties agree the milestone is met."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: "Instant Global Payouts",
      description: "No more waiting for wire transfers. Payments land in your wallet instantly as soon as work is approved."
    },
    {
      icon: <Layers className="w-8 h-8 text-primary-500" />,
      title: "Milestone-based Payments",
      description: "Break complex projects down into smaller milestones, padding risk for both freelancers and clients."
    },
    {
      icon: <Hexagon className="w-8 h-8 text-primary-500" />,
      title: "Decentralized Arbitration",
      description: "Disputes are settled by impartially vetted jurors using an unbiased on-chain resolution framework."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary-500" />,
      title: "Seamless Messaging",
      description: "Communicate securely on-platform, keeping a verifiable record of specifications and feedback."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary-500" />,
      title: "Multi-Chain Support",
      description: "Pay and get paid in your preferred tokens across Ethereum, Polygon, and Binance Smart Chain."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for <br/><span className="text-primary-500">Modern Freelancing</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Everything you need to manage your freelance business or hire top talent securely using Web3.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 hover:border-primary-500/50 transition-all duration-300">
              <div className="bg-primary-900/30 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
