import { useEffect, useState } from 'react';
import './pageLibrary.css';
import PreActCard from '../components/preActCard';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/esm/Stack';
import { useLibrary } from '../contexts/LibraryContext';

function PageLibrary() {
    const { fetchTags, tags, selectedTags, addTag, removeTag, searchTerm, setSearchTerm } = useLibrary();
    const [loading, setLoading] = useState(true);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const trimmed = (searchTerm || '').trim();
            if (trimmed === '') return;

            const filterTags = (tags || []).filter(tag =>
                tag.name.toLowerCase().includes(trimmed.toLowerCase())
            );

            if (filterTags.length > 0) {
                addTag(filterTags[0]);
            } else {
                const textTag = { id: `text-${trimmed}`, name: trimmed, isText: true };
                addTag(textTag);
            }
            setSearchTerm('');
        }
    };

    useEffect(() => {
        let alive = true;
        setLoading(true);
        // fetch only tags here (acts will load when Acts mounts)
        fetchTags().finally(() => { if (alive) setLoading(false); });
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
                        {
                            (tags || []).filter(tag =>
                                tag.name.toLowerCase().includes((searchTerm || '').toLowerCase()) && !selectedTags.some(st => st.id === tag.id)
                            ).map(tag => (
                                <li key={tag.id} onClick={() => addTag(tag)} style={{ cursor: 'pointer' }}>{tag.name}</li>
                            ))}
                        <li key={"other"} onClick={() => addTag(searchTerm)} style={{ cursor: 'pointer' }}>
                            <span style={{ fontSize: '10px', color: '#A9A9A9' }}>Keyword: </span>
                            {searchTerm}
                        </li>
                    </ul>
                )}
            </div>
            <Stack direction="horizontal" gap={1} className="selected-tags-stack">
                {selectedTags.map(tag => (
                    <Badge pill bg="info" key={tag.id} className="tag-badge">
                        {tag.name}
                        <button onClick={() => removeTag(tag.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                    </Badge>
                ))}
            </Stack>
            <PreActCard />
        </main>
    );
}

export default PageLibrary;