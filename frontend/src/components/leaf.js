import { useState, useEffect } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import './leaf.css';

function Leaf({ depth = 0, item, type }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [children, setChildren] = useState([]);
    const { loading, fetchGroups, fetchSuperSections, fetchSections } = useLibrary();

    const hasChildren = () => {
        switch(type) {
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
            switch(type) {
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
        if (item.title) return item.title;
        if (item.name) return item.name;
        if (item.section_number && item.content) {
            return item.content
        }
        return item.section_number || `รายการที่ ${item.id}`;
    };

    const getTypeDisplayName = () => {
        switch(type) {
            case 'book': return 'บรรพ';
            case 'group': return 'ลักษณะ';
            case 'super_section': return 'หมวด';
            case 'section': return 'มาตรา';
            default: return '';
        }
    };

    return (
        <div className='leaf-container' style={{ marginLeft: `${depth * 20}px`, marginBottom: '10px' }}>
            <div className={`leaf-header ${hasChildren() ? 'leaf-clickable' : ''} ${isExpanded ? 'leaf-expanded' : ''}`} onClick={hasChildren() ? handleToggle : undefined}>
                <div className='leaf-content'>
                    {hasChildren() && (
                        <span style={{ marginRight: '8px', fontSize: '12px' }}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    )}
                    <div>
                        <span className='leaf-title'>
                            {getDisplayTitle()}
                        </span>
                        {loading && <span style={{ marginLeft: '8px', color: '#6c757d' }}>กำลังโหลด...</span>}
                    </div>
                </div>
                
                {type === 'section' && item.content && (
                    <div className='leaf-section-content'>
                        {item.content}
                    </div>
                )}
            </div>
            
            {isExpanded && children.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    {children.map((child) => (
                        <Leaf 
                            key={child.id} 
                            depth={depth + 1} 
                            item={child} 
                            type={child.type}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Leaf;