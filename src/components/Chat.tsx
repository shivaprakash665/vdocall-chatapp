'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Download, MessageSquareOff } from 'lucide-react';

interface Message {
    message: string;
    senderId: string;
    senderName: string;
    isFile?: boolean;
    fileName?: string;
    fileData?: string;
}

interface ChatProps {
    messages: Message[];
    onSendMessage: (msg: string) => void;
    onSendFile: (name: string, data: string) => void;
}

export default function Chat({ messages, onSendMessage, onSendFile }: ChatProps) {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            onSendFile(file.name, base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-white shadow-2xl overflow-hidden relative border-l border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Meeting Chat</h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">End-to-end encrypted</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30"
            >
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="h-full flex flex-col items-center justify-center opacity-40 select-none text-gray-500"
                        >
                            <MessageSquareOff className="h-12 w-12 mb-3" strokeWidth={1.5} />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs mt-1">Say hi to start the conversation!</p>
                        </motion.div>
                    )}

                    {messages.map((msg, i) => {
                        const isSystem = msg.senderId === 'system';
                        const isMe = msg.senderId === 'me';

                        if (isSystem) {
                            return (
                                <motion.div
                                    key={`msg-${i}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center my-4"
                                >
                                    <span className="bg-gray-200 text-gray-600 text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm">
                                        {msg.message}
                                    </span>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={`msg-${i}`}
                                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                            >
                                <span className="text-[10px] font-bold text-gray-400 mb-1.5 px-2 uppercase tracking-tighter">
                                    {isMe ? 'You' : msg.senderName}
                                </span>
                                <div
                                    className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm font-medium'
                                        }`}
                                >
                                    {msg.isFile ? (
                                        <div className="flex flex-col min-w-[140px]">
                                            <div className="flex items-center space-x-3 text-inherit mb-3">
                                                <div className={`p-2.5 rounded-xl ${isMe ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                                    <Paperclip className="h-4 w-4 shrink-0" />
                                                </div>
                                                <span className="font-semibold truncate max-w-[160px] text-sm">{msg.fileName}</span>
                                            </div>
                                            <a
                                                href={msg.fileData}
                                                download={msg.fileName}
                                                className={`flex items-center justify-center space-x-1.5 mt-1 text-xs py-2.5 rounded-xl text-center transition-all font-bold uppercase tracking-wider ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30'
                                                    }`}
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Download File</span>
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="break-words leading-relaxed">{msg.message}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-3 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-1 min-w-0 px-5 py-4 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl text-[15px] border-2 border-transparent focus:border-blue-500 transition-all outline-none shadow-inner"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center shrink-0"
                        >
                            <Send className="h-5 w-5 ml-0.5" strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center space-x-2.5 text-xs font-bold text-gray-500 hover:text-blue-600 cursor-pointer transition-colors group">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors shadow-sm">
                                <Paperclip className="h-4 w-4" />
                            </motion.div>
                            <span className="uppercase tracking-widest mt-0.5">Share File</span>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
}
