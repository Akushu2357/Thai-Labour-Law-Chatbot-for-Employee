import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLibrary } from '../contexts/LibraryContext';
import './MessageList.css';

function MessageList({ messages }) {
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { fetchSectionsByActAndNumber, setOpenTrail } = useLibrary();

    // Auto scroll ไปด้านล่างเมื่อมีข้อความใหม่
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ฟังก์ชันสำหรับจัดการคลิกลิงก์มาตรา
    const handleSectionClick = async (sectionNumber, actId) => {
        try {
            // ดึงข้อมูล section จาก API
            const sections = await fetchSectionsByActAndNumber(actId, sectionNumber);
            let target = Array.isArray(sections) ? sections[0] : sections;

            if (!target || !target.id) {
                console.error('Section not found');
                return;
            }

            // Navigate ไปหน้า library พร้อม state
            navigate(`/library/act/${actId}`, {
                state: {
                    openTrail: {
                        actId: actId,
                        bookId: target.book_id,
                        groupId: target.group_id,
                        superId: target.super_id,
                        sectionId: target.id,
                    }
                }
            });

            // Set openTrail ใน context ด้วย
            setOpenTrail({
                actId: actId,
                bookId: target.book_id,
                groupId: target.group_id,
                superId: target.super_id,
                sectionId: target.id,
            });
        } catch (error) {
            console.error('Error navigating to section:', error);
        }
    };

    // ฟังก์ชันแปลงข้อความให้มีลิงก์มาตรา
    const renderMessageWithSectionLinks = (text, metadata) => {
        if (!metadata || !metadata.sections || metadata.sections.length === 0) {
            return <ReactMarkdown>{text}</ReactMarkdown>;
        }

        // สร้าง Set ของเลขมาตราที่มีอยู่ใน metadata
        const availableSections = new Set(
            metadata.sections.map(s => String(typeof s === 'object' ? s.section_number : s))
        );

        // รองรับทั้ง format เก่า (number) และใหม่ (tuple)
        let actId = null;
        if (metadata.acts && metadata.acts.length > 0) {
            const firstAct = metadata.acts[0];
            actId = Array.isArray(firstAct) ? firstAct[0] : firstAct;
        }

        if (!actId) {
            return <ReactMarkdown>{text}</ReactMarkdown>;
        }

        // แทนที่ "มาตรา X" ด้วย markdown link พร้อม icon
        const textWithLinks = text.replace(/มาตรา\s*(\d+[ก-ฮ]?)/g, (match, sectionNumber) => {
            if (availableSections.has(String(sectionNumber))) {
                return `[📜 ${match}](#section-${sectionNumber})`;
            }
            return match;
        });

        // Custom components สำหรับ ReactMarkdown
        const components = {
            a: ({ node, href, children, ...props }) => {
                const sectionMatch = href?.match(/#section-(\d+[ก-ฮ]?)/);
                if (sectionMatch) {
                    const sectionNumber = sectionMatch[1];
                    return (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSectionClick(sectionNumber, actId);
                            }}
                            className="section-link"
                            title={`ไปที่มาตรา ${sectionNumber}`}
                            {...props}
                        >
                            {children}
                        </a>
                    );
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
            }
        };

        return <ReactMarkdown components={components}>{textWithLinks}</ReactMarkdown>;
    };

    return (
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
                            {renderMessageWithSectionLinks(msg.text, msg.metadata)}

                            {msg.metadata && (
                                <div className="message-metadata">
                                    {msg.metadata.acts && msg.metadata.acts.length > 0 && (
                                        <div className="metadata-section">
                                            <div className="metadata-header">
                                                <span className="material-symbols-outlined">book</span>
                                                <strong>แหล่งอ้างอิง</strong>
                                            </div>
                                            <div className="metadata-content">
                                                {msg.metadata.acts.map((act, idx) => {
                                                    const actName = Array.isArray(act) ? act[1] : `พระราชบัญญัติ ${act}`;
                                                    return (
                                                        <div key={idx} className="act-item">
                                                            <span className="act-name">{actName}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {msg.metadata.sections && msg.metadata.sections.length > 0 && (
                                        <div className="metadata-section">
                                            <div className="metadata-header">
                                                <span className="material-symbols-outlined">gavel</span>
                                                <strong>มาตราที่เกี่ยวข้อง</strong>
                                            </div>
                                            <div className="metadata-content">
                                                <div className="sections-list">
                                                    {msg.metadata.sections.map((section, idx) => {
                                                        const sectionNum = typeof section === 'object' ? section.section_number : section;
                                                        const actId = msg.metadata.acts?.[0];
                                                        const actIdNum = Array.isArray(actId) ? actId[0] : actId;
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className="section-badge"
                                                                onClick={() => handleSectionClick(String(sectionNum), actIdNum)}
                                                                title="คลิกเพื่อดูรายละเอียด"
                                                            >
                                                                มาตรา {sectionNum}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {msg.isLoading && (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
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
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;
