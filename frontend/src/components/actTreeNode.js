import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './actTreeNode.css';

function ActTreeNode({
    label,
    fetchChildren,
    childrenKey,
    renderLeaf,
    depth = 0,
}) {
    const [open, setOpen] = useState(false);
    const { data: children, isLoading, isError } = useQuery({
        queryKey: [childrenKey, label.id],
        queryFn: () => fetchChildren ? fetchChildren(label.key)(label.id) : Promise.resolve([]),
        enabled: open && !!fetchChildren,
    });

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
                    {children && children.map((child) => {
                        const isLeaf = (!child.key || child.key === 'section');
                        if (isLeaf && renderLeaf) {
                            const Leaf = renderLeaf;
                            return (
                                <Leaf section={child} />
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