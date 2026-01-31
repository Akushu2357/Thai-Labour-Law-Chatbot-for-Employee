import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import conversationService from '../services/conversationService';
import './pageLanding.css';
import ChatInput from '../components/ChatInput';

function PageLanding() {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleFirstMessage = async (message) => {
        setIsLoading(true);

        try {
            // 1. สร้างห้องสนทนาใหม่
            const room = await conversationService.createRoom({
                user_id: user?.id || null,
                title: message.length > 50
                    ? message.substring(0, 50) + '...'
                    : message
            });

            console.log('Created room:', room.id);

            // 2. ส่งข้อความแรก
            await conversationService.addMessage(room.id, {
                sender: 'user',
                message: message
            });

            // 3. Navigate ไปหน้าแชทพร้อมส่ง firstMessage ใน state
            navigate(`/chat/${room.id}`, {
                state: { firstMessage: message }
            });

        } catch (error) {
            console.error('Error creating chat:', error);
            alert('เกิดข้อผิดพลาดในการสร้างห้องสนทนา กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-hero">
                <div className="hero-icon">⚖️</div>
                <h1 className="hero-title">แชทบอทกฎหมายแรงงานไทย</h1>
                <p className="hero-subtitle">
                    ถามคำถามเกี่ยวกับสิทธิและหน้าที่ของคุณในฐานะพนักงาน
                </p>

                <div className="hero-features">
                    <div className="feature-item">
                        <span className="material-symbols-outlined">verified</span>
                        <span>อ้างอิงกฎหมายที่ถูกต้อง</span>
                    </div>
                    <div className="feature-item">
                        <span className="material-symbols-outlined">chat</span>
                        <span>ตอบคำถามได้ทันที</span>
                    </div>
                    <div className="feature-item">
                        <span className="material-symbols-outlined">history</span>
                        <span>บันทึกประวัติการสนทนา</span>
                    </div>
                </div>
            </div>

            <ChatInput
                onSendMessage={handleFirstMessage}
                isLoading={isLoading}
            />
        </div>
    );
}

export default PageLanding;
