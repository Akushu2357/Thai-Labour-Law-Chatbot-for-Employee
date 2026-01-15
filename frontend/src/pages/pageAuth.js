import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './pageAuth.css';
import logo from '../assets/logo.svg';

function PageAuth() {
    const [email, setEmail] = useState('suvit-saetang@gmail.com');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) return; // minimal validation
        // For now use a fake login flow — replace with real API call
        login({ email });
        navigate('/chat');
    };

    return (
        <div className="page-auth">
            <div className="auth-card">
                <div className="auth-inner">
                    <img src={logo} alt="logo" className="auth-logo" />
                    <h1 className="auth-title">ลงทะเบียน</h1>
                    <p className="auth-sub">ลงทะเบียนสำหรับสร้างบัญชีใหม่ !</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="input-label">อีเมล</label>
                        <div className="input-pill">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-input"
                                placeholder="example@email.com"
                            />
                        </div>

                        <label className="input-label">รหัสผ่าน</label>
                        <div className="input-pill password-pill">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-input"
                                placeholder="•••••••"
                            />
                            <button
                                type="button"
                                className="eye-btn material-symbols-outlined"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </button>
                        </div>

                        <div className="form-row">
                            <a href="/" className="forgot-link">ลืมรหัสผ่าน?</a>
                        </div>

                        <button className="submit-btn" type="submit">ลงทะเบียน</button>

                        <div className="have-account">มีบัญชีอยู่แล้ว?</div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PageAuth;
