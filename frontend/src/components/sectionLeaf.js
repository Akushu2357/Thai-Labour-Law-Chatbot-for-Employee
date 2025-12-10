import './sectionLeaf.css';
import { useState } from 'react';
import httpService from '../services/httpService';
import { useSectionContext } from '../contexts/SectionContext';

function SectionLeaf({ section }) {
    const title = section?.title || '';
    const refs = section?.cross_references || {};
    const sectionId = section?.id;
    const actId = section?.act_id;
    
    const { addDynamicSection, hasDynamicSection, requestNodeExpand } = useSectionContext();
    
    const [hoveredLink, setHoveredLink] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [loadedSections, setLoadedSections] = useState({}); // เก็บ section ที่ fetch มา {sectionNumber: sectionData}    // ฟังก์ชันสำหรับดึงข้อความจาก segment details
    const getTextFromSegDetails = (seg) => {
        const parts = [];
        
        // ใช้ section number จาก seg หรือ section ปัจจุบัน
        const targetSectionNumber = seg.sectionNumber || section?.section_number;
        const targetSubSection = seg.subSection || (seg.sectionNumber ? '' : section?.sub_section);
        const targetParagraph = seg.paragraphNumber;
        const targetItem = seg.itemOrder;
        
        if (targetSectionNumber) parts.push(`มาตรา ${targetSectionNumber}`);
        if (targetSubSection) parts.push(`ส่วน ${targetSubSection}`);
        if (targetParagraph) parts.push(`วรรค ${targetParagraph}`);
        if (targetItem) parts.push(`ข้อ ${targetItem}`);
        
        return parts.length > 0 ? ` (${parts.join(', ')})` : '';
    };

    // ฟังก์ชันสำหรับสร้าง complete reference จาก segment
    const getCompleteReference = (seg) => {
        return {
            sectionNumber: seg.sectionNumber || section?.section_number,
            subSection: seg.subSection || (seg.sectionNumber ? '' : section?.sub_section),
            paragraphNumber: seg.paragraphNumber,
            itemOrder: seg.itemOrder
        };
    };

    const findSectionElement = (sectionNumber) => {
        // ลองหาใน DOM ด้วย data attribute ก่อน
        const element = document.querySelector(`[data-section-number="${sectionNumber}"]`);
        if (element) {
            console.log(`Found element for section ${sectionNumber}:`, element);
            return element;
        }
        console.log(`Element not found for section ${sectionNumber}`);
        return null;
    };

    const fetchSectionBySectionNumber = async (sectionNumber) => {
        try {
            console.log(`Fetching section: ${sectionNumber}, actId: ${actId}`);

            // ถ้า actId มี ให้ใช้
            if (actId) {
                const response = await httpService.get(`/api/libraries/sections/${actId}/${sectionNumber}`);
                console.log(`Fetched section data:`, response.data);
                
                // เก็บใน local state
                setLoadedSections(prev => ({
                    ...prev,
                    [sectionNumber]: response.data
                }));
                
                // เพิ่มเข้า Context เพื่อให้ component อื่นเข้าถึงได้
                addDynamicSection(actId, response.data);
                
                return response.data;
            }
        } catch (error) {
            console.error(`Error fetching section ${sectionNumber}:`, error);
        }
        return null;
    };

    const handleLinkClick = async (e, seg) => {
        e.preventDefault();
        
        const completeRef = getCompleteReference(seg);
        console.log('Segment data:', seg);
        console.log('Complete reference:', completeRef);
        console.log('Current section data:', section);
        
        if (!completeRef.sectionNumber) {
            console.log('No section number available');
            return;
        }

        console.log(`Clicked link for section: ${completeRef.sectionNumber}`);

        // ลองหาใน DOM ก่อน
        let targetElement = findSectionElement(completeRef.sectionNumber);

        // ถ้าไม่พบ ให้ fetch API
        if (!targetElement) {
            console.log(`Section element not found, attempting to fetch...`);
            
            // เช็คว่า section นี้ถูกโหลดไปแล้วหรือยัง
            if (hasDynamicSection(actId, completeRef.sectionNumber)) {
                console.log(`Section ${completeRef.sectionNumber} already loaded but not visible. Please expand the tree to view it.`);
                alert(`มาตรา ${completeRef.sectionNumber} ถูกโหลดแล้ว กรุณา expand พระราชบัญญัตินี้เพื่อดูมาตราดังกล่าว`);
                return;
            }
            
            const fetched = await fetchSectionBySectionNumber(completeRef.sectionNumber);

            if (fetched) {
                console.log(`Fetched successfully, section added to context`);
                console.log(`Fetched section data:`, fetched);
                console.log(`Section has super_id: ${fetched[0].super_id}`);

                // ขอให้ expand super_section node นี้
                console.log(`Requesting to expand super_section node: ${fetched[0].super_id}`);
                requestNodeExpand(fetched[0].super_id);
                
                // ลองหาอีกครั้งหลังจาก fetch
                setTimeout(() => {
                    const element = findSectionElement(completeRef.sectionNumber);
                    if (element) {
                        console.log(`Found element after fetch, scrolling...`);
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        console.log(`Element still not visible. Node should have expanded automatically.`);
                    }
                }, 500);
            } else {
                console.log(`Failed to fetch section: ${completeRef.sectionNumber}`);
                alert(`ไม่สามารถโหลดมาตรา ${completeRef.sectionNumber} ได้`);
            }
        } else {
            // Scroll ไปยัง element
            console.log(`Found element in DOM, scrolling immediately...`);
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleMouseEnter = (seg) => {
        const completeRef = getCompleteReference(seg);
        
        setHoveredLink(seg);
        setTooltip({
            text: seg.text,
            section: completeRef.sectionNumber,
            subSection: completeRef.subSection,
            paragraph: completeRef.paragraphNumber,
            item: completeRef.itemOrder
        });
    };

    const handleMouseLeave = () => {
        setHoveredLink(null);
        setTooltip(null);
    };

    const renderWithCrossRefs = () => {
        const keys = Object.keys(refs)
            .map((k) => parseInt(k, 10))
            .filter((n) => !Number.isNaN(n))
            .sort((a, b) => a - b);

        if (keys.length === 0) return <p data-section-number={section?.section_number}>{title}</p>;

        const segments = [];
        let cursor = 0;

        for (const start of keys) {
            const ref = refs[String(start)];
            // determine referenced text and length
            const refText = ref.original_text;
            const length = refText.length;
            const sectionNumber = ref.section_number || '';
            const subSection = ref.sub_section || '';
            const paragraphNumber = ref.paragraph_number || '';
            const itemOrder = ref.item_order || '';

            if (start > cursor) {
                segments.push({ type: 'text', text: title.substring(cursor, start) });
            }

            segments.push({
                type: 'link', text: refText,
                sectionNumber: sectionNumber,
                subSection: subSection,
                paragraphNumber: paragraphNumber,
                itemOrder: itemOrder,
            });
            cursor = start + length;
        }

        if (cursor < title.length) {
            segments.push({ type: 'text', text: title.substring(cursor) });
        }

        return segments.map((seg, i) => {
            if (seg.type === 'text') return <p data-section-number={section?.section_number} key={i}>{seg.text}</p>;

            const isHovered = hoveredLink === seg;

            return (
                <span key={i} className="link-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        type="button"
                        className="section-link"
                        onClick={(e) => handleLinkClick(e, seg)}
                        onMouseEnter={() => handleMouseEnter(seg)}
                        onMouseLeave={handleMouseLeave}
                        style={{ cursor: 'pointer' }}
                        title={`คลิกเพื่อไปยัง: ${seg.text}${getTextFromSegDetails(seg)}`}
                    >
                        {seg.text}
                    </button>
                    {isHovered && tooltip && (
                        <div className="section-tooltip">
                            <div className="tooltip-text">{tooltip.text}</div>
                            {tooltip.section && <div className="tooltip-detail">มาตรา: {tooltip.section}</div>}
                            {tooltip.subSection && <div className="tooltip-detail">ส่วน: {tooltip.subSection}</div>}
                            {tooltip.paragraph && <div className="tooltip-detail">วรรค: {tooltip.paragraph}</div>}
                            {tooltip.item && <div className="tooltip-detail">ข้อ: {tooltip.item}</div>}
                            {loadedSections[tooltip.section] && (
                                <div className="tooltip-detail" style={{ marginTop: '8px', borderLeft: '2px solid #28a745' }}>
                                    ✓ โหลดแล้ว
                                </div>
                            )}
                        </div>
                    )}
                </span>
            );
        });
    };

    return (
        <div
            className="section-leaf"
            data-act-id={actId}
            data-section-id={sectionId}
            data-section-number={section?.section_number}
        >
            <span style={{ paddingLeft: '40px' }} />
            {renderWithCrossRefs()}
        </div>
    );
}

export default SectionLeaf;