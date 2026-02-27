import { useState, useEffect, useRef, useCallback } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import './leaf.css';

function Leaf({ depth = 0, item, type, filterText = '', sectionMatchCache = {}, allowedSections = null, autoExpandSingle = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [children, setChildren] = useState([]);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [clickLoading, setClickLoading] = useState(null);
    const [isStreamingSections, setIsStreamingSections] = useState(false);
    const nodeRef = useRef(null);
    const streamControllerRef = useRef(null);
    const { fetchGroups, fetchSuperSections, fetchSectionsByActAndNumber, streamSections, openTrail, setOpenTrail, loadingReference } = useLibrary();

    const appendUniqueById = (list, item) => {
        if (!Array.isArray(list)) return [item];
        if (list.some(existing => String(existing.id) === String(item.id))) return list;
        return [...list, item];
    };

    const hasChildren = useCallback(() => {
        switch (type) {
            case 'book': return true;
            case 'group': return true;
            case 'super_section': return true;
            case 'section': return false;
            default: return false;
        }
    }, [type]);

    const matchesFilter = (node, term) => {
        if (!term) return true;
        const needle = term.toLowerCase();
        const haystack = [node.title, node.name, node.section_number, node.content]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(needle);
    };

    // Highlight search terms in text
    const highlightText = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchTerm.toLowerCase()
                ? <mark key={i} style={{ backgroundColor: '#ffeb3b', padding: '2px 0' }}>{part}</mark>
                : part
        );
    };

    const fetchChildren = useCallback(async () => {
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
                    if (streamControllerRef.current) {
                        streamControllerRef.current.abort();
                    }
                    streamControllerRef.current = new AbortController();
                    setIsStreamingSections(true);
                    streamSections(item.id, (evt) => {
                        if (evt.type === 'section') {
                            setChildren(prev => appendUniqueById(prev, { ...evt.data, type: 'section' }));
                        }
                        if (evt.type === 'done') {
                            setIsStreamingSections(false);
                        }
                    }, streamControllerRef.current.signal).catch((error) => {
                        if (error?.name === 'AbortError') return;
                        console.error('Error streaming sections:', error);
                        setIsStreamingSections(false);
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    }, [type, item.id, children.length, fetchGroups, fetchSuperSections, hasChildren, streamSections]);

    const handleToggle = () => {
        if (!isExpanded) {
            fetchChildren();
        }
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (!autoExpandSingle || isExpanded || !hasChildren()) return;
        setIsExpanded(true);
        fetchChildren();
    }, [autoExpandSingle, fetchChildren, hasChildren, isExpanded]);

    const getDisplayTitle = () => {
        let text = '';
        if (item.title) text = item.title.replaceAll('\\n', ' ');
        else if (item.name) text = item.name.replaceAll('\\n', ' ');
        else if (item.section_number && item.content) text = item.content.replaceAll('\\n', ' ');
        else text = item.section_number?.replaceAll('\\n', ' ') || `รายการที่ ${item.id}`;

        // Count matches in children for super_section
        let matchCount = 0;
        if (filterText && type === 'super_section' && children.length > 0) {
            matchCount = children.filter(child => matchesFilter(child, filterText)).length;
        }

        if (filterText && currentMatches) {
            return (
                <>
                    <span style={{ color: '#ff9800', marginRight: '8px' }}>🔍</span>
                    {highlightText(text, filterText)}
                    {matchCount > 0 && (
                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>({matchCount})</span>
                    )}
                </>
            );
        }

        // Show count even if not matched but has matched children
        if (filterText && type === 'super_section' && matchCount > 0) {
            return (
                <>
                    {text}
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>({matchCount})</span>
                </>
            );
        } else if (filterText && type === 'super_section' && children.length > 0) {
            return (
                <>
                    {text}
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>(0)</span>
                </>
                );
        } else if (filterText && type === 'super_section') {
            return (
                <>
                    {text}
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>(ยังไม่ได้โหลดข้อมูล)</span>
                </>
            );
        }

        return text;
    };

    const getDisplaySection = () => {
        const elements = [];

        // Add match indicator if current section matches
        if (filterText && currentMatches) {
            elements.push(
                <span key="match-indicator" style={{ color: '#ff9800', marginRight: '8px' }}>🔍</span>
            );
        }

        let start = 0;
        for (const ref in item.cross_references) {
            const textPart = item.title.slice(start, parseInt(ref));
            // Highlight matching text
            if (filterText && currentMatches) {
                elements.push(<span key={`text-${start}`}>{highlightText(textPart, filterText)}</span>);
            } else {
                elements.push(textPart);
            }

            elements.push(
                <button key={ref} className='button-link-reference' onClick={() => { handleReferenceClick(item.cross_references[ref]); setClickLoading(ref); }}>
                    {item.cross_references[ref].original_text}
                </button>
            );
            elements.push(clickLoading === ref && loadingReference && (
                <span key={`loading-${ref}`} className="loading-icon" aria-label="loading">
                    <span className="material-symbols-outlined">progress_activity</span>
                </span>
            ));
            start = parseInt(ref) + item.cross_references[ref].original_text.length;
        }

        const lastPart = item.title.slice(start);
        if (filterText && currentMatches) {
            elements.push(<span key={`text-${start}`}>{highlightText(lastPart, filterText)}</span>);
        } else {
            elements.push(lastPart);
        }

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
    }, [openTrail, fetchChildren, isExpanded, item.id, type]);

    useEffect(() => {
        if (clickLoading && !loadingReference) {
            setClickLoading(null);
        }
    }, [clickLoading, loadingReference]);

    useEffect(() => {
        if (!openTrail) return;
        if (type === 'section' && openTrail.sectionId === item.id) {
            nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsHighlighted(true);
            const t = setTimeout(() => {
                setIsHighlighted(false);
                setOpenTrail(null);
            }, 2000);
            return () => {
                clearTimeout(t);
            };
        }
    }, [openTrail, type, item?.id, setOpenTrail]);

    useEffect(() => {
        return () => {
            if (streamControllerRef.current) {
                streamControllerRef.current.abort();
            }
        };
    }, []);

    // Pre-compute which section_numbers should be shown (for super_section with sections)
    let computedAllowedSections = allowedSections;
    if (filterText && type === 'super_section' && children.length > 0) {
        const matchedSectionNumbers = new Set();
        children.forEach(child => {
            if (child.type === 'section' && matchesFilter(child, filterText)) {
                matchedSectionNumbers.add(child.section_number);
            }
        });
        computedAllowedSections = matchedSectionNumbers;
    }

    // Filter only section nodes, always show book/group/super_section
    let isVisible = true;
    let currentMatches = false;

    if (filterText && type === 'section') {
        // Check if this section_number is in allowed set
        if (computedAllowedSections && computedAllowedSections.size > 0) {
            isVisible = computedAllowedSections.has(item.section_number);
            currentMatches = matchesFilter(item, filterText);
        } else if (allowedSections === null) {
            // Parent didn't compute allowedSections, fall back to direct check
            currentMatches = matchesFilter(item, filterText);
            isVisible = currentMatches;
        } else {
            isVisible = false;
        }
    }

    if (!isVisible) return null;

    return (
        <div className='leaf-container' ref={nodeRef} aria-label={`${item.act_id || 'unknown'}_${item.section_number || 'unknown'}`}>
            <div className={
                `leaf-header ${hasChildren() ? 'leaf-clickable' : ''} ${isExpanded ? 'leaf-expanded' : ''} ${isHighlighted ? 'leaf-highlight' : ''} ${type !== 'section' ? 'leaf-non-section' : 'leaf-section'}`
            }
                onClick={hasChildren() ? handleToggle : undefined}>
                <div className='leaf-content'>
                    {hasChildren() && (
                        <span className="material-symbols-outlined">
                            {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                        </span>

                    )}
                    <>
                        {type !== 'section' &&
                            <p className='leaf-title'>
                                {getDisplayTitle()}
                            </p>
                        }
                        {type === 'section' &&
                            <p className='leaf-section-title'>
                                <span style={{ marginLeft: '2rem' }} />{getDisplaySection()}
                            </p>
                        }
                    </>
                </div>


            </div>

            {isExpanded && (
                <>
                    {children.length > 0 && (
                        <div>
                            {(() => {
                                const visibleChildren = children.filter(child => {
                                    if (!filterText || child.type !== 'section') return true;
                                    if (computedAllowedSections && computedAllowedSections.size > 0) {
                                        return computedAllowedSections.has(child.section_number);
                                    }
                                    return matchesFilter(child, filterText);
                                });

                                if (visibleChildren.length === 0 && filterText) {
                                    return (
                                        <div style={{ padding: '1rem', color: '#999', fontStyle: 'italic' }}>
                                            ไม่พบมาตราที่ตรงกับคำค้นหา "{filterText}"
                                        </div>
                                    );
                                }

                                const shouldAutoExpandChild = visibleChildren.length === 1;

                                return visibleChildren.map((child) => (
                                    <Leaf
                                        key={child.id}
                                        depth={depth + 1}
                                        item={child}
                                        type={child.type}
                                        filterText={filterText}
                                        sectionMatchCache={sectionMatchCache}
                                        allowedSections={computedAllowedSections}
                                        autoExpandSingle={shouldAutoExpandChild}
                                    />
                                ));
                            })()}
                        </div>
                    )}
                    {isStreamingSections && (
                        <div className='leaf-loading'>
                            <span className="loading-icon" aria-label="loading">
                                <span className="material-symbols-outlined">progress_activity</span>
                            </span>
                            <span className="text-p-without-color" style={{ marginLeft: '0.5rem', textAlign: 'left' }}>กำลังโหลด...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Leaf;