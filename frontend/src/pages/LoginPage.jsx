import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../styles/login.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isLoggedIn, isAdmin, login, signup } = useAuth();
    const requestedMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    const [activeTab, setActiveTab] = useState(requestedMode);

    // Login state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Signup state
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirm, setSignupConfirm] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        }
    }, [isLoggedIn, isAdmin, navigate]);

    useEffect(() => {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) { setLoginUsername(remembered); setRememberMe(true); }
    }, []);

    useEffect(() => {
        setActiveTab(requestedMode);
    }, [requestedMode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!loginUsername.trim() || !loginPassword.trim()) { setLoginError('Please enter both username and password.'); return; }
        setLoginLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const result = await login(loginUsername.trim(), loginPassword.trim());
        if (result.success) {
            if (rememberMe) localStorage.setItem('rememberedUser', loginUsername.trim());
            setLoginSuccess(true);
            setTimeout(() => navigate(result.isAdmin ? '/admin' : '/dashboard', { replace: true }), 500);
        } else {
            setLoginLoading(false);
            setLoginError(result.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setSignupError('');
        if (!signupUsername.trim() || !signupPassword.trim() || !signupConfirm.trim()) { setSignupError('Please fill in all fields.'); return; }
        if (signupPassword.length < 4) { setSignupError('Password must be at least 4 characters.'); return; }
        if (signupPassword !== signupConfirm) { setSignupError('Passwords do not match.'); return; }
        setSignupLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const result = await signup(signupUsername.trim(), signupPassword.trim());
        if (result.success) {
            setSignupSuccess(true);
            setTimeout(() => navigate('/dashboard', { replace: true }), 500);
        } else {
            setSignupLoading(false);
            setSignupError(result.message);
        }
    };

    return (
        <>
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>
            <main className="login-container">
                <div className="login-card glass-card animate-fadeIn">
                    <div className="login-header">
                        <div className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                        </div>
                        <h1 className="logo-text">🥬 VeggieTrack</h1>
                        <p className="login-subtitle">Smart Vegetable Stock Management</p>
                    </div>

                    <div className="auth-tabs">
                        <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</button>
                        <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Sign Up</button>
                    </div>

                    {activeTab === 'login' && (
                        <div className="auth-panel active">
                            <form className="login-form" onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="loginUsername">Username</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-text">👤</span>
                                        <input type="text" id="loginUsername" className="form-input has-icon" placeholder="Enter your username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="loginPassword">Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-text">🔒</span>
                                        <input type="password" id="loginPassword" className="form-input has-icon" placeholder="Enter your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-options">
                                    <label className="checkbox-wrapper">
                                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                        <span className="checkbox-label">Remember me</span>
                                    </label>
                                </div>
                                {loginError && <div className="error-message">{loginError}</div>}
                                <button type="submit" className="btn btn-primary btn-login" disabled={loginLoading} style={loginSuccess ? { background: '#16a34a' } : {}}>
                                    {loginSuccess ? '✓ Welcome!' : loginLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'signup' && (
                        <div className="auth-panel active">
                            <form className="login-form" onSubmit={handleSignup}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signupUsername">Username</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-text">👤</span>
                                        <input type="text" id="signupUsername" className="form-input has-icon" placeholder="Choose a username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signupPassword">Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-text">🔒</span>
                                        <input type="password" id="signupPassword" className="form-input has-icon" placeholder="Create a password (min 4 chars)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="signupConfirmPassword">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon-text">🔒</span>
                                        <input type="password" id="signupConfirmPassword" className="form-input has-icon" placeholder="Confirm your password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} required />
                                    </div>
                                </div>
                                {signupError && <div className="error-message">{signupError}</div>}
                                <button type="submit" className="btn btn-primary btn-login" disabled={signupLoading} style={signupSuccess ? { background: '#16a34a' } : {}}>
                                    {signupSuccess ? '✓ Account Created!' : signupLoading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="login-footer">
                        <Link to="/home" className="logo-link">
                            <div className="footer-logo-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                            </div>
                            <span className="footer-logo-text">🥬 VeggieTrack</span>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
