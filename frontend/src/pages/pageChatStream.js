import { useState, useEffect, useRef } from 'react';
import httpService from '../services/httpService';
import './pageChat.css';

function PageChatStream() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto scroll ไปด้านล่างเมื่อมีข้อความใหม่
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputValue.trim()) {
            return;
        }

        // เพิ่ม user message ลงใน chat
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentQuestion = inputValue;
        setInputValue('');
        setIsLoading(true);

        // สร้าง assistant message ว่างๆ ไว้ก่อน
        const assistantMessageId = Date.now() + 1;
        const assistantMessage = {
            id: assistantMessageId,
            type: 'assistant',
            text: '',
            timestamp: new Date(),
            metadata: null
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            // เรียก streaming API
            const response = await fetch('http://localhost:8000/llm/chat_stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: currentQuestion,
                    history: messages.map(msg => ({ content: msg.text, role: msg.type }))
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                // แปลง chunk เป็นข้อความ
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                console.log('Received chunk:', chunk);
                console.log('Parsed lines:', lines);

                for (const line of lines) {
                    if (line !== '') {

                        try {
                            const parsed = JSON.parse(line);
                            // เพิ่ม token ที่ได้รับเข้าไปใน text
                            accumulatedText += parsed.data;

                            // Update message แบบ real-time
                            setMessages(prev => prev.map(msg =>
                                msg.id === assistantMessageId
                                    ? { ...msg, text: accumulatedText }
                                    : msg
                            ));

                            if (parsed.metadata) {
                                // Update metadata เมื่อได้รับ
                                setMessages(prev => prev.map(msg =>
                                    msg.id === assistantMessageId
                                        ? { ...msg, metadata: parsed.metadata }
                                        : msg
                                ));
                            }
                        } catch (e) {
                            // ไม่ใช่ JSON ให้ข้ามไป
                            console.log('Non-JSON data:', line);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: Date.now() + 2,
                type: 'error',
                text: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <p className="chat-subtitle">ถามคำถามเกี่ยวกับกฎหมายแรงงานไทย</p>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="empty-icon">💬</div>
                        <h3>ยินดีต้อนรับ!</h3>
                        <p>ถามคำถามใดๆ เกี่ยวกับกฎหมายแรงงานไทย</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`chat-message ${msg.type}`}>
                            <div className="message-bubble">
                                <p>{msg.text}</p>
                                {msg.metadata && (
                                    <div className="message-metadata">
                                        {msg.metadata.sections && msg.metadata.sections.length > 0 && (
                                            <div className="metadata-item">
                                                <strong>มาตรา:</strong> {msg.metadata.sections.join(', ')}
                                            </div>
                                        )}
                                        {msg.metadata.acts && msg.metadata.acts.length > 0 && (
                                            <div className="metadata-item">
                                                <strong>พระราชบัญญัติ:</strong> {msg.metadata.acts.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="message-time">
                                {msg.timestamp.toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-bubble">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <div className="input-wrapper">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="พิมพ์คำถามของคุณ..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={isLoading || !inputValue.trim()}
                        title="ส่งข้อความ (Enter)"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
                <div className="input-hint">
                    กดปุ่ม Enter เพื่อส่งข้อความ
                </div>
            </form>
        </div>
    );
}

export default PageChatStream;
