import React from 'react';
import { motion } from 'motion/react';
import { Edit2, Award, BookOpen, Clock } from 'lucide-react';

export function ProfileHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c0392b]/10 rounded-full -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-500/10 rounded-full translate-y-10" />

      <div className="relative flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-2xl"
            >
              R
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1a1a2e]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-xl text-white"
              >
                Rahul Sharma
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">rahul.sharma@example.com</p>
            </div>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-white text-sm">148</p>
                <p className="text-gray-400 text-xs">Articles read</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-white text-sm">12.4h</p>
                <p className="text-gray-400 text-xs">This month</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm">Gold</p>
                <p className="text-gray-400 text-xs">Reader tier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
