import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../utils/AuthContext';
import DataManager from '../utils/data';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import '../styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

function animateValue(setter, target, duration = 1000) {
    const start = performance.now();
    const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setter(Math.floor(target * easeOut));
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin } = useAuth();
    const [lowStock, setLowStock] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState({ labels: [], data: [] });
    const [inventoryData, setInventoryData] = useState({ labels: [], data: [] });
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
    const [categories, setCategories] = useState([]);

    // Animated values
    const [aTotalProducts, setATotalProducts] = useState(0);
    const [aInvValue, setAInvValue] = useState(0);
    const [aLowStock, setALowStock] = useState(0);
    const [aExpiring, setAExpiring] = useState(0);
    const [aTotalUnits, setATotalUnits] = useState(0);
    const [aMonthlyRev, setAMonthlyRev] = useState(0);
    const [aSalesUnits, setASalesUnits] = useState(0);
    const [aSalesRev, setASalesRev] = useState(0);
    const [aAvgPrice, setAAvgPrice] = useState(0);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/', { replace: true }); return; }
        if (isAdmin) { navigate('/admin', { replace: true }); return; }
        DataManager.initializeData();
        loadData();
    }, [isLoggedIn, isAdmin, navigate]);

    const loadData = () => {
        const m = DataManager.getDashboardMetrics();
        setLowStock(DataManager.getLowStockProducts());
        setCategories(DataManager.getCategories());
        setSalesData(DataManager.getSalesChartData(30));
        setInventoryData(DataManager.getMonthlyInventoryValueHistory(6));
        setMonthlyData(DataManager.getMonthlySalesData(6));
        setTopProducts(DataManager.getTopRevenueProducts(3));

        animateValue(setATotalProducts, m.totalProducts);
        animateValue(setAInvValue, m.totalInventoryValue);
        animateValue(setALowStock, m.lowStockCount);
        animateValue(setAExpiring, m.expiringSoonCount);
        animateValue(setATotalUnits, m.totalUnits);
        animateValue(setAMonthlyRev, m.totalRevenueThisMonth);
        animateValue(setASalesUnits, m.totalSalesThisMonth);
        animateValue(setASalesRev, m.totalRevenueThisMonth);
        const prods = DataManager.getProducts();
        const avg = prods.length > 0 ? prods.reduce((s, p) => s + p.unitPrice, 0) / prods.length : 0;
        setAAvgPrice(Math.round(avg * 100));
    };

    const refreshData = () => { loadData(); };

    const salesChartData = {
        labels: salesData.labels,
        datasets: [{ label: 'Kg Sold', data: salesData.data, backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: 'rgba(34, 197, 94, 1)', borderWidth: 1, borderRadius: 4, barThickness: 12 }]
    };

    const invChartData = {
        labels: inventoryData.labels,
        datasets: [{ label: 'Total Value', data: inventoryData.data, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }]
    };

    const monthlyChartData = {
        labels: monthlyData.labels,
        datasets: [{ label: 'Kg Sold', data: monthlyData.data, borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 2, fill: true, tension: 0.35, pointRadius: 4 }]
    };

    const chartOpts = (showLegend = false) => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: showLegend }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', titleColor: '#111827', bodyColor: '#4b5563', borderColor: '#e5e7eb', borderWidth: 1, padding: 12, displayColors: false } },
        scales: { x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#6b7280', font: { size: 11 } } } }
    });

    const invIsTrending = inventoryData.data.length >= 2 && inventoryData.data[inventoryData.data.length - 1] >= inventoryData.data[inventoryData.data.length - 2];

    return (
        <>
            <Sidebar type="user" />
            <main className="main-content">
                <header className="page-header">
                    <div><h1 className="page-title">🥬 Dashboard</h1><p className="page-subtitle">Welcome back! Here's an overview of your vegetable stock.</p></div>
                    <div className="header-actions">
                        <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
                        <button className="btn btn-secondary btn-sm" onClick={refreshData}>🔄 Refresh</button>
                    </div>
                </header>

                <section className="kpi-grid" style={{ width: '100%', maxWidth: '100%' }}>
                    <div className="kpi-card animate-fadeIn" style={{ '--delay': '0.1s' }}><div className="kpi-icon icon-blue">🥕</div><div className="kpi-content"><span className="kpi-label">Total Vegetables</span><span className="kpi-value">{aTotalProducts}</span></div></div>
                    <div className="kpi-card animate-fadeIn" style={{ '--delay': '0.2s' }}><div className="kpi-icon icon-green">💰</div><div className="kpi-content"><span className="kpi-label">Inventory Value</span><span className="kpi-value">${aInvValue.toLocaleString()}</span></div></div>
                    <div className="kpi-card animate-fadeIn" style={{ '--delay': '0.3s' }}><div className="kpi-icon icon-orange">⚠️</div><div className="kpi-content"><span className="kpi-label">Low Stock Items</span><span className="kpi-value">{aLowStock}</span></div></div>
                    <div className="kpi-card animate-fadeIn" style={{ '--delay': '0.4s' }}><div className="kpi-icon icon-red">🕐</div><div className="kpi-content"><span className="kpi-label">Expiring Soon</span><span className="kpi-value">{aExpiring}</span></div></div>
                </section>

                <section className="dashboard-grid" style={{ width: '100%', maxWidth: '100%', gridTemplateColumns: 'repeat(2, minmax(48%, 1fr))' }}>
                    <div className="card chart-card animate-fadeIn" style={{ '--delay': '0.5s' }}>
                        <div className="card-header"><h3 className="card-title">Sales Performance</h3><span className="badge badge-info">Last 30 Days</span></div>
                        <div className="chart-container"><Bar data={salesChartData} options={chartOpts()} /></div>
                    </div>
                    <div className="card chart-card animate-fadeIn" style={{ '--delay': '0.6s' }}>
                        <div className="card-header"><h3 className="card-title">Inventory Value Trend</h3><span className={`badge ${invIsTrending ? 'badge-success' : 'badge-danger'}`}>{invIsTrending ? 'Growing' : 'Declining'}</span></div>
                        <div className="chart-container"><Line data={invChartData} options={{ ...chartOpts(), scales: { ...chartOpts().scales, y: { ...chartOpts().scales.y, beginAtZero: false, ticks: { ...chartOpts().scales.y.ticks, callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v) } } } }} /></div>
                    </div>

                    <div className="card animate-fadeIn" style={{ '--delay': '0.65s' }}>
                        <div className="card-header"><h3 className="card-title">Sales This Month</h3><span className="badge badge-info">Current</span></div>
                        <div className="quick-stats">
                            <div className="stat-item"><span className="stat-label">Units Sold</span><span className="stat-value">{aSalesUnits.toLocaleString()}</span></div>
                            <div className="stat-item"><span className="stat-label">Revenue</span><span className="stat-value text-success">${aSalesRev.toLocaleString()}</span></div>
                        </div>
                        <div className="top-products-section">
                            <h4 className="top-products-title">Top Revenue Vegetables</h4>
                            <div className="top-products-list">
                                {topProducts.length === 0 || topProducts.every(p => p.revenue === 0) ? <div className="empty-state"><p>No sales recorded this month</p></div> :
                                    topProducts.map((p, i) => (
                                        <div className="top-product-item" key={i}>
                                            <div className="top-product-rank">#{i + 1}</div>
                                            <div className="top-product-info"><span className="top-product-name">{p.name}</span><span className="top-product-sku">{p.sku}</span></div>
                                            <div className="top-product-stats"><span className="top-product-revenue">${p.revenue.toLocaleString()}</span><span className="top-product-units">{p.unitsSold} kg</span></div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className="card chart-card animate-fadeIn" style={{ '--delay': '0.7s' }}>
                        <div className="card-header"><h3 className="card-title">Sales Over Past Months</h3><span className="badge badge-info">6M</span></div>
                        <div className="chart-container"><Line data={monthlyChartData} options={chartOpts()} /></div>
                    </div>

                    <div className="card animate-fadeIn" style={{ '--delay': '0.75s' }}>
                        <div className="card-header"><h3 className="card-title">⚠️ Low Stock Alert</h3><a href="/inventory" className="btn btn-ghost btn-sm" onClick={e => { e.preventDefault(); navigate('/inventory'); }}>View All</a></div>
                        <div className="low-stock-list">
                            {lowStock.length === 0 ? <div className="empty-state"><p>✅ All stock levels are healthy!</p></div> :
                                lowStock.slice(0, 5).map(p => (
                                    <div className="low-stock-item" key={p.id}>
                                        <div className="low-stock-info"><span className="low-stock-name">{p.name}</span><span className="low-stock-sku">{p.sku}</span></div>
                                        <div className="low-stock-qty"><span className="qty-current">{p.quantity}</span><span className="qty-divider">/</span><span className="qty-safety">{p.safetyStock}</span></div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="card animate-fadeIn" style={{ '--delay': '0.8s' }}>
                        <div className="card-header"><h3 className="card-title">Quick Stats</h3></div>
                        <div className="quick-stats">
                            <div className="stat-item"><span className="stat-label">Total Units in Stock</span><span className="stat-value">{aTotalUnits.toLocaleString()}</span></div>
                            <div className="stat-item"><span className="stat-label">Revenue This Month</span><span className="stat-value text-success">${aMonthlyRev.toLocaleString()}</span></div>
                            <div className="stat-item"><span className="stat-label">Avg. Unit Price</span><span className="stat-value">${(aAvgPrice / 100).toFixed(2)}</span></div>
                            <div className="stat-item"><span className="stat-label">Categories</span><span className="stat-value">{categories.length}</span></div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
