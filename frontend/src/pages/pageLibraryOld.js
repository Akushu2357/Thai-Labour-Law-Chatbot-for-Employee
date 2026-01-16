import { useState } from 'react';
import './pageLibrary.css';
import Acts from '../components/actsOld';

function PageLibrary() {
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
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
            <Acts />
        </main>
    );
}

export default PageLibrary;