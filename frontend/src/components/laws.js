import { useParams } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useEffect, useState } from 'react';
import Leaf from './leaf';
import './laws.css';

function Laws() {
    const params = useParams();
    const actId = params.actId || params.act;
    const { loading, fetchActById, fetchBooks } = useLibrary();
    const [actData, setActData] = useState(null);
    const [books, setBooks] = useState([]);

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

    if (loading) {
        return (
            <div className='laws-loading'>
                <h1>กำลังโหลดข้อมูลพระราชบัญญัติ...</h1>
            </div>
        );
    }

    return (
        <div className='laws-container'>
            {!actData && !loading && (
                <div className='laws-no-data'>
                    <p>ไม่พบข้อมูลพระราชบัญญัติที่เลือก</p>
                </div>
            )}

            {actData && (
                <section>
                    <div className='laws-header'>
                        <h1 className='laws-title'>{actData.title}</h1>
                        {/* {actData.preface && (
                            <div className='laws-preface'>
                                <h3>คำนำ</h3>
                                <p>{actData.preface}</p>
                            </div>
                        )} */}
                    </div>

                    {books.length > 0 && (
                        <div className='laws-structure'>
                            {books.map(book => (
                                <Leaf
                                    depth={0}
                                    item={book}
                                    type="book"
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
        </div>
    );
}

export default Laws;