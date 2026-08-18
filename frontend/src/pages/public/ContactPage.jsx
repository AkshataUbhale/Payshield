import React from 'react';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="text-primary-500">Touch</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Have questions about PayShield? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
            <h2 className="text-2xl font-bold mb-6 text-white">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="button"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary-600/20 rounded-xl text-primary-500">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Email Us</h3>
                <p className="text-neutral-400">support@payshield.app</p>
                <p className="text-neutral-400">partnerships@payshield.app</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary-600/20 rounded-xl text-primary-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Office Location</h3>
                <p className="text-neutral-400">123 Blockchain Ave, Suite 400<br />San Francisco, CA 94107</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary-600/20 rounded-xl text-primary-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Call Us</h3>
                <p className="text-neutral-400">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary-600/20 rounded-xl text-primary-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Live Chat</h3>
                <p className="text-neutral-400">Available Monday through Friday,<br />9am to 6pm PST.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
