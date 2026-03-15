import React from 'react';
import { UserPlus, Briefcase, FileSignature, Wallet, CheckCircle } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-primary-500" />,
      title: "1. Create Your Profile",
      description: "Sign up and connect your Web3 wallet. Set your role as a Client looking to hire or a Freelancer looking for work."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-primary-500" />,
      title: "2. Post or Apply",
      description: "Clients post detailed job descriptions. Freelancers browse listings, submit proposals, and bid their rates."
    },
    {
      icon: <FileSignature className="w-8 h-8 text-primary-500" />,
      title: "3. Form an Escrow Contract",
      description: "Once terms are agreed upon, the Client funds an on-chain smart contract. The Freelancer gets a cryptographic guarantee of payment."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary-500" />,
      title: "4. Submit & Approve Work",
      description: "Freelancers submit deliverables directly through the platform. Clients review and approve the work with a single click."
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary-500" />,
      title: "5. Get Paid Instantly",
      description: "Upon approval, the smart contract automatically releases funds to the Freelancer's wallet. Zero delays, zero middlemen."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How <span className="text-primary-500">PayShield</span> Works
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            A seamless, secure, and trustless process for managing remote work agreements.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-700 before:to-transparent">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-neutral-900 bg-neutral-800 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-neutral-800 p-6 rounded-2xl border border-neutral-700 md:group-odd:text-right hover:border-primary-500/50 transition-colors">
                  <div className={`flex items-center gap-4 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    {step.icon}
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-neutral-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
