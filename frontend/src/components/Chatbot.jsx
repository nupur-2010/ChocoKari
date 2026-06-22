// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { X, Send, Cookie, RotateCcw } from "lucide-react";
import { askChatbot, getInitialMessage, getSuggestedPrompts } from "../lib/chatbot";

const renderMessageText = (text) => {
    return text.split("\n").map((line, i) => {
        if (line.startsWith("• ") || line.startsWith("- ")) {
            return (
                <div key={i} className="flex gap-1.5 ml-1">
                    <span className="text-gold shrink-0">•</span>
                    <span>{line.slice(2)}</span>
                </div>
            );
        }
        return line ? <div key={i}>{line}</div> : <div key={i} className="h-1.5" />;
    });
};

export default function Chatbot({ open, onClose }) {
    const [messages, setMessages] = useState([getInitialMessage()]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typing]);

    useEffect(() => {
        if (open) setShowPrompts(messages.length <= 1);
    }, [open, messages.length]);

    const send = async (overrideText) => {
        const q = (overrideText ?? input).trim();
        if (!q) return;
        setMessages((m) => [...m, { role: "user", text: q }]);
        setInput("");
        setTyping(true);
        setShowPrompts(false);
        try {
            const answer = await askChatbot(q);
            setMessages((m) => [...m, { role: "bot", text: answer }]);
        } catch (e) {
            setMessages((m) => [...m, { role: "bot", text: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setTyping(false);
        }
    };

    const reset = () => {
        setMessages([getInitialMessage()]);
        setInput("");
        setShowPrompts(true);
    };

    if (!open) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] flex flex-col card-luxury luxury-shadow-lg overflow-hidden fade-in">
            <div className="chocolate-gradient px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                        <Cookie size={18} className="text-gold-light" />
                    </div>
                    <div>
                        <p className="text-cream font-semibold text-sm">Choco Concierge</p>
                        <p className="text-cream/60 text-xs">Always here to help</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={reset} className="w-8 h-8 rounded-full hover:bg-cream/10 flex items-center justify-center text-cream">
                        <RotateCcw size={15} />
                    </button>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-cream/10 flex items-center justify-center text-cream">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-light/30" style={{ minHeight: 320, maxHeight: 480 }}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                                m.role === "user"
                                    ? "bg-chocolate text-cream rounded-br-sm"
                                    : "bg-white text-chocolate rounded-bl-sm luxury-shadow"
                            }`}
                        >
                            {renderMessageText(m.text)}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className="bg-white text-chocolate px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 luxury-shadow">
                            <span className="w-1.5 h-1.5 bg-chocolate/40 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-chocolate/40 rounded-full animate-bounce" style={{ animationDelay: 0.15 + "s" }} />
                            <span className="w-1.5 h-1.5 bg-chocolate/40 rounded-full animate-bounce" style={{ animationDelay: 0.3 + "s" }} />
                        </div>
                    </div>
                )}
                {showPrompts && !typing && (
                    <div className="pt-1 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-chocolate/50 font-semibold pl-1">Quick suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {getSuggestedPrompts().map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => send(p.text)}
                                    className="px-3 py-1.5 rounded-full bg-cream/80 border border-gold/30 text-chocolate text-xs font-medium hover:bg-gold/15 hover:border-gold transition"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-cream/80 border-t border-chocolate/10 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask about flavours, gifts, orders..."
                    className="input-luxury flex-1 py-2 text-sm"
                />
                <button onClick={() => send()} className="w-10 h-10 rounded-full chocolate-gradient flex items-center justify-center text-cream hover:scale-105 transition shrink-0">
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
