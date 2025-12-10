import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import './actTreeNode.css';
import { useSectionContext } from '../contexts/SectionContext';

function ActTreeNode({
    label,
    fetchChildren,
    childrenKey,
    renderLeaf,
    depth = 0,
}) {
    const [open, setOpen] = useState(false);
    const { dynamicSections, hasExpandRequest, clearExpandRequest } = useSectionContext();
    
    // เช็ค expand request และ expand อัตโนมัติ
    useEffect(() => {
        if (hasExpandRequest(label.id) && !open) {
            console.log(`Auto-expanding node: ${label.id} (${label.title})`);
            setOpen(true);
            clearExpandRequest(label.id);
        }
    }, [label.id, label.title, open, hasExpandRequest, clearExpandRequest]);
    
    const { data: children, isLoading, isError } = useQuery({
        queryKey: [childrenKey, label.id],
        queryFn: () => fetchChildren ? fetchChildren(label.key)(label.id) : Promise.resolve([]),
        enabled: open && !!fetchChildren,
    });

    // รวม children ที่มีอยู่กับ dynamic sections
    const [allChildren, setAllChildren] = useState([]);
    
    useEffect(() => {
        if (!children) {
            setAllChildren([]);
            return;
        }
        
        // ถ้าเป็น super_section level ให้เช็ค dynamic sections
        if (childrenKey === 'sections') {
            const superSectionId = label.id;
            const actId = label.act_id;
            const dynamics = dynamicSections[actId] || {};
            const dynamicSectionsArray = Object.values(dynamics).filter(
                ds => ds.super_id === superSectionId
            );
            
            // รวม children เดิมกับ dynamic sections (ไม่ซ้ำกัน)
            const existingSectionNumbers = new Set(
                children
                    .filter(c => c.section_number)
                    .map(c => c.section_number)
            );
            
            const newDynamicSections = dynamicSectionsArray.filter(
                ds => !existingSectionNumbers.has(ds.section_number)
            );
            
            setAllChildren([...children, ...newDynamicSections]);
        } else {
            setAllChildren(children);
        }
    }, [children, dynamicSections, label.id, label.act_id, childrenKey]);

    const indent = { marginLeft: '16px' };

    return (
        <div style={indent}>
            <div
                className="act-tree-node-label"
                onClick={() => setOpen(!open)}
            >
                {open
                    ? <span className="material-symbols-outlined">arrow_circle_down</span>
                    : <span className="material-symbols-outlined">arrow_circle_right</span>}
                <p>{label.title}</p>
                {/* {label.tags && label.tags.map(tag => (
                    <span key={tag} className="act-tree-node-tag">{tag}</span>
                ))} */}
                {/* {console.log('Rendering label:', label.tags)} */}
            </div>
            {open && (
                <div className="act-tree-node-children">
                    {isLoading && <div>Loading...</div>}
                    {isError && <div>Error loading data.</div>}
                    {allChildren && allChildren.map((child) => {
                        const isLeaf = (!child.key || child.key === 'section');
                        if (isLeaf && renderLeaf) {
                            const Leaf = renderLeaf;
                            return (
                                <Leaf key={child.id} section={child} />
                            );
                        }
                        return (
                            <ActTreeNode
                                key={child.id}
                                label={child}
                                fetchChildren={fetchChildren}
                                childrenKey={child.key}
                                renderLeaf={renderLeaf}
                                depth={depth + 1}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ActTreeNode;