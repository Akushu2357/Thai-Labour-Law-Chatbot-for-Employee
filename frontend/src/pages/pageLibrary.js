import { useEffect, useState } from 'react';
import './pageLibrary.css';
import Acts from '../components/acts';
import httpService from '../services/httpService';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/esm/Stack';

function PageLibrary() {
    const [searchTerm, setSearchTerm] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const addTag = (tag) => {
        if (!selectedTags.find(t => t.id === tag.id)) {
            setSelectedTags(prev => [...prev, tag]);
        }
        setSearchTerm('');
    };

    const removeTag = (id) => {
        setSelectedTags(prev => prev.filter(t => t.id !== id));
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const trimmed = searchTerm.trim();
            if (trimmed === '') return;

            const filterTags = tags.filter(tag =>
                tag.name.toLowerCase().includes(trimmed.toLowerCase())
            );

            if (filterTags.length > 0) {
                addTag(filterTags[0]);
            } else {
                // No matching tag -> treat as free-text search and add as a text-tag badge
                const textTag = { id: `text-${trimmed}`, name: trimmed, isText: true };
                addTag(textTag);
            }
        }
    };

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
        const filterTags = tags.filter(tag =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('Filtered tags based on search term:', filterTags);
    }, [searchTerm, tags]);

    return (
        <main className="library-content">
            <h1>ยินดีต้อนรับสู่ห้องสมุดกฎหมาย</h1>
            <div className='library-search-box'>
                <div className='search-input-container'>
                    <span className="material-symbols-outlined">
                        document_search
                    </span>
                    <input type="search" placeholder="ค้นหากฎหมาย..." value={searchTerm} onChange={handleSearchChange} onKeyDown={handleKeyDown} />
                    <span className="material-symbols-outlined">
                        send
                    </span>
                </div>
                {searchTerm.trim() !== '' && (
                    <ul className='tag-suggestions-list'>
                        {tags.filter(tag =>
                            tag.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedTags.some(st => st.id === tag.id)
                        ).map(tag => (
                            <li key={tag.id} onClick={() => addTag(tag)} style={{ cursor: 'pointer' }}>{tag.name}</li>
                        ))}
                    </ul>
                )}
            </div>
            <Stack direction="horizontal" gap={1} className="selected-tags-stack">
                {selectedTags.map(tag => (
                    <Badge pill bg="info" key={tag.id} className="tag-badge">
                        {tag.name}
                        <button onClick={() => removeTag(tag.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '8px' }}>✕</button>
                    </Badge>
                ))}
            </Stack>

            <Acts tags={tags} />
        </main>
    );
}

export default PageLibrary;