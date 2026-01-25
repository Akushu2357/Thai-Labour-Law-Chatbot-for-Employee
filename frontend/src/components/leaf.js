import { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import './leaf.css';

function Leaf({ depth = 0, item, type }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [children, setChildren] = useState([]);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [clickLoading, setClickLoading] = useState(null);
    const nodeRef = useRef(null);
    const { fetchGroups, fetchSuperSections, fetchSections, fetchSectionsByActAndNumber, openTrail, setOpenTrail, loadingReference, loading } = useLibrary();

    const hasChildren = () => {
        switch (type) {
            case 'book': return true;
            case 'group': return true;
            case 'super_section': return true;
            case 'section': return false;
            default: return false;
        }
    };

    const fetchChildren = async () => {
        if (!hasChildren() || children.length > 0) return;

        try {
            let childrenData = [];
            switch (type) {
                case 'book':
                    childrenData = await fetchGroups(item.id);
                    setChildren(childrenData.map(child => ({ ...child, type: 'group' })));
                    break;
                case 'group':
                    childrenData = await fetchSuperSections(item.id);
                    setChildren(childrenData.map(child => ({ ...child, type: 'super_section' })));
                    break;
                case 'super_section':
                    childrenData = await fetchSections(item.id);
                    setChildren(childrenData.map(child => ({ ...child, type: 'section' })));
                    break;
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    };

    const handleToggle = () => {
        if (!isExpanded) {
            fetchChildren();
        }
        setIsExpanded(!isExpanded);
    };

    const getDisplayTitle = () => {
        if (item.title) return item.title.replace('\\n', ' ');
        if (item.name) return item.name.replace('\\n', ' ');
        if (item.section_number && item.content) {
            return item.content.replace('\\n', ' ')
        }
        return item.section_number.replace('\\n', ' ') || `รายการที่ ${item.id}`;
    };

    const getDisplaySection = () => {
        const elements = [];
        let start = 0;
        for (const ref in item.cross_references) {
            elements.push(item.title.slice(start, parseInt(ref)));
            elements.push(
                <a key={ref} className='reference' onClick={() => { handleReferenceClick(item.cross_references[ref]); setClickLoading(ref); }}>
                    {item.cross_references[ref].original_text}
                </a>
            );
            elements.push(clickLoading === ref && loadingReference && (
                <span key={`loading-${ref}`} className="loading-icon" aria-label="loading">
                    <span className="material-symbols-outlined">progress_activity</span>
                </span>
            ));
            start = parseInt(ref) + item.cross_references[ref].original_text.length;
        }
        elements.push(item.title.slice(start));
        return elements;
    };

    const handleReferenceClick = async (item_ref) => {
        try {
            const act_id = item.act_id;
            const section_number = item_ref.section_number || item.section_number;
            const sections = await fetchSectionsByActAndNumber(act_id, section_number);
            let target = Array.isArray(sections) ? sections[0] : sections;
            // If paragraph_number is specified in the reference, try to locate that exact paragraph
            const paragraphNumber = item_ref.paragraph_number;
            if (Array.isArray(sections) && paragraphNumber != null) {
                const found = sections.find(s => Number(s.paragraph_number || 1) === Number(paragraphNumber));
                if (found) target = found;
            }
            if (!target || !target.id) return;
            setOpenTrail({
                actId: act_id,
                bookId: target.book_id,
                groupId: target.group_id,
                superId: target.super_id,
                sectionId: target.id,
            });
            // No route navigation; rely on openTrail and refs to expand and scroll
        } catch (error) {
            console.error('Error navigating to reference:', error);
        }
    };

    useEffect(() => {
        if (!openTrail) return;
        const shouldExpand = (
            (type === 'book' && openTrail.bookId === item.id) ||
            (type === 'group' && openTrail.groupId === item.id) ||
            (type === 'super_section' && openTrail.superId === item.id)
        );
        if (shouldExpand && !isExpanded) {
            setIsExpanded(true);
            fetchChildren();
        }
    }, [openTrail]);

    useEffect(() => {
        if (clickLoading && !loadingReference && !loading) {
            setClickLoading(null);
        }
    }, [clickLoading, loadingReference, loading]);

    useEffect(() => {
        if (!openTrail) return;
        if (type === 'section' && openTrail.sectionId === item.id) {
            nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsHighlighted(true);
            const t = setTimeout(() => setIsHighlighted(false), 2000);
            return () => clearTimeout(t);
        }
    }, [openTrail, type, item?.id]);

    return (
        <div className='leaf-container' ref={nodeRef}>
            <div className={`leaf-header ${hasChildren() ? 'leaf-clickable' : ''} ${isExpanded ? 'leaf-expanded' : ''} ${isHighlighted ? 'leaf-highlight' : ''}`} onClick={hasChildren() ? handleToggle : undefined}>
                <div className='leaf-content'>
                    {hasChildren() && (
                        <span style={{ marginRight: '8px', fontSize: '12px' }}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    )}
                    <div>
                        {type !== 'section' &&
                            <p className='leaf-title'>
                                {getDisplayTitle()}
                            </p>
                        }
                        {type === 'section' &&
                            <p className='leaf-section-content'>
                                <span style={{ marginLeft: '2rem' }} />{getDisplaySection()}
                            </p>
                        }
                    </div>
                </div>


            </div>

            {isExpanded &&
                (children.length > 0
                    ? (<div>
                        {children.map((child) => (
                            <Leaf
                                key={child.id}
                                depth={depth + 1}
                                item={child}
                                type={child.type}
                            />
                        ))}
                    </div>)
                    : loading && (
                        <div className='leaf-loading'>
                            <span className="loading-icon" aria-label="loading">
                                <span className="material-symbols-outlined">progress_activity</span>
                            </span>
                            <span style={{ marginLeft: '6px' }}>กำลังโหลด...</span>
                        </div>
                    )
                )
            }
        </div>
    );
}

export default Leaf;