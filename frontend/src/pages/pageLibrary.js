import { useState, useEffect } from 'react';
import httpService from '../services/httpService';
import './pageLibrary.css';

function PageLibrary() {
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const [actList, setActList] = useState([
        // Example act items
        { id: 1, title: "พระราชบัญญัติคุ้มครองแรงงาน พ.ศ. 2541", tag: ["แรงงาน", "คุ้มครอง"] },
        { id: 2, title: "พระราชบัญญัติประกันสังคม พ.ศ. 2533", tag: ["ประกันสังคม"] },
        { id: 3, title: "พระราชบัญญัติแรงงานสัมพันธ์ พ.ศ. 2518", tag: ["แรงงาน", "สัมพันธ์"] },
    ]);

    useEffect(() => {
        // Fetch act list from backend API
        httpService.get('/api/acts/')
            .then(response => {
                setActList(response.data.data);
                console.log('Fetched act list:', response.data);
            })
            .catch(error => {
                console.error('Error fetching act list:', error);
            });
    }, []);

    return (
        <>
            <main className="library-content">
                <h1>ยินดีต้อนรับสู่ห้องสมุดกฎหมาย</h1>
                <div className='library-search-box'>
                    <span className="material-symbols-outlined">
                        document_search
                    </span>
                    <input type="search" placeholder="ค้นหากฎหมาย..." value={searchTerm} onChange={handleSearchChange} />
                    <span className="material-symbols-outlined">
                        send
                    </span>
                </div>
                <div className='act-list'>
                    {typeof(actList) === 'object' && actList.map((act) => (
                        <button key={act.id} className="act-item">
                            <span key={act.id} className='act-item-title'>{act.title}</span>
                            <div className='act-item-tags'>
                                <span>คำสำคัญ: </span>
                                {typeof(act.tag) === 'object' && act.tag.map((tag, index) => (
                                    <span key={index} className="act-item-tag">{tag}</span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </>
    );
}

export default PageLibrary;