import { useParams } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useEffect, useState } from 'react';

function Laws() {
    const params = useParams();
    const actId = params.actId || params.act;
    const { fetchActById, fetchBooks } = useLibrary();
    const [actData, setActData] = useState(null);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        let mounted = true;
        if (!actId) return;
        fetchActById(actId).then(a => { if (mounted) setActData(a); }).catch(() => {});
        fetchBooks(actId).then(b => { if (mounted) setBooks(b || []); }).catch(() => {});
        return () => { mounted = false; };
    }, [actId]);

    return (
        <div>
            <h1>Laws</h1>
            {!actData && <p>No act selected.</p>}
            {actData && (
                <section>
                    <h2>{actData.title}</h2>
                    <p>{actData.preface}</p>
                    <h3>Books</h3>
                    <ul>
                        {books.map(b => <li key={b.id}>{b.title || b.name || b.id}</li>)}
                    </ul>
                </section>
            )}
        </div>
    );
}

export default Laws;