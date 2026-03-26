import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { RoleSelector } from '../components/profile/RoleSelector';
import { InterestSelector } from '../components/profile/InterestSelector';
import { BehaviorInsights } from '../components/profile/BehaviorInsights';
import { ProfileSummary } from '../components/profile/ProfileSummary';

const SETTINGS = [
  { icon: Bell, label: 'Notification Preferences', desc: 'Manage alerts and digests' },
  { icon: Shield, label: 'Privacy & Data', desc: 'Control your data and privacy settings' },
  { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs and contact support' },
];

export function Profile() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <Container className="py-6">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Newsroom
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main column */}
          <div className="lg:col-span-8 space-y-5">
            <ProfileHeader />
            <RoleSelector />
            <InterestSelector />
            <BehaviorInsights />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <ProfileSummary />

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-5 py-3 border-b border-gray-100">
                <h3
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-gray-900"
                >
                  Settings
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {SETTINGS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  );
                })}

                <button className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 transition-colors text-left group">
                  <div className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <LogOut className="w-4 h-4 text-[#c0392b]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#c0392b]">Sign Out</p>
                    <p className="text-xs text-gray-500">rahul.sharma@example.com</p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-2xl transition-colors shadow-sm"
            >
              Save Preferences
            </motion.button>
          </div>
        </div>
      </Container>
    </div>
  );
}