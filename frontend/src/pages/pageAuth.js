import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './pageAuth.css';
import logo from '../assets/logo.svg';

function PageAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(true);
    const { signUp, signInWithGoogle, signIn, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError(null);
        if (!email || !password) {
            setAuthError('โปรดกรอกอีเมลและรหัสผ่าน');
            return;
        }
        try {
            if (isSignUp) {
                console.log('Signing up with', email);
                await signUp({ email, password });
            } else {
                console.log('Signing in with', email);
                await signIn({ email, password });
            }
        } catch (err) {
            setAuthError(err.message || String(err));
        }
    };

    const handleGoogle = async () => {
        setAuthError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            setAuthError(err.message || String(err));
        }
    };

    return (
        <div className="page-auth">
            <div className="auth-card">
                <div className="auth-inner">
                    <img src={logo} alt="logo" className="auth-logo" />
                    <h1 className="auth-title">{isSignUp ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}</h1>
                    <p className="auth-sub">{isSignUp ? 'ลงทะเบียนสำหรับสร้างบัญชีใหม่ !' : 'เข้าสู่ระบบด้วยบัญชีของคุณ'}</p>

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

                        {!isSignUp && (
                            <div className="form-row">
                                <a href="/" className="forgot-link" style={{ cursor: 'pointer' }}>ลืมรหัสผ่าน?</a>
                                <span onClick={() => setIsSignUp(true)} className="register-account" style={{ cursor: 'pointer' }}>สร้างบัญชีใหม่</span>
                            </div>
                        )}
                        {isSignUp && (
                            <div className="form-row">
                                <span onClick={() => setIsSignUp(false)} className="create-account" style={{ cursor: 'pointer' }}>มีบัญชีอยู่แล้ว?</span>
                            </div>
                        )}

                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? <span className='material-symbols-outlined'>hourglass_top</span> :
                            isSignUp ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
                        </button>

                        {authError && <div className="auth-error">{authError}</div>}

                        <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
                            เข้าสู่ระบบด้วย Google</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PageAuth;
