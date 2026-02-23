'use client';

import { useState, useRef, useEffect } from 'react';

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
        <div className="flex flex-col h-full bg-white shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Messages</h2>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Live Chat</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm font-medium">No messages yet</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isSystem = msg.senderId === 'system';
                    const isMe = msg.senderId === 'me';

                    if (isSystem) {
                        return (
                            <div key={i} className="flex justify-center my-4">
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-widest border border-gray-200/50">
                                    {msg.message}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                            <span className="text-[10px] font-bold text-gray-400 mb-1.5 px-1 uppercase tracking-tighter">
                                {isMe ? 'You' : msg.senderName}
                            </span>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none font-medium'
                                    }`}
                            >
                                {msg.isFile ? (
                                    <div className="flex flex-col min-w-[120px]">
                                        <div className="flex items-center space-x-2 text-inherit">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <span className="font-semibold truncate max-w-[150px]">{msg.fileName}</span>
                                        </div>
                                        <a
                                            href={msg.fileData}
                                            download={msg.fileName}
                                            className={`mt-2.5 text-[10px] py-1.5 rounded-lg text-center transition-all font-bold uppercase tracking-wider ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                                }`}
                                        >
                                            Download
                                        </a>
                                    </div>
                                ) : (
                                    <p className="break-words leading-relaxed">{msg.message}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-1 min-w-0 px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl text-sm border-2 border-transparent focus:border-blue-500 transition-all outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-blue-600 disabled:bg-gray-200 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 hover:text-blue-600 cursor-pointer transition-colors group">
                            <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </div>
                            <span className="uppercase tracking-widest">Share File</span>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        <span className="text-[10px] text-gray-300 font-medium italic">P2P encrypted</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
