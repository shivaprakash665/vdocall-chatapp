'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Video, Keyboard, Plus, HelpCircle, MessageSquareWarning, Settings, Grip, Calendar } from 'lucide-react';

export default function LandingPage() {
  const [roomId, setRoomId] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = uuidv4();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    router.push(`/room/${roomId.trim()}`);
  };

  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans flex flex-col selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white hover:border-gray-100 transition-colors">
        <div className="flex items-center space-x-2">
          <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-2 cursor-pointer select-none">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded bg-blue-500 z-10"></div>
              <div className="w-4 h-4 rounded bg-green-500 z-0 transform translate-y-1"></div>
              <div className="w-4 h-4 rounded bg-yellow-500 -z-10 transform -translate-y-1"></div>
              <div className="w-4 h-4 rounded bg-red-500 -z-20 transform translate-y-2"></div>
            </div>
            <span className="text-xl text-gray-600 font-medium tracking-tight mt-0.5">Google Meet</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 text-gray-600">
          <span className="text-sm mr-4 hidden md:block">{currentTime}</span>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"><HelpCircle className="w-5 h-5" /></button>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"><MessageSquareWarning className="w-5 h-5" /></button>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"><Settings className="w-5 h-5" /></button>
          <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"><Grip className="w-5 h-5" /></button>
          <button className="ml-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shadow-sm hover:ring-2 ring-offset-2 ring-blue-500 transition-shadow">
            S
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[180px] hidden lg:flex flex-col py-4 border-r border-transparent">
          <nav className="space-y-1 px-3">
            <button className="w-full flex items-center space-x-3 bg-blue-600/10 text-blue-700 px-4 py-3 rounded-full font-medium text-sm transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Meetings</span>
            </button>
            <button className="w-full flex items-center space-x-3 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-full font-medium text-sm transition-colors">
              <Video className="w-5 h-5" />
              <span>Calls</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:mr-[180px]">
          <div className="max-w-[650px] w-full text-center space-y-4">
            <h1 className="text-[44px] sm:text-[48px] leading-tight text-gray-900 tracking-normal mb-6">
              Video calls and meetings for<br />everyone
            </h1>
            <p className="text-[18px] text-gray-600 mb-10 max-w-xl mx-auto">
              Connect, collaborate, and celebrate from anywhere with Google Meet
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={handleCreateRoom}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md font-medium text-[15px] transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>New meeting</span>
              </button>

              <form onSubmit={handleJoinRoom} className="flex w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Keyboard className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-400 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md focus:outline-none transition-all text-gray-800 placeholder-gray-500 text-[15px]"
                    placeholder="Enter a code or link"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!roomId.trim()}
                  className={`ml-2 px-4 py-3.5 rounded-md font-medium text-[15px] transition-colors ${roomId.trim() ? 'text-[#1a73e8] hover:bg-blue-50' : 'text-gray-400 bg-transparent'}`}
                >
                  Join
                </button>
              </form>
            </div>

            <div className="hidden sm:block mt-24 border-t border-gray-200 w-full max-w-[600px] mx-auto pt-6"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
