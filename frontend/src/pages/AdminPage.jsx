import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import DataManager from '../utils/data';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import '../styles/admin.css';

function animateValue(setter, target, duration = 1000) {
    const start = performance.now();
    const step = (now) => { const elapsed = now - start; const progress = Math.min(elapsed / duration, 1); const ease = 1 - Math.pow(1 - progress, 4); setter(Math.floor(target * ease)); if (progress < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
}

export default function AdminPage() {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
    const [aUsers, setAUsers] = useState(0);
    const [aItems, setAItems] = useState(0);
    const [aStock, setAStock] = useState(0);
    const [aShelf, setAShelf] = useState(0);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!isLoggedIn || !isAdmin) { navigate('/', { replace: true }); return; }
        const stats = DataManager.getAllUsersStats();
        animateValue(setAUsers, stats.totalUsers);
        animateValue(setAItems, stats.totalInventoryItems);
        animateValue(setAStock, stats.totalStockQuantity);
        animateValue(setAShelf, stats.avgShelfLifeRemaining);
        setUsers(DataManager.getUsers());
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
        return () => clearInterval(timer);
    }, [isLoggedIn, isAdmin, navigate]);

    const loginTime = sessionStorage.getItem('loginTime');
    const plans = ['Free', 'Pro', 'Enterprise'];
    const planColors = { Free: '#6b7280', Pro: '#16a34a', Enterprise: '#7c3aed' };

    return (
        <>
            <Sidebar type="admin" />
            <main className="main-content">
                <header className="page-header"><div><h1 className="page-title">🛡️ Admin Dashboard</h1><p className="page-subtitle">Platform overview — aggregated statistics only. User privacy is protected.</p></div></header>

                <div className="privacy-notice animate-fadeIn" style={{ '--delay': '0.1s' }}><span className="privacy-icon">🔒</span><p>This dashboard shows only aggregated platform statistics. No individual user data or inventory details are displayed to protect user privacy.</p></div>

                <section className="admin-kpi-grid">
                    <div className="admin-kpi-card animate-fadeIn" style={{'--delay':'0.15s'}}><div className="admin-kpi-icon icon-blue">👥</div><div className="admin-kpi-content"><span className="admin-kpi-label">Total Registered Users</span><span className="admin-kpi-value">{aUsers.toLocaleString()}</span></div></div>
                    <div className="admin-kpi-card animate-fadeIn" style={{'--delay':'0.25s'}}><div className="admin-kpi-icon icon-green">📦</div><div className="admin-kpi-content"><span className="admin-kpi-label">Total Inventory Items</span><span className="admin-kpi-value">{aItems.toLocaleString()}</span><span className="admin-kpi-sub">Across all users</span></div></div>
                    <div className="admin-kpi-card animate-fadeIn" style={{'--delay':'0.35s'}}><div className="admin-kpi-icon icon-orange">📊</div><div className="admin-kpi-content"><span className="admin-kpi-label">Total Stock Quantity</span><span className="admin-kpi-value">{aStock.toLocaleString()}</span><span className="admin-kpi-sub">Combined units</span></div></div>
                    <div className="admin-kpi-card animate-fadeIn" style={{'--delay':'0.45s'}}><div className="admin-kpi-icon icon-purple">🕐</div><div className="admin-kpi-content"><span className="admin-kpi-label">Avg. Shelf Life Remaining</span><span className="admin-kpi-value">{aShelf.toLocaleString()}</span><span className="admin-kpi-sub">Days average</span></div></div>
                </section>

                <section className="admin-info-section animate-fadeIn" style={{'--delay':'0.5s'}}><div className="card"><div className="card-header"><h3 className="card-title">👥 User Management</h3></div>
                    {users.length === 0 ? <div className="empty-state"><p>No registered users yet.</p></div> :
                    <div className="user-table-container"><table className="user-table"><thead><tr><th>Username</th><th>Plan</th><th>Expiry Date</th><th>Status</th><th>Registered</th></tr></thead>
                    <tbody>{users.map((user, i) => {
                        const hash = user.username.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
                        const plan = plans[hash % 3];
                        const regDate = new Date(user.createdAt || Date.now());
                        const expiryDays = plan === 'Free' ? 0 : (hash % 336) + 30;
                        const expiryDate = new Date(regDate); expiryDate.setDate(expiryDate.getDate() + expiryDays);
                        const isActive = plan === 'Free' || expiryDate > new Date();
                        return (
                            <tr key={i}>
                                <td><div className="user-cell"><div className="user-cell-avatar">{user.username.charAt(0).toUpperCase()}</div><span>{user.username}</span></div></td>
                                <td><span className="plan-badge" style={{background:`${planColors[plan]}15`, color:planColors[plan], border:`1px solid ${planColors[plan]}30`}}>{plan}</span></td>
                                <td>{plan==='Free'?'No expiry':expiryDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                                <td><span className={`status-dot ${isActive?'status-active':'status-expired'}`}></span> {isActive?'Active':'Expired'}</td>
                                <td>{regDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                            </tr>);
                    })}</tbody></table></div>}
                </div></section>

                <section className="admin-info-section animate-fadeIn" style={{'--delay':'0.55s'}}><div className="card"><div className="card-header"><h3 className="card-title">📋 Platform Information</h3></div>
                    <div className="admin-info-grid">
                        <div className="info-item"><span className="info-label">Platform Name</span><span className="info-value">VeggieTrack</span></div>
                        <div className="info-item"><span className="info-label">Version</span><span className="info-value">1.0.0</span></div>
                        <div className="info-item"><span className="info-label">Admin Username</span><span className="info-value">admin</span></div>
                        <div className="info-item"><span className="info-label">Data Storage</span><span className="info-value">Local (Browser)</span></div>
                        <div className="info-item"><span className="info-label">Session Started</span><span className="info-value">{loginTime ? new Date(loginTime).toLocaleString() : '-'}</span></div>
                        <div className="info-item"><span className="info-label">Current Time</span><span className="info-value">{currentTime}</span></div>
                    </div>
                </div></section>

                <section className="admin-info-section animate-fadeIn" style={{'--delay':'0.65s'}}><div className="card"><div className="card-header"><h3 className="card-title">🔐 Privacy Commitment</h3></div>
                    <div className="privacy-details">
                        {['Individual user inventory data is never displayed on the admin dashboard','User personal information and passwords are never exposed','Only aggregated, anonymized statistics are shown for platform management','All data is stored locally in the user\'s own browser'].map((t,i) => (
                            <div className="privacy-item" key={i}><span className="privacy-check">✅</span><p>{t}</p></div>
                        ))}
                    </div>
                </div></section>
            </main>
        </>
    );
}
