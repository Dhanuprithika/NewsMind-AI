import React from 'react';
import { motion } from 'motion/react';
import { useUser } from '../../hooks/UserContext';
import { Briefcase, TrendingUp, Building2, Code, GraduationCap, BarChart3 } from 'lucide-react';

const ROLES = [
  { id: 'investor', label: 'Investor', icon: TrendingUp, desc: 'Portfolio & markets focus' },
  { id: 'professional', label: 'Business Professional', icon: Briefcase, desc: 'Industry & corporate news' },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: Building2, desc: 'Startup & funding news' },
  { id: 'developer', label: 'Tech Professional', icon: Code, desc: 'Tech & product news' },
  { id: 'student', label: 'Student / Researcher', icon: GraduationCap, desc: 'Learning & analysis' },
  { id: 'analyst', label: 'Financial Analyst', icon: BarChart3, desc: 'Deep financial data' },
];

export function RoleSelector() {
  const { userType: selected, setUserType: setSelected } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <h3
        style={{ fontFamily: "'Playfair Display', serif" }}
        className="text-gray-900 mb-1"
      >
        Your Role
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Personalises your news feed and briefing tone
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = selected === role.id;
          return (
            <motion.button
              key={role.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(role.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-md'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1.5 ${isActive ? 'text-amber-400' : 'text-gray-500'}`}
              />
              <p className="text-sm leading-tight">{role.label}</p>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                {role.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
