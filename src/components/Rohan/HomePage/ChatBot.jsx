import React, { useState } from 'react';
import { MessageCircle, Send, X, Maximize2, Minimize2 } from 'lucide-react';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your farming assistant. How can I help you today?",
            sender: 'bot'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        setMessages(prev => [...prev, {
            text: inputMessage,
            sender: 'user'
        }]);

        // Clear input
        setInputMessage('');

        // Simulate bot response (replace with actual bot logic later)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "I'm processing your request. This feature will be implemented soon!",
                sender: 'bot'
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {!isOpen ? (
                // Floating button when chat is closed
                <button
                    onClick={toggleChat}
                    className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            ) : (
                // Chat interface when open
                <div className="bg-white rounded-lg shadow-xl w-80 max-h-[500px] flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-green-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-medium">Farming Assistant</span>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white hover:text-green-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="border-t p-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-green-600"
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}