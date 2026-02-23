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
  const [isDark, setIsDark] = useState(true);
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
    <main className={`min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-blue-500/30 relative overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-3 rounded-full transition-all shadow-md flex items-center justify-center ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Decorative Background Elements */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-blue-600/20' : 'bg-blue-400/20'}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'}`} />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`max-w-md w-full backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 md:p-10 space-y-8 relative z-10 transition-colors duration-500 border ${isDark ? 'bg-gray-900/80 border-white/10' : 'bg-white/80 border-gray-200'}`}
        >
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"
            >
              <Video className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className={`text-3xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Connect instantly.</h1>
            <p className={`font-medium transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secure, peer-to-peer video calls and chat designed for privacy.</p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label htmlFor="name" className={`block text-xs font-bold uppercase tracking-widest pl-1 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Your Display Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium border ${isDark ? 'bg-black/40 border-white/10 text-white placeholder-gray-600 hover:border-white/20' : 'bg-black/5 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                placeholder="e.g. Alex"
                autoComplete="off"
              />
            </div>

            <div className={`grid grid-cols-2 gap-3 p-1.5 rounded-2xl border transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-100/50 border-gray-200'}`}>
              <button
                onClick={() => setIsJoining(false)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${!isJoining ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5')}`}
              >
                Create Room
              </button>
              <button
                onClick={() => setIsJoining(true)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${isJoining ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : (isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5')}`}
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
                  <div className="space-y-2">
                    <label htmlFor="roomId" className={`block text-xs font-bold uppercase tracking-widest pl-1 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Room ID
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm border ${isDark ? 'bg-black/40 border-white/10 text-white placeholder-gray-600 hover:border-white/20' : 'bg-black/5 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'}`}
                      placeholder="Paste ID here"
                      autoComplete="off"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Join Call</span>
                    <ArrowRight className="w-5 h-5" />
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
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Start New Call</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className={`text-center text-xs font-medium pt-6 border-t transition-colors ${isDark ? 'text-gray-600 border-white/5' : 'text-gray-400 border-gray-200'}`}>
            Peer-to-peer connection • No data stored on servers
          </p>
        </motion.div>
      </div>
    </main>
  );
}
