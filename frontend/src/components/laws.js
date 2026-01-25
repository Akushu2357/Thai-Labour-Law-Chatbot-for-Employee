import { useParams } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useEffect, useRef, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/esm/Stack';
import Leaf from './leaf';
import SearchBox from './SearchBox';
import './laws.css';

function Laws() {
    const params = useParams();
    const actId = params.actId || params.act;
    const { loading, fetchActById, fetchBooks } = useLibrary();
    const [actData, setActData] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [filterTags, setFilterTags] = useState([]);
    const [books, setBooks] = useState([]);
    const sectionMatchCacheRef = useRef({});

    // Combine filterText and filterTags into single search term
    const combinedFilterText = [
        filterText,
        ...filterTags.map(t => t.name)
    ].filter(Boolean).join(' ');

    // Clear cache when filter changes
    useEffect(() => {
        sectionMatchCacheRef.current = {};
    }, [combinedFilterText]);

    useEffect(() => {
        let mounted = true;
        if (!actId) return;

        fetchActById(actId)
            .then((act) => { if (mounted) setActData(act) })
            .catch((error) => { console.error('Error fetching act:', error); });
        fetchBooks(actId)
            .then((booksData) => { if (mounted) setBooks(booksData || []) })
            .catch((error) => { console.error('Error fetching books:', error); });

        return () => { mounted = false; };
    }, [actId]);

    const handleAddFilterTag = (tag) => {
        if (typeof tag === 'string') {
            // Add as a tag (badge)
            const textTag = { id: `text-${tag}`, name: tag, isText: true };
            setFilterTags(prev => [...prev, textTag]);
            setFilterText('');
        } else {
            setFilterTags(prev => [...prev, tag]);
            setFilterText('');
        }
    };

    const handleRemoveFilterTag = (tagId) => {
        setFilterTags(prev => prev.filter(t => t.id !== tagId));
    };

    const handleSearchChange = (text) => {
        setFilterText(text);
    };

    return (
        <>
            {!actData && !loading && (
                <div className='laws-no-data'>
                    <p>ไม่พบข้อมูลพระราชบัญญัติที่เลือก</p>
                </div>
            )}

            {actData && (
                <section>
                    <div className='laws-header'>
                        <h1 className='laws-title'>{actData.title}</h1>
                        <Stack direction="horizontal" gap={1} className="tags-stack">
                            {actData.tags.map(tag => (
                                <Badge pill bg="info" key={tag.id} className="tag-badge">
                                    {tag}
                                </Badge>
                            ))}
                        </Stack>
                    </div>

                    <SearchBox
                        onAddTag={handleAddFilterTag}
                        onRemoveTag={handleRemoveFilterTag}
                        selectedTags={filterTags}
                        availableTags={[]}
                        loading={loading}
                        placeholder="ค้นหาในพระราชบัญญัติ..."
                        onSearchChange={handleSearchChange}
                    />

                    {books.length > 0 && (
                        <div className='laws-structure'>
                            {books.map(book => (
                                <Leaf
                                    key={book.id}
                                    depth={0}
                                    item={book}
                                    type="book"
                                    filterText={combinedFilterText}
                                    sectionMatchCache={sectionMatchCacheRef.current}
                                />
                            ))}
                        </div>
                    )}

                    {books.length === 0 && !loading && (
                        <div className='laws-no-books'>
                            <p>ไม่พบข้อมูลโครงสร้างของพระราชบัญญัตินี้</p>
                        </div>
                    )}

                </section>
            )}
        </>
    );
}

export default Laws;