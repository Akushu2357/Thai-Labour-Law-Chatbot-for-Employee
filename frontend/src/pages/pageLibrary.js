import { useEffect, useState } from 'react';
import './pageLibrary.css';
import PreActCard from '../components/preActCard';
import SearchBox from '../components/SearchBox';
import { useLibrary } from '../contexts/LibraryContext';

function PageLibrary() {
    const { fetchTags, tags, selectedTags, addTag, removeTag, searchTerm, setSearchTerm } = useLibrary();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        let alive = true;
        setLoading(true);
        // fetch only tags here (acts will load when Acts mounts)
        fetchTags().finally(() => { if (alive) setLoading(false); });
    }, [fetchTags]);


    return (
        <main className="library-content">
            <h1>ยินดีต้อนรับสู่ห้องสมุดกฎหมาย</h1>
            <SearchBox
                onAddTag={addTag}
                onRemoveTag={removeTag}
                selectedTags={selectedTags}
                availableTags={tags}
                loading={loading}
                placeholder="ค้นหากฎหมาย..."
                onSearchChange={setSearchTerm}
            />
            <PreActCard searchTerm={searchTerm} selectedTags={selectedTags} />
        </main>
    );
}

export default PageLibrary;