'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, use } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import Chat from '@/components/Chat';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff,
    Copy, Check, UserPlus, Users, Loader2
} from 'lucide-react';

// Subcomponent to render a single remote video tile
const RemoteVideoTile = ({ stream, userId }: { stream: MediaStream, userId: string }) => {
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
            className="w-full h-full relative bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/5"
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white text-[11px] font-bold uppercase tracking-widest">Partner</span>
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
        isScreenSharing
    } = useWebRTC(roomId, username);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
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

    // Determine grid layout based on number of participants
    let gridClass = 'grid-cols-1 grid-rows-1';
    if (peerConnectedCount === 2) gridClass = 'md:grid-cols-2 md:grid-rows-1 grid-cols-1 grid-rows-2';
    else if (peerConnectedCount >= 3) gridClass = 'grid-cols-2 grid-rows-2';

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-950 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Main Video Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-6 pb-28 md:pb-6">

                {/* Room ID & Info Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-6 left-6 z-10 flex items-center space-x-4"
                >
                    <div className="bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-lg border border-white/10 flex items-center space-x-4 group transition-all hover:bg-black/60">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <Users className="w-3.5 h-3.5 mr-2 opacity-70" />
                            Room
                        </span>
                        <span className="text-sm font-mono font-medium text-gray-200 select-all">{roomId}</span>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={copyRoomId}
                                className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                title="Copy Room ID"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Check className="h-4 w-4" strokeWidth={3} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Copy className="h-4 w-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    const url = `${window.location.origin}/room/${roomId}`;
                                    const text = `Join my video call!\n\nRoom ID: ${roomId}\n\nClick here to join directly: ${url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all border border-green-500/30"
                                title="Share via WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.85-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.3.19-.55.07-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.28z" /></svg>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Remote Video Grid */}
                <motion.div
                    layout
                    className={`relative w-full h-full max-w-7xl max-h-[85vh] grid justify-center items-center gap-4 ${gridClass}`}
                >
                    <AnimatePresence>
                        {peerConnectedCount > 0 ? (
                            remotePeers.map(([userId, stream]) => (
                                <RemoteVideoTile key={userId} userId={userId} stream={stream} />
                            ))
                        ) : (
                            <motion.div
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="col-span-full text-gray-400 flex flex-col items-center justify-center space-y-8 p-8 h-full bg-gray-900 rounded-[2rem] border border-white/5 shadow-2xl"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-full bg-blue-500/30 blur-xl"
                                    />
                                    <div className="relative w-28 h-28 bg-gray-800/80 rounded-full flex items-center justify-center border border-white/5 shadow-2xl backdrop-blur-md">
                                        <UserPlus className="h-12 w-12 text-blue-400 opacity-80" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="text-center max-w-sm">
                                    <h3 className="text-xl font-semibold text-gray-100 flex items-center justify-center space-x-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                        <span>Waiting for participants...</span>
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                                        Share the Room ID or WhatsApp link to invite up to 3 other people.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Local Video (Floating PIP or grid tile if needed, keeping as PIP for consistency) */}
                    <motion.div
                        drag
                        dragConstraints={{ top: 20, left: 20, right: 300, bottom: 300 }}
                        whileHover={{ scale: 1.02 }}
                        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                        className="absolute top-6 right-6 w-36 h-48 md:w-56 md:h-72 bg-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden cursor-grab z-20 group"
                    >
                        {localStream ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="w-full h-full p-1"
                            >
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover rounded-xl ${isVideoOff ? 'hidden' : ''}`}
                                />
                            </motion.div>
                        ) : null}
                        {(isVideoOff && !isScreenSharing) && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl m-1 border border-white/5">
                                <VideoOff className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{username} (You)</span>
                        </div>
                        {isScreenSharing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 backdrop-blur-sm m-1 rounded-xl border border-blue-500/30">
                                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-2xl flex items-center">
                                    <MonitorUp className="w-3 h-3 mr-2" />
                                    Sharing
                                </span>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Controls Overlay */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="absolute bottom-8 z-30"
                >
                    <div className="bg-white/10 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center space-x-4 md:space-x-6">
                        <motion.button
                            whileHover={{ scale: 1.1, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleAudio}
                            className={`p-4 rounded-2xl transition-colors shadow-lg flex items-center justify-center ${isMuted ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            title={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleVideo}
                            className={`p-4 rounded-2xl transition-colors shadow-lg flex items-center justify-center ${isVideoOff ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                        >
                            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                        </motion.button>

                        <div className="w-px h-10 bg-white/10" />

                        <motion.button
                            whileHover={{ scale: 1.1, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-2xl transition-colors shadow-lg flex items-center justify-center ${isScreenSharing ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
                        >
                            <MonitorUp className="h-6 w-6" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="p-4 px-8 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 flex items-center justify-center transition-colors font-bold uppercase tracking-widest text-xs ml-4"
                            title="End Call"
                        >
                            <PhoneOff className="h-5 w-5 mr-2" />
                            Leave
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Chat Area */}
            <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full md:w-[400px] h-full"
            >
                <Chat messages={messages} onSendMessage={sendMessage} onSendFile={sendFile} />
            </motion.div>
        </div>
    );
}
