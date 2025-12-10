import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './navBar.css';

function NavBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [indexFocus, setIndexFocus] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const closeMenu = () => {
    // play close animation then unmount
    setIsClosing(true);
    // duration should match CSS animation length (220ms) + small buffer
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
      setIndexFocus(null);
    }, 260);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    setIsClosing(false);
  };

  const handleMenuClick = () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  };

  // close on Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const handleFocusClick = (index) => {
    if (indexFocus === index) {
      setIndexFocus(null);
    } else {
      setIndexFocus(index);
    }
  };

  const handleClick = (to) => {
    navigate(to);
    closeMenu();
  }

  const handleKeyToggle = (index, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFocusClick(index);
    }
  };

  const subitemLineStyle = (
    <svg width="20" height="40" viewBox="0 0 20 40" fill="none" aria-hidden>
      <line x1={0} y1={40} x2={20} y2={40} stroke="#909090" strokeWidth={4}></line>
      <line x1={0} y1={0} x2={0} y2={40} stroke="#909090" strokeWidth={6}></line>
    </svg>
  );

  const menuComponent = (
    <>
      <div className='menu-header'>
        <button className='close-btn' onClick={handleMenuClick} aria-label="Close menu">
          <span className="material-symbols-outlined" aria-hidden>
            arrow_back
          </span>
        </button>
        <h1 className="brand" aria-hidden onClick={() => handleClick('/')}>รายการ</h1>
      </div>

      <nav className='menu-list' aria-label="Menu list">
        <div className="menu-block-item">
          <button className="menu-item" onClick={() => handleClick('/chat')}>
            <h3>เริ่มการสนทนาใหม่</h3>
            <span className="material-symbols-outlined" aria-hidden>
              add_circle
            </span>
          </button>
        </div>

        <div className='menu-block-item'>
          <button
            className="menu-item"
            onClick={() => handleClick('/library')}
            onKeyDown={(e) => handleKeyToggle(1, e)}
            aria-expanded={indexFocus === 1}
            aria-controls="library-panel"
          >
            <h3>ห้องสมุดกฎหมาย</h3>
            <span className="material-symbols-outlined" aria-hidden>
              {indexFocus === 1 ? 'arrow_circle_down' : 'arrow_circle_right'}
            </span>
          </button>
        </div>

        <div className="menu-block-item">
          <button
            className="menu-item"
            onClick={() => handleFocusClick(2)}
            onKeyDown={(e) => handleKeyToggle(2, e)}
            aria-expanded={indexFocus === 2}
            aria-controls="history-panel"
            aria-disabled="true"
          >
            <h3>ประวัติการสนทนา</h3>
            <span className="material-symbols-outlined" aria-hidden>
              {indexFocus === 2 ? 'arrow_circle_down' : 'arrow_circle_right'}
            </span>
          </button>

          {indexFocus === 2 && (
            <div className='menu-subitem-list' id="history-panel">
              <div className='menu-subitem'>
                {subitemLineStyle}
                <p>ประวัติการสนทนา ยังไม่พร้อมใช้งาน</p>
              </div>
              <div className='menu-subitem'>
                {subitemLineStyle}
                <p>ประวัติการสนทนา ยังไม่พร้อมใช้งาน</p>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className='menu-footer'>
        <h3 className="brand" aria-hidden onClick={() => handleClick('/')}>จัดการบัญชี</h3>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile navbar */}
      <div className='navbar-container'>
        <button className='menu-btn' onClick={handleMenuClick} aria-label="Open menu">
          <span className="material-symbols-outlined" aria-hidden>
            menu
          </span>
        </button>
      </div>

      {(isMenuOpen || isClosing) && (
        <aside className={`menu-panel ${isClosing ? 'closing' : ''}`} role="dialog" aria-modal="true" aria-label="Main menu">
          {menuComponent}
        </aside>
      )}

      <nav className="desktop-navbar" aria-label="Primary">
        {menuComponent}
      </nav>
    </>
  );
}

export default NavBar;
