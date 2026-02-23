'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, use } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import Chat from '@/components/Chat';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff,
    Copy, Check, UserPlus, Users, Loader2, Hand, Smile,
    MessageSquare, X, Info, Moon, Sun
} from 'lucide-react';

const EMOJI_LIST = ['👍', '👎', '👏', '😂', '🎉', '😢', '🤔', '❤️'];

// Subcomponent to render a single remote video tile
const RemoteVideoTile = ({ stream, userId, name, isHandRaised, isDark }: { stream: MediaStream, userId: string, name?: string, isHandRaised: boolean, isDark: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className={`w-full h-full relative ${isDark ? 'bg-[#3C4043]' : 'bg-gray-200'} rounded-2xl shadow-xl overflow-hidden border-2 transition-colors ${isHandRaised ? 'border-blue-500' : 'border-transparent'}`}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            {isHandRaised && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg animate-bounce z-20">
                    <Hand className="w-5 h-5 fill-current" />
                </div>
            )}
            <div className={`absolute bottom-4 left-4 ${isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-gray-900'} backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 z-20`}>
                <span className="text-sm font-medium">{name || 'Partner'}</span>
            </div>
        </motion.div>
    );
};


export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const username = searchParams.get('name') || 'Anonymous';
    const roomId = id;

    const {
        localStream,
        remoteStreams,
        messages,
        sendMessage,
        sendFile,
        toggleScreenShare,
        isScreenSharing,
        raisedHands,
        toggleHandRaise,
        emojiReactions,
        sendEmoji,
        peerNames
    } = useWebRTC(roomId, username);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Theme state
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleAudioToggle = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const handleVideoToggle = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const remotePeers = Object.entries(remoteStreams);
    const peerConnectedCount = remotePeers.length;
    const isMyHandRaised = raisedHands.includes('me');

    // Grid classes based on participant count
    let gridClass = 'grid-cols-1 grid-rows-1';
    if (peerConnectedCount === 1) gridClass = 'md:grid-cols-2 grid-cols-1';
    else if (peerConnectedCount >= 2) gridClass = 'grid-cols-2 grid-rows-2';

    return (
        <div className={`h-screen flex flex-col overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300 ${isDark ? 'bg-[#202124]' : 'bg-gray-100'}`}>

            {/* Top-Right Absolute Floating Copy Box if Chat is closed */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute top-4 right-4 z-40 shadow-xl rounded-xl p-4 flex flex-col space-y-3 w-72 ${isDark ? 'bg-white' : 'bg-white border border-gray-200'}`}
                    >
                        <h3 className="text-gray-900 font-medium text-sm">Meeting is ready</h3>
                        <div className="flex rounded-md bg-gray-100 p-1 items-center justify-between">
                            <span className="text-gray-600 text-xs truncate px-2">{roomId}</span>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={copyRoomId}
                                    className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition"
                                    title="Copy Room ID"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Join my secure WebRTC Video Call! Room ID: ${roomId}\n\nJoin here: ${typeof window !== 'undefined' ? window.location.origin : ''}/room/${roomId}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-green-100 rounded text-green-600 transition"
                                    title="Share via WhatsApp"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Joined as <span className="font-semibold text-gray-700">{username}</span></p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area (Video Grid + Optional Sidebar) */}
            <div className="flex-1 flex overflow-hidden p-4 pb-24 space-x-4">
                {/* Main Video Area */}
                <div className="flex-1 relative flex flex-col items-center justify-center">

                    {/* Floating Emojis Overlay */}
                    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                        <AnimatePresence>
                            {emojiReactions.map(reaction => (
                                <motion.div
                                    key={reaction.id}
                                    initial={{ opacity: 0, y: '100%', scale: 0.5, x: Math.random() * 100 - 50 }}
                                    animate={{ opacity: [0, 1, 1, 0], y: ['50%', '0%', '-50%', '-100%'], scale: [0.5, 1.5, 1.5, 0.8] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2.5, ease: "easeOut" }}
                                    className="absolute bottom-10 left-1/2 text-5xl flex flex-col items-center ml-[-1.5rem]"
                                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                                >
                                    {reaction.emoji}
                                    <span className="mt-1 text-[11px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-md">
                                        {reaction.senderName}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Grid Layout */}
                    <motion.div
                        layout
                        className={`w-full h-full max-w-[1400px] grid gap-4 p-2 transition-all duration-300 ${gridClass}`}
                    >
                        {/* Always show Local Video as a grid item instead of PIP in Meet style if there are others, but for simplicity we can make it a prominent tile */}
                        <motion.div
                            layout
                            className={`w-full h-full relative ${isDark ? 'bg-[#3C4043]' : 'bg-gray-300'} rounded-2xl shadow-xl overflow-hidden border-2 transition-colors ${isMyHandRaised ? 'border-blue-500' : 'border-transparent'}`}
                        >
                            {localStream ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`}
                                />
                            ) : null}
                            {(isVideoOff && !isScreenSharing) && (
                                <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-[#3C4043]' : 'bg-gray-200'}`}>
                                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-lg">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            )}
                            {isScreenSharing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40">
                                    <span className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-xl flex items-center">
                                        <MonitorUp className="w-4 h-4 mr-2" />
                                        You are presenting
                                    </span>
                                </div>
                            )}
                            {isMyHandRaised && (
                                <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg animate-bounce z-20">
                                    <Hand className="w-5 h-5 fill-current" />
                                </div>
                            )}
                            {isMuted && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white p-1.5 rounded-full shadow-lg z-20">
                                    <MicOff className="w-4 h-4" />
                                </div>
                            )}
                            <div className={`absolute bottom-4 left-4 ${isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-gray-900'} backdrop-blur-md px-3 py-1.5 rounded-lg z-20`}>
                                <span className="text-sm font-medium">{username} (You)</span>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {remotePeers.map(([userId, stream]) => (
                                <RemoteVideoTile
                                    key={userId}
                                    userId={userId}
                                    stream={stream}
                                    name={peerNames[userId]}
                                    isHandRaised={raisedHands.includes(userId)}
                                    isDark={isDark}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Waiting Placeholder if nobody is connected */}
                        {peerConnectedCount === 0 && (
                            <motion.div
                                className={`w-full h-full relative ${isDark ? 'bg-[#3C4043] border-white/5' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border flex flex-col items-center justify-center`}
                            >
                                <Users className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <h2 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Waiting for others to join</h2>
                                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Send them the room link to connect</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Optional Chat Sidebar */}
                <AnimatePresence mode="wait">
                    {isChatOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`h-full ${isDark ? 'bg-white' : 'bg-white'} rounded-2xl overflow-hidden shadow-2xl flex flex-col`}
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                    In-call messages
                                </h2>
                                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-3 bg-gray-50 border-b text-xs text-gray-500 flex items-start space-x-2">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>Messages can only be seen by people in the call and are deleted when the call ends.</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <Chat messages={messages} onSendMessage={sendMessage} onSendFile={sendFile} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Google Meet Bottom Control Bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-20 ${isDark ? 'bg-[#202124]' : 'bg-white border-t border-gray-200'} flex items-center justify-between px-6 z-40 transition-colors duration-300`}>
                {/* Left: Time & Room ID */}
                <div className={`flex items-center space-x-4 font-medium text-sm hidden md:flex ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <span>{currentTime}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-300'}>|</span>
                    <span>{roomId}</span>
                </div>

                {/* Center: Controls */}
                <div className="flex absolute left-1/2 -translate-x-1/2 items-center space-x-3">
                    <button
                        onClick={handleAudioToggle}
                        className={`p-3.5 rounded-full transition shadow-sm flex items-center justify-center ${isMuted ? 'bg-[#EA4335] text-white hover:bg-[#D93025]' : (isDark ? 'bg-[#3C4043] text-white hover:bg-[#4A4E51]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                        title={isMuted ? "Turn on microphone" : "Turn off microphone"}
                    >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={handleVideoToggle}
                        className={`p-3.5 rounded-full transition shadow-sm flex items-center justify-center ${isVideoOff ? 'bg-[#EA4335] text-white hover:bg-[#D93025]' : (isDark ? 'bg-[#3C4043] text-white hover:bg-[#4A4E51]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={toggleScreenShare}
                        className={`p-3.5 rounded-full transition shadow-sm flex items-center justify-center ${isScreenSharing ? 'bg-[#8AB4F8] text-gray-900 hover:bg-[#9EBEF9]' : (isDark ? 'bg-[#3C4043] text-white hover:bg-[#4A4E51]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                        title={isScreenSharing ? "Stop presenting" : "Present now"}
                    >
                        <MonitorUp className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => toggleHandRaise(!isMyHandRaised)}
                        className={`p-3.5 rounded-full transition shadow-sm flex items-center justify-center ${isMyHandRaised ? 'bg-[#8AB4F8] text-gray-900 hover:bg-[#9EBEF9]' : (isDark ? 'bg-[#3C4043] text-white hover:bg-[#4A4E51]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                        title={isMyHandRaised ? "Lower Hand" : "Raise Hand"}
                    >
                        <Hand className={`h-5 w-5 ${isMyHandRaised ? 'fill-current' : ''}`} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-3.5 rounded-full transition shadow-sm flex items-center justify-center ${showEmojiPicker ? (isDark ? 'bg-[#4A4E51] text-white' : 'bg-gray-300 text-gray-900') : (isDark ? 'bg-[#3C4043] text-white hover:bg-[#4A4E51]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                            title="Send a reaction"
                        >
                            <Smile className="h-5 w-5" />
                        </button>

                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 ${isDark ? 'bg-[#3C4043] border-white/10' : 'bg-white border-gray-200'} p-2 rounded-full shadow-2xl flex space-x-1 border`}
                                >
                                    {EMOJI_LIST.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                sendEmoji(emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className={`w-10 h-10 text-2xl hover:scale-125 rounded-full transition flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-3.5 px-6 rounded-full bg-[#EA4335] text-white hover:bg-[#D93025] flex items-center justify-center transition-colors shadow-sm ml-2"
                        title="Leave call"
                    >
                        <PhoneOff className="h-5 w-5" />
                    </button>
                </div>

                {/* Right: Info, Chat Icons */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-3 rounded-full transition flex items-center justify-center ${isDark ? 'text-white hover:bg-[#3C4043]' : 'text-gray-800 hover:bg-gray-100'}`}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`p-3 rounded-full transition flex items-center justify-center relative ${isChatOpen ? (isDark ? 'bg-[#a8c7fa]/20 text-[#a8c7fa]' : 'bg-blue-100 text-blue-600') : (isDark ? 'text-white hover:bg-[#3C4043]' : 'text-gray-800 hover:bg-gray-100')}`}
                        title="Chat with everyone"
                    >
                        <MessageSquare className="h-6 w-6" />
                        {messages.length > 0 && !isChatOpen && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-transparent" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
