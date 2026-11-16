/**
 * Data Management Module - Veggie Stock Management System
 * Converted to ES module exports for React Vite frontend
 */

const DATA_KEY = 'veggie_stock_data';
const USERS_KEY = 'veggie_users';
const AUTH_TOKEN_KEY = 'veggie_auth_token';
const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders() {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

export async function backendFetch(relativePath, options = {}) {
    const url = `${API_BASE_URL}${relativePath}`;
    options.headers = { ...getAuthHeaders(), ...(options.headers || {}) };
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}

export async function apiAuthPost(endpoint, body) {
    const url = `${API_BASE_URL}/auth/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to authenticate');
    return data;
}

// Initial vegetable products
const initialProducts = [
    { id: 1, name: 'Tomato', sku: 'VEG-TOM-001', category: 'Fruiting Vegetables', quantity: 120, safetyStock: 25, unitPrice: 2.49, shelfLifeDays: 7, dateAdded: getDateDaysAgo(2), salesHistory: generateSalesHistory(180, 8, 20) },
    { id: 2, name: 'Potato', sku: 'VEG-POT-002', category: 'Root Vegetables', quantity: 200, safetyStock: 40, unitPrice: 1.29, shelfLifeDays: 21, dateAdded: getDateDaysAgo(5), salesHistory: generateSalesHistory(180, 10, 25) },
    { id: 3, name: 'Onion', sku: 'VEG-ONI-003', category: 'Root Vegetables', quantity: 180, safetyStock: 30, unitPrice: 1.49, shelfLifeDays: 30, dateAdded: getDateDaysAgo(10), salesHistory: generateSalesHistory(180, 8, 18) },
    { id: 4, name: 'Carrot', sku: 'VEG-CAR-004', category: 'Root Vegetables', quantity: 90, safetyStock: 20, unitPrice: 1.99, shelfLifeDays: 14, dateAdded: getDateDaysAgo(3), salesHistory: generateSalesHistory(180, 5, 12) },
    { id: 5, name: 'Spinach', sku: 'VEG-SPN-005', category: 'Leafy Greens', quantity: 50, safetyStock: 15, unitPrice: 3.49, shelfLifeDays: 5, dateAdded: getDateDaysAgo(3), salesHistory: generateSalesHistory(180, 6, 14) },
    { id: 6, name: 'Capsicum', sku: 'VEG-CAP-006', category: 'Fruiting Vegetables', quantity: 8, safetyStock: 15, unitPrice: 3.99, shelfLifeDays: 7, dateAdded: getDateDaysAgo(5), salesHistory: generateSalesHistory(180, 4, 10) },
    { id: 7, name: 'Cabbage', sku: 'VEG-CAB-007', category: 'Cruciferous', quantity: 60, safetyStock: 12, unitPrice: 2.29, shelfLifeDays: 14, dateAdded: getDateDaysAgo(4), salesHistory: generateSalesHistory(180, 3, 8) },
    { id: 8, name: 'Cauliflower', sku: 'VEG-CLF-008', category: 'Cruciferous', quantity: 40, safetyStock: 10, unitPrice: 3.79, shelfLifeDays: 7, dateAdded: getDateDaysAgo(1), salesHistory: generateSalesHistory(180, 3, 7) },
    { id: 9, name: 'Broccoli', sku: 'VEG-BRC-009', category: 'Cruciferous', quantity: 5, safetyStock: 10, unitPrice: 4.49, shelfLifeDays: 5, dateAdded: getDateDaysAgo(4), salesHistory: generateSalesHistory(180, 2, 6) },
    { id: 10, name: 'Green Beans', sku: 'VEG-GBN-010', category: 'Fruiting Vegetables', quantity: 70, safetyStock: 18, unitPrice: 2.99, shelfLifeDays: 5, dateAdded: getDateDaysAgo(1), salesHistory: generateSalesHistory(180, 5, 12) }
];

export function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

export function getShelfLifeRemaining(product) {
    if (!product.dateAdded || !product.shelfLifeDays) return null;
    const added = new Date(product.dateAdded);
    const expiryDate = new Date(added);
    expiryDate.setDate(expiryDate.getDate() + product.shelfLifeDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = expiryDate - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

export function generateSalesHistory(days, minSales, maxSales) {
    const history = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        history.push({
            date: date.toISOString().split('T')[0],
            sold: Math.floor(Math.random() * (maxSales - minSales + 1)) + minSales
        });
    }
    return history;
}

function getUserDataKey() {
    const username = sessionStorage.getItem('username');
    if (!username) return DATA_KEY;
    return `veggie_stock_${username}`;
}

export function initializeData() {
    const key = getUserDataKey();
    const existingData = localStorage.getItem(key);
    if (!existingData) {
        const data = { products: initialProducts, lastUpdated: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(data));
    }

    const token = getAuthToken();
    if (token) {
        backendFetch('/products').then(async resp => {
            if (resp && Array.isArray(resp.products) && resp.products.length > 0) {
                const sync = {
                    products: resp.products.map(item => ({
                        id: item._id || item.id,
                        _id: item._id,
                        name: item.name,
                        sku: item.sku,
                        category: item.category,
                        quantity: item.quantity,
                        safetyStock: item.safetyStock,
                        unitPrice: item.unitPrice,
                        shelfLifeDays: item.shelfLifeDays,
                        dateAdded: item.dateAdded ? new Date(item.dateAdded).toISOString().split('T')[0] : getDateDaysAgo(0),
                        salesHistory: item.salesHistory || []
                    })),
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem(key, JSON.stringify(sync));
            } else {
                const local = getData();
                if (local.products && local.products.length > 0) {
                    await Promise.all(local.products.map(product => {
                        return backendFetch('/products', { method: 'POST', body: JSON.stringify(product) }).catch(console.error);
                    }));
                }
            }
        }).catch(() => { });
    }

    return getData();
}

export function getData() {
    const key = getUserDataKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { products: [], lastUpdated: null };
}

export function saveData(data) {
    const key = getUserDataKey();
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
}

export function getProducts() { return getData().products; }

export function getProductById(id) { return getProducts().find(p => p.id === parseInt(id)); }

export function addProduct(product) {
    const data = getData();
    const maxId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) : 0;
    const newProduct = {
        id: maxId + 1, ...product,
        dateAdded: product.dateAdded || new Date().toISOString().split('T')[0],
        shelfLifeDays: product.shelfLifeDays || 7,
        salesHistory: []
    };
    data.products.push(newProduct);
    saveData(data);
    const token = getAuthToken();
    if (token) { backendFetch('/products', { method: 'POST', body: JSON.stringify(newProduct) }).catch(console.error); }
    return newProduct;
}

export function updateProduct(id, updates) {
    const data = getData();
    const index = data.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...updates };
        saveData(data);
        const token = getAuthToken();
        if (token) {
            const backendId = data.products[index]._id || data.products[index].id;
            backendFetch(`/products/${backendId}`, { method: 'PUT', body: JSON.stringify(data.products[index]) }).catch(console.error);
        }
        return data.products[index];
    }
    return null;
}

export function deleteProduct(id) {
    const data = getData();
    const product = data.products.find(p => p.id === parseInt(id));
    data.products = data.products.filter(p => p.id !== parseInt(id));
    saveData(data);
    const token = getAuthToken();
    if (token && product) {
        const backendId = product._id || product.id;
        backendFetch(`/products/${backendId}`, { method: 'DELETE' }).catch(console.error);
    }
}

export function recordSale(productId, quantity) {
    const data = getData();
    const product = data.products.find(p => p.id === parseInt(productId));
    if (product && product.quantity >= quantity) {
        product.quantity -= quantity;
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = product.salesHistory.find(h => h.date === today);
        if (todayEntry) { todayEntry.sold += quantity; } else { product.salesHistory.push({ date: today, sold: quantity }); }
        saveData(data);
        const token = getAuthToken();
        if (token) {
            const backendId = product._id || product.id;
            backendFetch(`/products/${backendId}`, { method: 'PUT', body: JSON.stringify(product) }).catch(console.error);
        }
        return true;
    }
    return false;
}

export function reorderStock(productId, quantity) {
    const data = getData();
    const product = data.products.find(p => p.id === parseInt(productId));
    if (product) {
        product.quantity += quantity;
        product.dateAdded = new Date().toISOString().split('T')[0];
        saveData(data);
        const token = getAuthToken();
        if (token) {
            const backendId = product._id || product.id;
            backendFetch(`/products/${backendId}`, { method: 'PUT', body: JSON.stringify(product) }).catch(console.error);
        }
        return true;
    }
    return false;
}

export function getLowStockProducts() { return getProducts().filter(p => p.quantity <= p.safetyStock); }

export function getExpiringSoonProducts() {
    return getProducts().filter(p => { const remaining = getShelfLifeRemaining(p); return remaining !== null && remaining <= 3; });
}

export function getDashboardMetrics() {
    const products = getProducts();
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const lowStockCount = products.filter(p => p.quantity <= p.safetyStock).length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const expiringSoonCount = products.filter(p => { const rem = getShelfLifeRemaining(p); return rem !== null && rem <= 3; }).length;
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    let totalSalesThisMonth = 0;
    let totalRevenueThisMonth = 0;
    products.forEach(product => {
        product.salesHistory.forEach(sale => {
            if (sale.date.startsWith(thisMonth)) {
                totalSalesThisMonth += sale.sold;
                totalRevenueThisMonth += sale.sold * product.unitPrice;
            }
        });
    });
    return { totalProducts, totalInventoryValue, lowStockCount, totalUnits, totalSalesThisMonth, totalRevenueThisMonth, expiringSoonCount };
}

export function getSalesChartData(days = 30) {
    const products = getProducts();
    const labels = [];
    const salesData = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        let dailyTotal = 0;
        products.forEach(product => { const sale = product.salesHistory.find(s => s.date === dateStr); if (sale) dailyTotal += sale.sold; });
        salesData.push(dailyTotal);
    }
    return { labels, data: salesData };
}

export function getMonthlyInventoryValueHistory(months = 6) {
    const products = getProducts();
    const currentTotalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const fixedMultipliers = [1.12, 0.78, 1.05, 1.08, 0.95, 1.00];
    const labels = [];
    const data = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        const idx = months - 1 - i;
        const multiplier = fixedMultipliers[idx] !== undefined ? fixedMultipliers[idx] : 1;
        data.push(Math.round(currentTotalValue * multiplier));
    }
    return { labels, data };
}

export function getProductSalesComparison(productIds, days = 30) {
    const products = getProducts().filter(p => productIds.includes(p.id));
    const labels = [];
    const datasets = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    const colors = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4'];
    products.forEach((product, index) => {
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const sale = product.salesHistory.find(s => s.date === dateStr);
            data.push(sale ? sale.sold : 0);
        }
        datasets.push({
            label: product.name, data, borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '33', borderWidth: 2, fill: false, tension: 0.3, pointRadius: 3
        });
    });
    return { labels, datasets };
}

export function getCategories() { return [...new Set(getProducts().map(p => p.category))]; }

export function getMonthlySalesData(months = 6) {
    const products = getProducts();
    const labels = [];
    const data = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        let monthlyTotal = 0;
        products.forEach(product => { product.salesHistory.forEach(sale => { if (sale.date.startsWith(monthKey)) monthlyTotal += sale.sold; }); });
        data.push(monthlyTotal);
    }
    return { labels, data };
}

export function getTopRevenueProducts(count = 3) {
    const products = getProducts();
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    const productRevenues = products.map(product => {
        let monthlyRevenue = 0;
        let unitsSold = 0;
        product.salesHistory.forEach(sale => {
            if (sale.date.startsWith(thisMonth)) { unitsSold += sale.sold; monthlyRevenue += sale.sold * product.unitPrice; }
        });
        return { id: product.id, name: product.name, sku: product.sku, unitsSold, revenue: monthlyRevenue };
    });
    return productRevenues.sort((a, b) => b.revenue - a.revenue).slice(0, count);
}

// User management
export function getUsers() { const data = localStorage.getItem(USERS_KEY); return data ? JSON.parse(data) : []; }
export function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return { success: false, message: 'Username already exists' };
    users.push({ username, password, createdAt: new Date().toISOString() });
    saveUsers(users);
    return { success: true };
}

export function validateUser(username, password) {
    const users = getUsers();
    return !!users.find(u => u.username === username && u.password === password);
}

export function getAllUsersStats() {
    const users = getUsers();
    let totalInventoryItems = 0, totalStockQuantity = 0, totalShelfLifeRemaining = 0, shelfLifeCount = 0;
    users.forEach(user => {
        const key = `veggie_stock_${user.username}`;
        const rawData = localStorage.getItem(key);
        if (rawData) {
            const data = JSON.parse(rawData);
            if (data.products) {
                totalInventoryItems += data.products.length;
                data.products.forEach(p => {
                    totalStockQuantity += p.quantity || 0;
                    const rem = getShelfLifeRemaining(p);
                    if (rem !== null) { totalShelfLifeRemaining += rem; shelfLifeCount++; }
                });
            }
        }
    });
    return { totalUsers: users.length, totalInventoryItems, totalStockQuantity, avgShelfLifeRemaining: shelfLifeCount > 0 ? Math.round(totalShelfLifeRemaining / shelfLifeCount) : 0 };
}

// Default export as DataManager for compatibility
const DataManager = {
    initializeData, getProducts, getProductById, addProduct, updateProduct, deleteProduct,
    recordSale, reorderStock, getLowStockProducts, getExpiringSoonProducts, getDashboardMetrics,
    getSalesChartData, getMonthlyInventoryValueHistory, getProductSalesComparison, getCategories,
    getMonthlySalesData, getTopRevenueProducts, getShelfLifeRemaining, getUsers, registerUser,
    validateUser, getAllUsersStats
};

export default DataManager;
