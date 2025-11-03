import { useState } from 'react';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [indexFocus, setIndexFocus] = useState(null);
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleFocusClick = (index) => {
    if (indexFocus === index) {
      setIndexFocus(null);
    } else {
      setIndexFocus(index);
    }
  };
  return (
    <div className="App">
      {!isMenuOpen && (
        <div className='navbar-container'>
          <button className='menu-btn' onClick={handleMenuClick}>
            <span className="material-symbols-outlined">
              menu
            </span>
          </button>
        </div>
      )}
      <div className="menu-content">
        <h1>Thai Labour Law Chatbot for Employee</h1>
      </div>
      {isMenuOpen && (
        <div className='menu-panel'>
          <div className='menu-header'>
            <button className='close-btn' onClick={handleMenuClick}>
              <span className="material-symbols-outlined">
                arrow_back
              </span>
            </button>
            <span>icon</span>
          </div>
          <div className='menu-list'>
            <div className="menu-block-item">
              <div className="menu-item">
                <p>เริ่มการสนทนาใหม่</p>
                <span className="material-symbols-outlined">
                  add_circle
                </span>
              </div>
            </div>
            <div className='menu-block-item'>
              <div className="menu-item" onClick={() => handleFocusClick(1)}>
                <p>ห้องสมุดกฎหมาย</p>
                <span className="material-symbols-outlined">
                  {indexFocus === 1 ? 'arrow_circle_down' : 'arrow_circle_right'}
                </span>
              </div>
            </div>
            <div className="menu-block-item" onClick={() => handleFocusClick(2)} aria-disabled="true">
              <div className="menu-item">
                <p>ประวัติการสนทนา</p>
                <span className="material-symbols-outlined">
                  {indexFocus === 2 ? 'arrow_circle_down' : 'arrow_circle_right'}
                </span>
              </div>
              {indexFocus === 2 && (
                <div className='menu-subitem-list'>
                  <div className='menu-subitem'>
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <line x1={0} y1={7} x2={5} y2={7} stroke="#d1d5db" strokeWidth={0.5}></line>
                      <line x1={0} y1={0} x2={0} y2={7} stroke="#d1d5db" strokeWidth={1}></line>
                    </svg>
                    <p>ประวัติการสนทนา ยังไม่พร้อมใช้งาน</p>
                  </div>
                  <div className='menu-subitem'>
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <line x1={0} y1={7} x2={5} y2={7} stroke="#d1d5db" strokeWidth={0.5}></line>
                      <line x1={0} y1={0} x2={0} y2={7} stroke="#d1d5db" strokeWidth={1}></line>
                    </svg>
                    <p>ประวัติการสนทนา ยังไม่พร้อมใช้งาน</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
