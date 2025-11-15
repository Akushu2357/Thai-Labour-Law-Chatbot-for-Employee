import { useState, useEffect } from 'react';
import httpService from '../services/httpService';
import './acts.css';
import ActTreeNode from "./actTreeNode";
import SectionLeaf from "./sectionLeaf";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function Acts() {
    const fetchBooks = async (act_id) => {
        return httpService.get(`/api/libraries/acts/${act_id}/books/`)
            .then(response => {
                console.log('Fetched act books:', response.data);
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching act books:', error);
                return [];
            });
    }

    const [acts, setActs] = useState([]);

    useEffect(() => {
        // Fetch act list from backend API
        httpService.get('/api/acts/')
            .then(response => {
                setActs(response.data);
                console.log('Fetched act list:', response.data);
            })
            .catch(error => {
                console.error('Error fetching act list:', error);
            });
    }, []);

    return (
        <>
            <main className="act-content">
                <QueryClientProvider client={queryClient}>
                    {acts.map((act) => (
                        <ActTreeNode
                            key={act.id}
                            label={act}
                            fetchChildren={fetchBooks}
                            childrenKey="books"
                            renderLeaf={SectionLeaf}
                        />
                    ))}
                </QueryClientProvider>
            </main>
        </>
    );
}

export default Acts;