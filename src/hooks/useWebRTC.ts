import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

interface Message {
    message: string;
    senderId: string;
    senderName: string;
    roomId?: string;
    isFile?: boolean;
    fileName?: string;
    fileData?: string;
}

export const useWebRTC = (roomId: string, username: string) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const signalingUrl = typeof window !== 'undefined'
            ? `http://${window.location.hostname}:5000`
            : 'http://localhost:5000';

        console.log('Connecting to signaling server at:', signalingUrl);
        socketRef.current = io(signalingUrl);

        const createPeer = (stream: MediaStream) => {
            const peer = new RTCPeerConnection(ICE_SERVERS);

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    socketRef.current?.emit('ice-candidate', { candidate: e.candidate, roomId });
                }
            };

            peer.ontrack = (e) => {
                console.log('Received remote track');
                setRemoteStream(e.streams[0]);
            };

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            return peer;
        };

        const initiateCall = async (stream: MediaStream) => {
            peerRef.current = createPeer(stream);
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            socketRef.current?.emit('offer', { offer, roomId });
        };

        const handleOffer = async (offer: RTCSessionDescriptionInit, stream: MediaStream) => {
            peerRef.current = createPeer(stream);
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            socketRef.current?.emit('answer', { answer, roomId });
        };

        const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
            if (peerRef.current) {
                await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleNewICECandidate = (candidate: RTCIceCandidateInit) => {
            if (peerRef.current) {
                peerRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
            }
        };

        const init = async () => {
            try {
                console.log('Requesting media devices...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);

                const setupSocketListeners = () => {
                    socketRef.current?.emit('join-room', roomId);
                    console.log('Joined room:', roomId);

                    socketRef.current?.on('user-connected', (userId: string) => {
                        console.log('User connected:', userId);
                        setMessages(prev => [...prev, { message: 'A user joined the room', senderName: 'System', senderId: 'system' }]);
                        initiateCall(stream);
                    });

                    socketRef.current?.on('offer', async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
                        console.log('Received offer');
                        await handleOffer(offer, stream);
                    });

                    socketRef.current?.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
                        console.log('Received answer');
                        await handleAnswer(answer);
                    });

                    socketRef.current?.on('ice-candidate', ({ candidate }: { candidate: RTCIceCandidateInit }) => {
                        handleNewICECandidate(candidate);
                    });

                    socketRef.current?.on('chat-message', (data: Message) => {
                        setMessages((prev) => [...prev, data]);
                    });

                    socketRef.current?.on('user-disconnected', (userId: string) => {
                        console.log('User disconnected:', userId);
                        setMessages(prev => [...prev, { message: 'A user left the room', senderName: 'System', senderId: 'system' }]);
                        setRemoteStream(null);
                        if (peerRef.current) {
                            peerRef.current.close();
                            peerRef.current = null;
                        }
                    });
                };

                if (socketRef.current?.connected) {
                    setupSocketListeners();
                } else {
                    socketRef.current?.on('connect', setupSocketListeners);
                }

                socketRef.current?.on('connect_error', (err) => {
                    console.error('Signaling connection error:', err);
                });

            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };

        init();

        return () => {
            socketRef.current?.disconnect();
            if (peerRef.current) peerRef.current.close();
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId]);

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                if (peerRef.current) {
                    const senders = peerRef.current.getSenders();
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                }

                screenTrack.onended = () => {
                    stopScreenShare();
                };

                setLocalStream(screenStream);
                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error starting screen share:', err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = async () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }

        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const videoTrack = videoStream.getVideoTracks()[0];

            if (peerRef.current) {
                const senders = peerRef.current.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                }
            }

            setLocalStream(videoStream);
            setIsScreenSharing(false);
        } catch (err) {
            console.error('Error stopping screen share and returning to video:', err);
        }
    };

    const sendMessage = (message: string) => {
        const data: Message = { message, roomId, senderName: username, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined }); // Server will assign senderId or we use custom one
        setMessages((prev) => [...prev, data]);
    };

    const sendFile = (fileName: string, fileData: string) => {
        const data: Message = { message: `File: ${fileName}`, roomId, senderName: username, isFile: true, fileName, fileData, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined });
        setMessages((prev) => [...prev, data]);
    }

    return { localStream, remoteStream, messages, sendMessage, sendFile, toggleScreenShare, isScreenSharing };
};
