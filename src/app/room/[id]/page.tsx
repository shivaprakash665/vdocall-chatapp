'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, use } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import Chat from '@/components/Chat';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const username = searchParams.get('name') || 'Anonymous';
    const roomId = id;

    const {
        localStream,
        remoteStream,
        messages,
        sendMessage,
        sendFile,
        toggleScreenShare,
        isScreenSharing
    } = useWebRTC(roomId, username);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

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

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden font-sans">
            {/* Main Video Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4">

                {/* Room ID & Info Header */}
                <div className="absolute top-6 left-6 z-10 flex items-center space-x-3">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20 flex items-center space-x-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Room ID:</span>
                        <span className="text-sm font-mono font-bold text-gray-800">{roomId}</span>
                        <button
                            onClick={copyRoomId}
                            className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                        >
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Remote Video (Primary) */}
                <div className="relative w-full h-full max-w-5xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center border-4 border-white/10">
                    {remoteStream ? (
                        <>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-white text-xs font-medium">Partner</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center space-y-6">
                            <div className="relative">
                                <div className="animate-ping absolute inset-0 rounded-full bg-blue-500/20" />
                                <div className="relative w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-white">Waiting for partner...</p>
                                <p className="text-sm text-gray-500 mt-1">They can join using your Room ID</p>
                            </div>
                        </div>
                    )}

                    {/* Local Video (Floating Overlay) */}
                    <div className="absolute top-6 right-6 w-48 h-36 md:w-64 md:h-48 bg-gray-800 rounded-2xl shadow-xl border-2 border-white/20 overflow-hidden transition-all hover:scale-105 group z-20">
                        {localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                            />
                        ) : null}
                        {(isVideoOff && !isScreenSharing) && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-medium">{username} (You)</span>
                        </div>
                        {isScreenSharing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-[2px]">
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg">SHARING SCREEN</span>
                            </div>
                        )}
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-8 flex items-center space-x-6 z-30">
                        <button
                            onClick={toggleAudio}
                            className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/30'}`}
                            title={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                            {isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            )}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/30'}`}
                            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                        >
                            {isVideoOff ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </button>

                        <button
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/30'}`}
                            title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="p-4 rounded-full bg-red-600 text-white shadow-2xl transition-all hover:scale-110 active:scale-95 hover:bg-red-700 border border-white/20"
                            title="End Call"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200">
                <Chat messages={messages} onSendMessage={sendMessage} onSendFile={sendFile} />
            </div>
        </div>
    );
}
