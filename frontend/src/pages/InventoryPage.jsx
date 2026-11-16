import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import DataManager from '../utils/data';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import '../styles/inventory.css';

function getStockClass(qty, safety) { if (qty <= 0) return 'stock-out'; if (qty <= safety) return 'stock-low'; return 'stock-ok'; }
function getShelfClass(rem) { if (rem === null) return ''; if (rem <= 2) return 'shelf-expired'; if (rem <= 5) return 'shelf-warning'; return 'shelf-fresh'; }

export default function InventoryPage() {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [reorderId, setReorderId] = useState(null);
    const [reorderQty, setReorderQty] = useState('');
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name:'', sku:'', category:'Root Vegetables', price:'', quantity:'', safetyStock:'', shelfLife:'', dateAdded:'' });

    useEffect(() => {
        if (!isLoggedIn) { navigate('/', { replace: true }); return; }
        if (isAdmin) { navigate('/admin', { replace: true }); return; }
        DataManager.initializeData();
        loadData();
    }, [isLoggedIn, isAdmin, navigate]);

    const loadData = () => {
        let prods = DataManager.getProducts();
        if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
        if (catFilter) prods = prods.filter(p => p.category === catFilter);
        setProducts(prods);
        setCategories(DataManager.getCategories());
        setLowStockProducts(DataManager.getLowStockProducts());
    };

    useEffect(() => { loadData(); }, [search, catFilter]);

    const showToastMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const openAddModal = () => { setEditingId(null); setForm({ name:'', sku:'', category:'Root Vegetables', price:'', quantity:'', safetyStock:'', shelfLife:'', dateAdded: new Date().toISOString().split('T')[0] }); setShowModal(true); };

    const openEditModal = (id) => { const p = DataManager.getProductById(id); if (!p) return; setEditingId(id); setForm({ name:p.name, sku:p.sku, category:p.category, price:p.unitPrice, quantity:p.quantity, safetyStock:p.safetyStock, shelfLife:p.shelfLifeDays||7, dateAdded:p.dateAdded||'' }); setShowModal(true); };

    const saveProduct = (e) => {
        e.preventDefault();
        const data = { name:form.name.trim(), sku:form.sku.trim(), category:form.category, unitPrice:parseFloat(form.price), quantity:parseInt(form.quantity), safetyStock:parseInt(form.safetyStock), shelfLifeDays:parseInt(form.shelfLife), dateAdded:form.dateAdded };
        if (editingId) { DataManager.updateProduct(editingId, data); showToastMsg('Vegetable updated successfully'); }
        else { DataManager.addProduct(data); showToastMsg('Vegetable added successfully'); }
        setShowModal(false); loadData();
    };

    const handleDelete = (id) => { const p = DataManager.getProductById(id); if (p && confirm(`Delete "${p.name}" from inventory?`)) { DataManager.deleteProduct(id); showToastMsg('Vegetable removed'); loadData(); } };

    const handleSale = (id) => { const input = document.getElementById(`sold-${id}`); const qty = parseInt(input?.value); if (!qty||qty<=0) { showToastMsg('Enter a valid quantity','error'); return; } if (DataManager.recordSale(id,qty)) { showToastMsg(`Sold ${qty} kg`); loadData(); } else showToastMsg('Insufficient stock','error'); };

    const openReorder = (id) => { setReorderId(id); setReorderQty(''); setShowReorderModal(true); };
    const confirmReorder = () => { const qty = parseInt(reorderQty); if (!qty||qty<=0) { showToastMsg('Please enter a valid quantity','error'); return; } if (DataManager.reorderStock(reorderId,qty)) { showToastMsg(`Restocked ${qty} kg successfully`); setShowReorderModal(false); loadData(); } else showToastMsg('Failed to restock','error'); };
    const reorderProduct = reorderId ? DataManager.getProductById(reorderId) : null;

    const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <>
            <Sidebar type="user" />
            <main className="main-content">
                <header className="page-header">
                    <div><h1 className="page-title">📦 Vegetable Inventory</h1><p className="page-subtitle">Manage your fresh produce stock, shelf life, and sales</p></div>
                    <div className="header-actions"><button className="btn btn-primary" onClick={openAddModal}>+ Add Vegetable</button></div>
                </header>
                <section className="filter-bar">
                    <div className="search-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" className="form-input search-input" placeholder="Search vegetables..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </section>
                <section className="card table-section">
                    <div className="table-container">
                        <table><thead><tr><th>Vegetable</th><th>SKU</th><th>Category</th><th>Stock (kg)</th><th>Safety</th><th>Price/kg</th><th>Shelf Life</th><th>Remaining</th><th>Sell</th><th>Actions</th></tr></thead>
                        <tbody>{products.length === 0 ? <tr><td colSpan="10" className="empty-table"><div className="empty-state"><span style={{fontSize:'2rem'}}>🥬</span><p>No vegetables found</p></div></td></tr> :
                        products.map(p => { const rem = DataManager.getShelfLifeRemaining(p); return (
                            <tr key={p.id}>
                                <td><div className="product-cell"><div className="product-icon">🥕</div><span className="product-name">{p.name}</span></div></td>
                                <td>{p.sku}</td><td><span className="badge badge-info">{p.category}</span></td>
                                <td><span className={`stock-badge ${getStockClass(p.quantity,p.safetyStock)}`}>{p.quantity} kg</span></td>
                                <td>{p.safetyStock} kg</td><td>${p.unitPrice.toFixed(2)}</td><td>{p.shelfLifeDays||'-'} days</td>
                                <td><span className={`shelf-badge ${getShelfClass(rem)}`}>{rem!==null?rem+' days':'-'}</span></td>
                                <td><div className="sold-input-group"><input type="number" min="1" max={p.quantity} defaultValue="1" className="form-input sold-input" id={`sold-${p.id}`}/><button className="btn btn-secondary sold-btn" onClick={()=>handleSale(p.id)} disabled={p.quantity===0}>✓</button></div></td>
                                <td><div className="action-buttons"><button className="btn btn-ghost btn-icon" onClick={()=>openEditModal(p.id)}>✏️</button><button className="btn btn-ghost btn-icon" onClick={()=>openReorder(p.id)}>📦</button><button className="btn btn-ghost btn-icon btn-danger-icon" onClick={()=>handleDelete(p.id)}>🗑️</button></div></td>
                            </tr>);})}</tbody></table>
                    </div>
                </section>
                {lowStockProducts.length > 0 && <section className="alert-section"><div className="card"><div className="card-header"><h3 className="card-title">⚠️ Low Stock Alert</h3></div><div className="low-stock-grid">{lowStockProducts.map(p=><div className="low-stock-card" key={p.id}><div className="low-stock-info"><strong>{p.name}</strong><span>{p.quantity} kg / {p.safetyStock} kg safety</span></div><button className="btn btn-sm btn-secondary" onClick={()=>openReorder(p.id)}>Restock</button></div>)}</div></div></section>}
            </main>

            <div className={`modal-overlay ${showModal?'active':''}`} onClick={()=>setShowModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
                <div className="modal-header"><h3 className="modal-title">{editingId?'Edit Vegetable':'Add Vegetable'}</h3><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
                <form onSubmit={saveProduct}>
                    <div className="form-row"><div className="form-group"><label className="form-label">Vegetable Name</label><input type="text" className="form-input" placeholder="e.g. Tomato" value={form.name} onChange={e=>updateForm('name',e.target.value)} required/></div><div className="form-group"><label className="form-label">SKU</label><input type="text" className="form-input" placeholder="e.g. VEG-TOM-001" value={form.sku} onChange={e=>updateForm('sku',e.target.value)} required/></div></div>
                    <div className="form-row"><div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e=>updateForm('category',e.target.value)}><option>Root Vegetables</option><option>Leafy Greens</option><option>Fruiting Vegetables</option><option>Cruciferous</option><option>Allium</option><option>Other</option></select></div><div className="form-group"><label className="form-label">Price per kg ($)</label><input type="number" className="form-input" step="0.01" min="0.01" value={form.price} onChange={e=>updateForm('price',e.target.value)} required/></div></div>
                    <div className="form-row"><div className="form-group"><label className="form-label">Quantity (kg)</label><input type="number" className="form-input" min="0" value={form.quantity} onChange={e=>updateForm('quantity',e.target.value)} required/></div><div className="form-group"><label className="form-label">Safety Stock (kg)</label><input type="number" className="form-input" min="0" value={form.safetyStock} onChange={e=>updateForm('safetyStock',e.target.value)} required/></div></div>
                    <div className="form-row"><div className="form-group"><label className="form-label">Shelf Life (days)</label><input type="number" className="form-input" min="1" value={form.shelfLife} onChange={e=>updateForm('shelfLife',e.target.value)} required/></div><div className="form-group"><label className="form-label">Date Added</label><input type="date" className="form-input" value={form.dateAdded} onChange={e=>updateForm('dateAdded',e.target.value)} required/></div></div>
                    <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingId?'Update':'Save'} Vegetable</button></div>
                </form>
            </div></div>

            <div className={`modal-overlay ${showReorderModal?'active':''}`} onClick={()=>setShowReorderModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
                <div className="modal-header"><h3 className="modal-title">📦 Restock Vegetable</h3><button className="modal-close" onClick={()=>setShowReorderModal(false)}>✕</button></div>
                {reorderProduct&&<div className="reorder-info"><strong>{reorderProduct.name}</strong><span>Current Stock: {reorderProduct.quantity} kg | Safety: {reorderProduct.safetyStock} kg</span></div>}
                <div className="form-group" style={{marginTop:'1rem'}}><label className="form-label">Restock Quantity (kg)</label><input type="number" className="form-input" min="1" placeholder="50" value={reorderQty} onChange={e=>setReorderQty(e.target.value)}/></div>
                <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowReorderModal(false)}>Cancel</button><button className="btn btn-primary" onClick={confirmReorder}>Restock</button></div>
            </div></div>

            {toast&&<div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
        </>
    );
}
