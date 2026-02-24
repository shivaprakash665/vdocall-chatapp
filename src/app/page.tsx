'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, ArrowRight, Sparkles, Moon, Sun } from 'lucide-react';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  const handleCreateRoom = () => {
    if (!name.trim()) return alert('Please enter your name');
    const newRoomId = uuidv4();
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(name.trim())}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return alert('Please enter your name and a Room ID');
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-blue-500/30 relative overflow-hidden ${isDark ? 'bg-[#060913]' : 'bg-gray-50'}`}>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-3 rounded-full transition-all shadow-md flex items-center justify-center ${isDark ? 'bg-[#121622] text-[#8A93A6] border border-[#1F2633] hover:text-white' : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'}`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* Decorative Background Elements */}
      <div className={`absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-[#18347D]/20' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-[#2E1452]/20' : 'bg-purple-400/20'}`} />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`max-w-[420px] w-full rounded-[28px] p-8 md:p-10 space-y-8 relative z-10 transition-colors duration-500 border ${isDark ? 'bg-[#121622] border-[#222836] shadow-2xl shadow-black/50' : 'bg-white border-gray-200 shadow-xl'}`}
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-b from-[#3A76FF] to-[#1D54FF] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(42,101,255,0.3)] mb-6"
            >
              <Video className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className={`text-[32px] font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Connecto</h1>
            <p className={`text-[15px] font-medium transition-colors ${isDark ? 'text-[#8A93A6]' : 'text-gray-600'}`}>Secure, peer-to-peer video calls.</p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <label htmlFor="name" className={`block text-[11px] font-bold uppercase tracking-[0.15em] pl-1 transition-colors ${isDark ? 'text-[#60697A]' : 'text-gray-500'}`}>
                Your Display Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-5 py-[15px] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium border ${isDark ? 'bg-[#060913] border-[#1F2633] text-white placeholder-[#4A5568] hover:border-[#323D52]' : 'bg-black/5 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                placeholder="e.g. Alex"
                autoComplete="off"
              />
            </div>

            <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-[#060913] border-[#1F2633]' : 'bg-gray-100/50 border-gray-200'}`}>
              <button
                onClick={() => setIsJoining(false)}
                className={`py-3 rounded-lg text-[14px] font-medium transition-all duration-300 ${!isJoining ? (isDark ? 'bg-[#242A38] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-[#60697A] hover:text-[#A0AABA] hover:bg-transparent' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5')}`}
              >
                Create Room
              </button>
              <button
                onClick={() => setIsJoining(true)}
                className={`py-3 rounded-lg text-[14px] font-medium transition-all duration-300 ${isJoining ? (isDark ? 'bg-[#242A38] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-[#60697A] hover:text-[#A0AABA] hover:bg-transparent' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5')}`}
              >
                Join Room
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isJoining ? (
                <motion.form
                  key="join"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  onSubmit={handleJoinRoom}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <label htmlFor="roomId" className={`block text-[11px] font-bold uppercase tracking-[0.15em] pl-1 transition-colors ${isDark ? 'text-[#60697A]' : 'text-gray-500'}`}>
                      Room ID
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className={`w-full px-5 py-[15px] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm border ${isDark ? 'bg-[#060913] border-[#1F2633] text-white placeholder-[#4A5568] hover:border-[#323D52]' : 'bg-black/5 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                      placeholder="Paste ID here"
                      autoComplete="off"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 text-[15px] rounded-xl bg-gradient-to-b from-[#3A76FF] to-[#1D54FF] text-white font-semibold tracking-wide shadow-[0_8px_30px_rgba(42,101,255,0.2)] hover:shadow-[0_8px_30px_rgba(42,101,255,0.4)] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Join Call</span>
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateRoom}
                    className="w-full py-4 text-[15px] rounded-xl bg-gradient-to-b from-[#3A76FF] to-[#1D54FF] text-white font-semibold tracking-wide shadow-[0_8px_30px_rgba(42,101,255,0.2)] hover:shadow-[0_8px_30px_rgba(42,101,255,0.4)] transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-[18px] h-[18px]" />
                    <span>Start New Call</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className={`text-center text-[11px] font-medium pt-8 border-t transition-colors ${isDark ? 'text-[#60697A] border-[#1F2633]' : 'text-gray-400 border-gray-200'}`}>
            Peer-to-peer connection • No data stored on servers
          </p>
        </motion.div>
      </div>
    </main>
  );
}
