import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../utils/AuthContext';
import DataManager from '../utils/data';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import '../styles/insights.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function InsightsPage() {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/', { replace: true }); return; }
        if (isAdmin) { navigate('/admin', { replace: true }); return; }
        DataManager.initializeData();
        const prods = DataManager.getProducts();
        setProducts(prods);
        setFiltered(prods);
    }, [isLoggedIn, isAdmin, navigate]);

    useEffect(() => {
        let list = products;
        if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        setFiltered(list);
    }, [searchTerm, products]);

    useEffect(() => {
        if (selectedIds.length === 0) { setChartData(null); return; }
        const data = DataManager.getProductSalesComparison(selectedIds, 30);
        setChartData(data);
    }, [selectedIds]);

    const toggleProduct = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 5) { alert('Maximum 5 vegetables for comparison'); return prev; }
            return [...prev, id];
        });
    };

    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));

    return (
        <>
            <Sidebar type="user" />
            <main className="main-content">
                <header className="page-header">
                    <div><h1 className="page-title">📊 Vegetable Insights</h1><p className="page-subtitle">Compare sales performance across your vegetables</p></div>
                </header>

                <section className="card selection-card">
                    <div className="card-header"><h3 className="card-title">Select Vegetables to Compare</h3><span className="badge badge-info">{selectedIds.length} selected</span></div>
                    <div className="selection-search"><input type="text" className="form-input" placeholder="Search vegetables..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <div className="product-selection-grid">
                        {filtered.map(p => {
                            const isSelected = selectedIds.includes(p.id);
                            const remaining = DataManager.getShelfLifeRemaining(p);
                            return (
                                <div key={p.id} className={`product-select-card ${isSelected ? 'selected' : ''}`} onClick={() => toggleProduct(p.id)}>
                                    <div className="product-select-check">{isSelected ? '✅' : '⬜'}</div>
                                    <div className="product-select-info"><span className="product-select-name">🥕 {p.name}</span><span className="product-select-sku">{p.sku}</span></div>
                                    <div className="product-select-meta"><span className="product-select-stock">{p.quantity} kg</span>{remaining !== null && <span className="product-select-shelf">{remaining}d left</span>}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {chartData && (
                    <section className="card chart-card">
                        <div className="card-header"><h3 className="card-title">Sales Comparison</h3><span className="badge badge-info">Last 30 Days</span></div>
                        <div className="chart-container">
                            <Line data={{ labels: chartData.labels, datasets: chartData.datasets }} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: true, position: 'top', labels: { color: '#374151', font: { size: 11 }, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', titleColor: '#111827', bodyColor: '#4b5563', borderColor: '#e5e7eb', borderWidth: 1, padding: 12 } },
                                scales: { x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#6b7280' }, title: { display: true, text: 'Kg Sold', color: '#6b7280' } } },
                                interaction: { intersect: false, mode: 'index' }
                            }} />
                        </div>
                    </section>
                )}

                {selectedProducts.length > 0 && (
                    <section className="stats-grid">
                        {selectedProducts.map(product => {
                            const remaining = DataManager.getShelfLifeRemaining(product);
                            let monthlySales = 0, monthlyRevenue = 0;
                            product.salesHistory.forEach(s => { if (s.date.startsWith(thisMonth)) { monthlySales += s.sold; monthlyRevenue += s.sold * product.unitPrice; } });
                            const shelfClass = remaining === null ? '' : remaining <= 2 ? 'text-danger' : remaining <= 5 ? 'text-warning' : 'text-success';
                            return (
                                <div className="card stat-card" key={product.id}>
                                    <h4 className="stat-card-name">🥕 {product.name}</h4>
                                    <div className="stat-card-grid">
                                        <div className="stat-mini"><span className="stat-mini-label">Stock</span><span className="stat-mini-value">{product.quantity} kg</span></div>
                                        <div className="stat-mini"><span className="stat-mini-label">Price/kg</span><span className="stat-mini-value">${product.unitPrice.toFixed(2)}</span></div>
                                        <div className="stat-mini"><span className="stat-mini-label">Monthly Sales</span><span className="stat-mini-value">{monthlySales} kg</span></div>
                                        <div className="stat-mini"><span className="stat-mini-label">Monthly Revenue</span><span className="stat-mini-value text-success">${monthlyRevenue.toFixed(0)}</span></div>
                                        <div className="stat-mini"><span className="stat-mini-label">Shelf Life</span><span className="stat-mini-value">{product.shelfLifeDays || '-'} days</span></div>
                                        <div className="stat-mini"><span className="stat-mini-label">Remaining</span><span className={`stat-mini-value ${shelfClass}`}>{remaining !== null ? remaining + ' days' : '-'}</span></div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
            </main>
        </>
    );
}
