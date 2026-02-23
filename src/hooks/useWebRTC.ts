import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:openrelay.metered.ca:80' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        }
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
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [messages, setMessages] = useState<Message[]>([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [raisedHands, setRaisedHands] = useState<string[]>([]);
    const [emojiReactions, setEmojiReactions] = useState<{ id: string, emoji: string, senderId: string, senderName: string }[]>([]);
    const [peerNames, setPeerNames] = useState<Record<string, string>>({});
    const peerNamesRef = useRef<Record<string, string>>({});

    // Instead of a single peer connection, we need a map of peer connections (one for each other user)
    const socketRef = useRef<Socket | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const screenStreamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    useEffect(() => {
        const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL ||
            (typeof window !== 'undefined'
                ? `http://${window.location.hostname}:5000`
                : 'http://localhost:5000');

        socketRef.current = io(signalingUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
        });

        const createPeer = (targetUserId: string, stream: MediaStream | null) => {
            const peer = new RTCPeerConnection(ICE_SERVERS);

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    socketRef.current?.emit('ice-candidate', { candidate: e.candidate, roomId: targetUserId });
                }
            };

            peer.ontrack = (e) => {
                if (e.streams && e.streams.length > 0) {
                    setRemoteStreams(prev => ({
                        ...prev,
                        [targetUserId]: e.streams[0]
                    }));
                } else {
                    setRemoteStreams(prev => {
                        const existingStream = prev[targetUserId];
                        if (existingStream) {
                            existingStream.addTrack(e.track);
                            return { ...prev, [targetUserId]: existingStream };
                        }
                        return { ...prev, [targetUserId]: new MediaStream([e.track]) };
                    });
                }
            };

            if (stream) {
                stream.getTracks().forEach(track => peer.addTrack(track, stream));
            }

            return peer;
        };

        const initiateCall = async (targetUserId: string, stream: MediaStream | null) => {
            const peer = createPeer(targetUserId, stream);
            peersRef.current.set(targetUserId, peer);

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socketRef.current?.emit('offer', { offer, roomId: targetUserId });
        };

        const processQueuedCandidates = (targetUserId: string) => {
            const peer = peersRef.current.get(targetUserId);
            const queue = iceCandidateQueuesRef.current.get(targetUserId) || [];

            if (peer && peer.remoteDescription) {
                queue.forEach(candidate => {
                    peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error('Failed to add queued candidate:', e));
                });
                iceCandidateQueuesRef.current.set(targetUserId, []);
            }
        };

        const handleOffer = async (offer: RTCSessionDescriptionInit, senderId: string, stream: MediaStream | null) => {
            const peer = createPeer(senderId, stream);
            peersRef.current.set(senderId, peer);

            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            processQueuedCandidates(senderId);

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socketRef.current?.emit('answer', { answer, roomId: senderId });
        };

        const handleAnswer = async (answer: RTCSessionDescriptionInit, senderId: string) => {
            const peer = peersRef.current.get(senderId);
            if (peer) {
                await peer.setRemoteDescription(new RTCSessionDescription(answer));
                processQueuedCandidates(senderId);
            }
        };

        const handleNewICECandidate = (candidate: RTCIceCandidateInit, senderId: string) => {
            const peer = peersRef.current.get(senderId);
            if (peer && peer.remoteDescription) {
                peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error('Failed to add candidate:', e));
            } else {
                const queue = iceCandidateQueuesRef.current.get(senderId) || [];
                queue.push(candidate);
                iceCandidateQueuesRef.current.set(senderId, queue);
            }
        };

        const broadcastUserInfo = () => {
            const payload = JSON.stringify({ type: 'user-info', name: username });
            socketRef.current?.emit('chat-message', {
                message: `__SIGNAL__:${payload}`,
                roomId,
                senderName: username,
            });
        };

        const init = async () => {
            let stream: MediaStream | null = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
            } catch (err) {
                console.warn('Error accessing media devices. Continuing without video/audio.', err);
            }

            const setupSocketListeners = () => {
                socketRef.current?.off('user-connected');
                socketRef.current?.off('offer');
                socketRef.current?.off('answer');
                socketRef.current?.off('ice-candidate');
                socketRef.current?.off('chat-message');
                socketRef.current?.off('user-disconnected');

                socketRef.current?.emit('join-room', roomId);

                // Introduce ourselves to anyone already in the room
                broadcastUserInfo();

                // When a new user connects, EXISTING users in the room will initiate a call to them
                socketRef.current?.on('user-connected', (userId: string) => {
                    setMessages(prev => [...prev, { message: 'A user joined the room', senderName: 'System', senderId: 'system' }]);

                    // The new user might not know our name yet, so re-broadcast our info when someone joins
                    broadcastUserInfo();

                    if (peersRef.current.size < 3) { // Support max 4 users (me + 3 others)
                        initiateCall(userId, stream);
                    } else {
                        console.warn('Room is full (max 4 users allowed). Ignoring connection.');
                    }
                });

                socketRef.current?.on('offer', async ({ offer, senderId }: { offer: RTCSessionDescriptionInit, senderId: string }) => {
                    await handleOffer(offer, senderId, stream);
                });

                socketRef.current?.on('answer', async ({ answer, senderId }: { answer: RTCSessionDescriptionInit, senderId: string }) => {
                    await handleAnswer(answer, senderId);
                });

                socketRef.current?.on('ice-candidate', ({ candidate, senderId }: { candidate: RTCIceCandidateInit, senderId: string }) => {
                    handleNewICECandidate(candidate, senderId);
                });

                socketRef.current?.on('chat-message', (data: Message) => {
                    if (data.message.startsWith('__SIGNAL__:')) {
                        try {
                            const payload = JSON.parse(data.message.replace('__SIGNAL__:', ''));
                            if (payload.type === 'hand-raise') {
                                setRaisedHands(prev => {
                                    if (payload.raised) {
                                        return prev.includes(data.senderId) ? prev : [...prev, data.senderId];
                                    } else {
                                        return prev.filter(id => id !== data.senderId);
                                    }
                                });
                            } else if (payload.type === 'emoji') {
                                const newEmoji = { id: crypto.randomUUID(), emoji: payload.emoji, senderId: data.senderId, senderName: data.senderName };
                                setEmojiReactions(prev => [...prev, newEmoji]);
                                // Auto remove emoji after 3 seconds
                                setTimeout(() => {
                                    setEmojiReactions(prev => prev.filter(e => e.id !== newEmoji.id));
                                }, 3000);
                            } else if (payload.type === 'user-info') {
                                setPeerNames(prev => {
                                    const next = { ...prev, [data.senderId]: payload.name };
                                    peerNamesRef.current = next;
                                    return next;
                                });
                            }
                        } catch (e) {
                            console.error('Failed to parse signal message', e);
                        }
                    } else {
                        setMessages((prev) => [...prev, data]);
                    }
                });

                socketRef.current?.on('user-disconnected', (userId: string) => {
                    const disconnectedName = peerNamesRef.current[userId] || 'A user';
                    setMessages(prev => [...prev, { message: `${disconnectedName} left the room`, senderName: 'System', senderId: 'system' }]);

                    // Cleanup remote streams
                    setRemoteStreams(prev => {
                        const newStreams = { ...prev };
                        delete newStreams[userId];
                        return newStreams;
                    });

                    // Cleanup raised hands
                    setRaisedHands(prev => prev.filter(id => id !== userId));

                    // Cleanup peer name
                    setPeerNames(prev => {
                        const newNames = { ...prev };
                        delete newNames[userId];
                        peerNamesRef.current = newNames;
                        return newNames;
                    });

                    // Cleanup peer connection
                    const peer = peersRef.current.get(userId);
                    if (peer) {
                        peer.close();
                        peersRef.current.delete(userId);
                    }
                    iceCandidateQueuesRef.current.delete(userId);
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
        };

        if (roomId) {
            init();
        }

        return () => {
            socketRef.current?.disconnect();
            peersRef.current.forEach(peer => peer.close());
            peersRef.current.clear();
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId, username]);

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace track for ALL connected peers
                peersRef.current.forEach(peer => {
                    const senders = peer.getSenders();
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                });

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

            // Revert track for ALL connected peers
            peersRef.current.forEach(peer => {
                const senders = peer.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                }
            });

            setLocalStream(videoStream);
            setIsScreenSharing(false);
        } catch (err) {
            console.error('Error stopping screen share and returning to video:', err);
        }
    };

    const sendMessage = (message: string) => {
        const data: Message = { message, roomId, senderName: username, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined });
        setMessages((prev) => [...prev, data]);
    };

    const toggleHandRaise = (isRaised: boolean) => {
        const payload = JSON.stringify({ type: 'hand-raise', raised: isRaised });
        const data: Message = { message: `__SIGNAL__:${payload}`, roomId, senderName: username, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined });
        setRaisedHands(prev => {
            if (isRaised) return prev.includes('me') ? prev : [...prev, 'me'];
            return prev.filter(id => id !== 'me');
        });
    };

    const sendEmoji = (emoji: string) => {
        const payload = JSON.stringify({ type: 'emoji', emoji });
        const data: Message = { message: `__SIGNAL__:${payload}`, roomId, senderName: username, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined });
        const newEmoji = { id: crypto.randomUUID(), emoji, senderId: 'me', senderName: username };
        setEmojiReactions(prev => [...prev, newEmoji]);
        setTimeout(() => {
            setEmojiReactions(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 3000);
    };

    const sendFile = (fileName: string, fileData: string) => {
        const data: Message = { message: `File: ${fileName}`, roomId, senderName: username, isFile: true, fileName, fileData, senderId: 'me' };
        socketRef.current?.emit('chat-message', { ...data, senderId: undefined });
        setMessages((prev) => [...prev, data]);
    }

    return {
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
    };
};
