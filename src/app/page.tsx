'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Video, Plus, Share2, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const [roomId, setRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!roomId.trim()) return;
    // Extract ID if a link is pasted
    let finalId = roomId.trim();
    if (finalId.includes('/room/')) {
      finalId = finalId.split('/room/')[1];
    }
    router.push(`/room/${finalId}`);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Static recent meeting ID for demo purposes
  const demoRecentId = 'connecto-demo-room';

  const copyRecentLink = () => {
    if (typeof window === 'undefined') return;
    const link = `${window.location.origin}/room/${demoRecentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinRecentRoom = () => {
    router.push(`/room/${demoRecentId}`);
  };

  return (
    <main className="min-h-screen bg-white font-sans flex flex-col pt-12 text-slate-800">
      {/* Top Section */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1280px] mx-auto w-full px-6 lg:px-12 items-center justify-between gap-12 pt-6 lg:pt-16">

        {/* Left Column */}
        <div className="flex-1 max-w-[540px] space-y-8">
          <h1 className="text-[44px] leading-tight font-bold text-slate-800">Connecto Video Meetings</h1>
          <p className="text-[20px] text-slate-500 font-normal">Secure, fast and simple video calls for everyone.</p>

          <div className="flex flex-col space-y-4 pt-2">
            {/* Join a Meeting Button */}
            <button
              onClick={focusInput}
              className="group flex items-center justify-start w-[320px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-4 transition-all"
            >
              <Video className="w-6 h-6 mr-5 fill-current stroke-current" />
              <span className="font-medium text-lg tracking-wide">Join a Meeting</span>
            </button>

            {/* Create a Room Button */}
            <button
              onClick={handleCreateRoom}
              className="group flex items-center justify-start w-[320px] bg-gradient-to-r from-[#2ca58d] to-[#2ca58d] hover:bg-[#258e7a] text-white rounded-xl px-6 py-4 shadow-[0_4px_14px_0_rgba(44,165,141,0.39)] hover:shadow-[0_6px_20px_rgba(44,165,141,0.23)] transition-all"
            >
              <div className="bg-white rounded-full flex items-center justify-center w-[26px] h-[26px] mr-5 shadow-sm">
                <Plus className="w-5 h-5 text-[#2ca58d] stroke-[4]" />
              </div>
              <span className="font-medium text-lg tracking-wide">Create a Room</span>
            </button>
          </div>
        </div>

        {/* Right Column (Grid) */}
        <div className="flex-1 w-full flex justify-end pb-8">
          <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[640px]">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop" alt="User 1" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop" alt="User 2" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop" alt="User 3" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="User 4" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop" alt="User 5" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop" alt="User 6" className="w-full aspect-[4/3] object-cover rounded-xl" />
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 mt-8 sm:mt-16 bg-[#fafafa] w-full py-10 flex-col flex-1">
        <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 space-y-6">
          <h2 className="text-slate-600 font-semibold text-[17px]">Recent Meetings</h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Input Group */}
            <form onSubmit={handleJoinRoom} className="flex items-center gap-3 w-full md:w-auto">
              <input
                ref={inputRef}
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="bg-white sm:bg-[#f6f7f9] border border-gray-200 text-gray-800 text-[15px] rounded-xl px-5 py-3 w-full sm:w-[360px] outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400 transition"
                placeholder="Enter a code or link"
              />
              <button type="submit" className="bg-blue-500 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-600 transition shadow-sm">
                Join
              </button>
            </form>

            {/* Recent Meeting Card */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] space-x-2 lg:space-x-4 text-[14px] md:ml-auto w-full md:w-auto overflow-hidden">
              <button type="button" onClick={copyRecentLink} className="flex items-center text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition gap-2.5 outline-none focus:ring-2 focus:ring-slate-200">
                {copied ? <Check className="w-[18px] h-[18px] text-green-500" /> : <Share2 className="w-[18px] h-[18px] text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
                <ChevronRight className="w-[18px] h-[18px] text-slate-300 ml-1" />
              </button>

              <div className="w-[1px] h-6 bg-gray-200 hidden sm:block"></div>

              <button type="button" onClick={joinRecentRoom} className="flex items-center text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition gap-2.5 pr-2 outline-none focus:ring-2 focus:ring-slate-200">
                <Video className="w-[18px] h-[18px] text-slate-400 fill-current" />
                <span>Join</span>
                <ChevronRight className="w-[18px] h-[18px] text-slate-300 ml-1" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
