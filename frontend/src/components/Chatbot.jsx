import { useState } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ text: "Hello! I am your DriverApp Assistant. How can I help you?", isBot: true }]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMsg = { text: input, isBot: false };
        setMessages([...messages, newMsg]);
        setInput("");

        try {
            const res = await axios.post('http://localhost:5000/api/ai/chat', { message: input });
            setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
        } catch  {
            setMessages(prev => [...prev, { text: "Sorry, I am offline.", isBot: true }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {!isOpen ? (
                <button onClick={() => setIsOpen(true)} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '50%', padding: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <MessageCircle size={24} />
                </button>
            ) : (
                <div style={{ width: '300px', height: '400px', background: 'white', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '10px', background: '#007bff', color: 'white', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>DriverApp AI</span>
                        <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.isBot ? 'flex-start' : 'flex-end', background: m.isBot ? '#f0f0f0' : '#007bff', color: m.isBot ? 'black' : 'white', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', fontSize: '14px' }}>
                                {m.text}
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex' }}>
                        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." style={{ flex: 1, border: 'none', outline: 'none' }} />
                        <Send size={20} onClick={sendMessage} style={{ color: '#007bff', cursor: 'pointer' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;