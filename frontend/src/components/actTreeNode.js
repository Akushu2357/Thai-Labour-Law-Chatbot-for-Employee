import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './actTreeNode.css';
import httpService from '../services/httpService';

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
        queryFn: () => fetchChildren ? fetchChildren(label.id) : Promise.resolve([]),
        enabled: open && !!fetchChildren,
    });

    const indent = { marginLeft: '16px' };

    function getFetchFunction(type) {
        switch (type) {
            case "groups": return fetchGroups;
            case "super_sections": return fetchSuperSections;
            case "sections": return fetchSections;
            default: return null;
        }
    }
    const fetchGroups = async (book_id) => {
        return httpService.get(`/api/libraries/books/${book_id}/groups/`)
            .then(response => {
                console.log('Fetched book groups:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching book groups:', error);
                return [];
            });
    }
    const fetchSuperSections = async (group_id) => {
        return httpService.get(`/api/libraries/groups/${group_id}/super_sections/`)
            .then(response => {
                console.log('Fetched group super sections:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching group super sections:', error);
                return [];
            });
    }
    const fetchSections = async (super_section_id) => {
        return httpService.get(`/api/libraries/super_sections/${super_section_id}/sections/`)
            .then(response => {
                console.log('Fetched super section sections:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching super section sections:', error);
                return [];
            });
        }
    return (
        <div style={indent}>
            <div
                className="act-tree-node-label"
                onClick={() => setOpen(!open)}
            >
                {open
                    ? <span className="material-symbols-outlined">arrow_circle_down</span>
                    : <span className="material-symbols-outlined">arrow_circle_right</span>}
                {label.title}
            </div>
            {open && (
                <div className="act-tree-node-children">
                    {isLoading && <div>Loading...</div>}
                    {isError && <div>Error loading data.</div>}
                    {children && children.map((child) => {
                        const isLeaf = (!child.key || child.type === 'section');
                        if (isLeaf && renderLeaf) {
                            const Leaf = renderLeaf;
                            return (
                                <div key={child.id}>
                                    <Leaf section={child} />
                                </div>
                            );
                        }
                        return (
                            <ActTreeNode
                                key={child.id}
                                label={child}
                                fetchChildren={getFetchFunction(child.key)}
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