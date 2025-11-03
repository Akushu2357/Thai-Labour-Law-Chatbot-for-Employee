import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <>
        <style>{`
          /* Container */
          .app-shell { position: relative; min-height: 100vh; }

          /* Desktop floating nav */
          .floating-nav {
            position: fixed;
            top: 50%;
            left: 24px;
            transform: translateY(-50%);
            width: 220px;
            background: rgba(255,255,255,0.95);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 50;
          }
          .floating-nav .brand {
            display:flex;
            align-items:center;
            gap:8px;
            padding:8px;
            font-weight:700;
            font-size:16px;
          }
          .floating-nav nav a {
            display:block;
            padding:8px 10px;
            color:#0b1220;
            border-radius:8px;
            text-decoration:none;
            font-size:14px;
          }
          .floating-nav nav a:hover { background:#f1f5f9; }

          /* Mobile: hide desktop nav and show menu icon */
          .nav-toggle { display:none; }

          .mobile-menu-btn {
            display:none;
            position: fixed;
            top: 18px;
            right: 18px;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(255,255,255,0.95);
            box-shadow: 0 6px 18px rgba(0,0,0,0.12);
            align-items: center;
            justify-content: center;
            z-index: 60;
            cursor: pointer;
          }
          .mobile-menu-btn svg { width:22px; height:22px; color:#0b1220; }

          /* Mobile slide panel */
          .mobile-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: 320px;
            max-width: 100%;
            height: 100vh;
            background: #fff;
            transform: translateX(110%);
            transition: transform .28s ease;
            box-shadow: -20px 0 40px rgba(2,6,23,0.2);
            z-index: 70;
            padding: 20px;
            display:flex;
            flex-direction:column;
            gap:12px;
          }
          .mobile-panel .close-hint {
            display:flex;
            justify-content:space-between;
            align-items:center;
          }
          .mobile-panel nav a {
            padding:12px;
            border-radius:8px;
            text-decoration:none;
            color:#0b1220;
            font-weight:600;
            display:block;
            background:#f8fafc;
          }

          /* Overlay when open */
          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(2,6,23,0.45);
            opacity: 0;
            pointer-events: none;
            transition: opacity .28s ease;
            z-index: 65;
          }

          /* Toggle behavior (checkbox hack) */
          .nav-toggle:checked ~ .mobile-overlay {
            opacity: 1;
            pointer-events: auto;
          }
          .nav-toggle:checked ~ .mobile-panel {
            transform: translateX(0);
          }

          /* Responsive rules */
          @media (max-width: 768px) {
            .floating-nav { display: none; }
            .mobile-menu-btn { display:flex; }
          }

          /* Larger screens: ensure mobile elements hidden */
          @media (min-width: 769px) {
            .mobile-panel, .mobile-overlay, .mobile-menu-btn { display: none; }
          }
        `}</style>

        <div className="app-shell">
          {/* Desktop floating navbar */}
          <aside className="floating-nav" aria-label="Primary">
            <div className="brand">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect width="24" height="24" rx="6" fill="#0ea5a6"></rect>
              </svg>
              Thai Labour
            </div>

            <nav>
              <a href="#dashboard">Dashboard</a>
              <a href="#laws">Laws & Regulations</a>
              <a href="#cases">Precedents</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </nav>
          </aside>

          {/* Mobile: checkbox toggles panel */}
          <input id="nav-toggle" className="nav-toggle" type="checkbox" />
          <label htmlFor="nav-toggle" className="mobile-menu-btn" aria-label="Open menu" title="Open menu">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          </label>

          <div className="mobile-overlay" onClick={() => {
            // close by clicking overlay: toggle the checkbox via DOM since no hooks are used
            const cb = document.getElementById('nav-toggle');
            if (cb) cb.checked = false;
          }} aria-hidden="true"></div>

          <aside className="mobile-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
            <div className="close-hint">
              <strong id="mobile-menu-title">Menu</strong>
              <label htmlFor="nav-toggle" style={{cursor:'pointer'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
              </label>
            </div>

            <nav>
              <a href="#dashboard" onClick={() => { const cb = document.getElementById('nav-toggle'); if (cb) cb.checked = false; }}>Dashboard</a>
              <a href="#laws" onClick={() => { const cb = document.getElementById('nav-toggle'); if (cb) cb.checked = false; }}>Laws & Regulations</a>
              <a href="#cases" onClick={() => { const cb = document.getElementById('nav-toggle'); if (cb) cb.checked = false; }}>Precedents</a>
              <a href="#faq" onClick={() => { const cb = document.getElementById('nav-toggle'); if (cb) cb.checked = false; }}>FAQ</a>
              <a href="#contact" onClick={() => { const cb = document.getElementById('nav-toggle'); if (cb) cb.checked = false; }}>Contact</a>
            </nav>
          </aside>

          {/* Example page content placeholder */}
          <main style={{padding:24, marginLeft:260}}>
            <h1>Welcome</h1>
            <p>This layout shows a floating navbar on desktop (1920×1080) and a hamburger menu that opens a right-floated panel on mobile (390×844).</p>
          </main>
        </div>
      </>
    </div>
  );
}

export default App;
