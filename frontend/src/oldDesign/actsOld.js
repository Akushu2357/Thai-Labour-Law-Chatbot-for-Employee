import { useState, useEffect } from 'react';
import httpService from '../services/httpService';
import './actsOld.css';
import ActTreeNode from "./actTreeNodeOld";
import SectionLeaf from "../components/sectionLeafOld";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SectionProvider } from '../contexts/SectionContext';

const queryClient = new QueryClient();

function Acts() {
    function getFetchFunction(type) {
        switch (type) {
            case "books": return fetchBooks;
            case "groups": return fetchGroups;
            case "super_sections": return fetchSuperSections;
            case "sections": return fetchSections;
            default: return null;
        }
    }
    const fetchBooks = async (act_id) => {
        return httpService.get(`/api/libraries/acts/${act_id}/books`)
            .then(response => {
                console.log('Fetched act books:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching act books:', error);
                return [];
            });
    }
    const fetchGroups = async (book_id) => {
        return httpService.get(`/api/libraries/books/${book_id}/groups`)
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
        return httpService.get(`/api/libraries/groups/${group_id}/super_sections`)
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
        return httpService.get(`/api/libraries/super_sections/${super_section_id}/sections`)
            .then(response => {
                console.log('Fetched super section sections:', response.data);
                response.data.forEach(section => {
                    section.tags = section.tags.map(tagObj => tags[tagObj - 1].name);
                });
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching super section sections:', error);
                return [];
            });
    }

    const [acts, setActs] = useState([]);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        // Fetch tags from backend API
        httpService.get('/api/libraries/tags')
            .then(response => {
                setTags(response.data);
                console.log('Fetched tags:', response.data);
            })
            .catch(error => {
                console.error('Error fetching tags:', error);
            });
    }, []);

    useEffect(() => {
        if (tags.length === 0) return;
        // Fetch act list from backend API
        httpService.get('/api/libraries/acts')
            .then(response => {
                response.data.forEach(section => {
                    section.tags = section.tags.map(tagObj =>
                        tags[tagObj - 1].name
                    );
                });
                setActs(response.data);
                console.log('Fetched act list:', response.data);
            })
            .catch(error => {
                console.error('Error fetching act list:', error);
            });
    }, [tags]);

    return (
        <>
            <main className="act-content">
                <SectionProvider>
                    <QueryClientProvider client={queryClient}>
                        {acts.map((act) => (
                            <ActTreeNode
                                key={act.id}
                                label={act}
                                fetchChildren={getFetchFunction}
                                childrenKey="books"
                                renderLeaf={SectionLeaf}
                            />
                        ))}
                    </QueryClientProvider>
                </SectionProvider>
            </main>
        </>
    );
}

export default Acts;