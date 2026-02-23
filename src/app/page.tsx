'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Video, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
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
    <main className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-gray-900/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 md:p-10 space-y-8 border border-white/10 relative z-10"
      >
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6"
          >
            <Video className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Connect instantly.</h1>
          <p className="text-gray-400 font-medium">Secure, peer-to-peer video calls and chat designed for privacy.</p>
        </div>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
              Your Display Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              placeholder="e.g. Alex"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5">
            <button
              onClick={() => setIsJoining(false)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${!isJoining ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Create Room
            </button>
            <button
              onClick={() => setIsJoining(true)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${isJoining ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Join Room
            </button>
          </div>

          {isJoining ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleJoinRoom}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="roomId" className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
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
        </div>

        <p className="text-center text-xs font-medium text-gray-600 pt-6 border-t border-white/5">
          Peer-to-peer connection • No data stored on servers
        </p>
      </motion.div>
    </main>
  );
}
