import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { 
  ArrowLeft, Save, Edit3, Image as ImageIcon, Package, X, ShoppingBag, 
  LayoutGrid, Clock, Truck, CheckCircle2, Lock, BarChart3, TrendingUp, 
  CreditCard, Plus, Trash2, Search, Bell, Mail, LogOut, DollarSign,
  ChevronRight, Sparkles, Calendar, Filter, ArrowUpRight, ArrowDownRight, Users
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBack: () => void;
}

export default function AdminPanel({ products, onUpdateProduct, onAddProduct, onDeleteProduct, onBack }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'revenue'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [analyticsYear, setAnalyticsYear] = useState('2026');
  const [analyticsMetric, setAnalyticsMetric] = useState<'revenue' | 'orders'>('revenue');

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isAuthenticated && supabase) {
      const fetchOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (data && !error) setOrders(data);
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!supabase) {
      setAuthError('Supabase not configured');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPass,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setEditingId('new');
    setIsAdding(true);
    setEditForm({
      id: `prod-${Date.now()}`,
      name: '',
      price: 0,
      description: '',
      category: 'worn-textiles',
      materials: '',
      story: '',
      features: [],
      sizes: ['One Size'],
      inStock: true,
      imageUrl: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDeleteProduct(id);
    }
  };

  const handleSave = () => {
    if (editForm) {
      const cleanedForm = {
        ...editForm,
        additionalImages: editForm.additionalImages?.filter(url => url.trim() !== '') || []
      };

      if (isAdding) {
        onAddProduct(cleanedForm);
      } else {
        onUpdateProduct(cleanedForm);
      }
      setEditingId(null);
      setEditForm(null);
      setIsAdding(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editForm) return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm({ ...editForm, [name]: checked });
    } else if (name === 'price') {
      setEditForm({ ...editForm, [name]: parseFloat(value) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (supabase) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== orderId));
      if (supabase) {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
          console.error('Failed to delete order:', error);
          alert('Failed to delete order.');
        }
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Processing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const completedOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const productSales = completedOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.productName]) acc[item.productName] = { quantity: 0, revenue: 0 };
      acc[item.productName].quantity += item.quantity;
      acc[item.productName].revenue += item.price * item.quantity;
    });
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topProducts = Object.entries(productSales)
    .map(([name, stats]: [string, any]) => ({ name, quantity: stats.quantity, revenue: stats.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const monthlyTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map: Record<string, { revenue: number; orders: number }> = {};
    monthNames.forEach(m => { map[m] = { revenue: 0, orders: 0 }; });

    completedOrders.forEach(o => {
      const d = new Date(o.date);
      if (!isNaN(d.getTime())) {
        const month = monthNames[d.getMonth()];
        if (map[month]) {
          map[month].revenue += o.total;
          map[month].orders += 1;
        }
      }
    });

    return monthNames.map(m => ({
      month: m,
      revenue: map[m].revenue,
      orders: map[m].orders,
    }));
  }, [completedOrders]);

  const statusDistributionData = useMemo(() => {
    const counts: Record<string, number> = {
      Delivered: 0,
      Shipped: 0,
      Processing: 0,
      Pending: 0,
      Cancelled: 0,
    };
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    const COLOR_MAP: Record<string, string> = {
      Delivered: '#10B981',
      Shipped: '#8B5CF6',
      Processing: '#3B82F6',
      Pending: '#F59E0B',
      Cancelled: '#EF4444',
    };

    const result = Object.entries(counts)
      .filter(([_, cnt]) => cnt > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: COLOR_MAP[name] || '#64748B',
      }));

    if (result.length === 0) {
      return [{ name: 'No Orders', value: 1, color: '#E2E8F0' }];
    }
    return result;
  }, [orders]);

  const topProductsChartData = useMemo(() => {
    return topProducts.map(p => ({
      name: p.name.length > 14 ? p.name.substring(0, 12) + '..' : p.name,
      fullName: p.name,
      revenue: p.revenue,
      quantity: p.quantity,
    }));
  }, [topProducts]);

  const totalItemsSold = useMemo(() => {
    return completedOrders.reduce((acc, o) => {
      return acc + o.items.reduce((s, i) => s + i.quantity, 0);
    }, 0);
  }, [completedOrders]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/80 to-amber-50/40 flex flex-col items-center justify-center p-6 text-slate-800 relative z-50">
        <button 
          onClick={onBack} 
          className="absolute top-8 left-8 p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-all border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shop
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-slate-200/80">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#FF8A00] to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 text-white">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Admin Dashboard</h1>
              <p className="font-sans text-xs text-slate-500 mt-1">Sign in with authorized credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Email ID</label>
                <input 
                  type="email" 
                  placeholder="admin@loomcontrol.com" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">Passphrase</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={authPass} 
                  onChange={e => setAuthPass(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm" 
                  required 
                />
              </div>
              
              {authError && (
                <div className="text-rose-500 text-xs text-center font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-[#FF8A00] hover:bg-[#e07a00] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20 mt-2"
              >
                Authenticate Access
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F6] p-3 sm:p-6 text-slate-800 relative z-50 flex flex-col font-sans">
      <div className="max-w-7xl w-full mx-auto bg-[#F8F9FD] border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[85vh] flex-1">
        
        {/* Left Sidebar (ShapeRex Style) */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/70 p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[#FF8A00] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/30">
                <Sparkles className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 leading-tight tracking-tight">LoomAvenue</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Control Panel</span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'products'
                    ? 'bg-orange-50 text-[#FF8A00] border-l-4 border-[#FF8A00] rounded-r-xl shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Dashboard / Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-orange-50 text-[#FF8A00] border-l-4 border-[#FF8A00] rounded-r-xl shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Deliveries</span>
              </button>

              <button
                onClick={() => setActiveTab('revenue')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'revenue'
                    ? 'bg-orange-50 text-[#FF8A00] border-l-4 border-[#FF8A00] rounded-r-xl shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Revenue</span>
              </button>
            </nav>
          </div>

          {/* Bottom Exit Action */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin Panel</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F8F9FD]">
          {/* Top Header Bar */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-slate-800 capitalize tracking-tight">
                {activeTab === 'products' ? 'Product Catalog' : activeTab === 'orders' ? 'Order Management' : 'Revenue Statistics'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Search input in top bar */}
              <div className="relative hidden sm:block w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition-all"
                />
              </div>

              {/* Header Badges / Avatar */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center relative hover:bg-slate-200 transition-colors cursor-pointer">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-[#FF8A00] text-white text-[9px] font-bold px-1 rounded-full">24</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center relative hover:bg-slate-200 transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full">5</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-[#FF8A00] text-white font-bold flex items-center justify-center text-xs shadow-sm ml-1">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Body Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'products' ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">All Items ({filteredProducts.length})</h3>
                    <p className="text-xs text-slate-500">Manage catalog inventory, pricing, and bundle offers</p>
                  </div>
                  <button 
                    onClick={handleAddNew} 
                    className="px-4 py-2.5 bg-[#FF8A00] hover:bg-[#e07a00] text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                {/* Products Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      layoutId={`card-${product.id}`}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-xs hover:shadow-md ${
                        editingId === product.id ? 'border-[#FF8A00] ring-2 ring-orange-500/10' : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                          {product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/') ? (
                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon /></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-800 text-base truncate pr-3">{product.name}</h4>
                            <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                              TK {product.price.toFixed(2)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 truncate mb-2.5">
                            Category: <span className="font-medium text-slate-700">{product.category}</span> • {product.materials}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              product.inStock 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80' 
                                : 'bg-rose-50 text-rose-600 border border-rose-200/80'
                            }`}>
                              <Package className="w-3 h-3" />
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>

                            {product.offers && product.offers.length > 0 && (
                              <span className="bg-blue-50 text-blue-600 border border-blue-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                                {product.offers.length} Active Offers
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2 pl-2">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-2.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-xl transition-all border border-slate-200/80"
                            title="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200/80"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {orders.length > 0 ? orders.map(order => (
                  <div key={order.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-bold text-slate-800">{order.id}</span>
                          <span className="text-xs text-slate-400 font-medium">{new Date(order.date).toLocaleString()}</span>
                        </div>
                        <div className="font-bold text-slate-800 text-base">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        {order.customerPhone && <div className="text-xs text-slate-500">{order.customerPhone}</div>}
                        {order.customerAddress && <div className="text-xs text-slate-500 max-w-xs">{order.customerAddress}</div>}
                        {order.transactionId && (
                          <div className="font-mono text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-100 mt-1">
                            Trx ID: {order.transactionId}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="space-y-3 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col text-xs">
                              <div className="flex justify-between items-start">
                                <span className="text-slate-800 font-medium">
                                  <span className="text-slate-400 font-bold mr-1">{item.quantity}x</span> {item.productName}
                                </span>
                                <span className="font-mono text-slate-600 font-semibold">
                                  TK {item.originalTotal ? item.originalTotal.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {item.selectedOfferName && (
                                <div className="flex justify-between items-center mt-1 pl-4">
                                  <span className="text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                    {item.selectedOfferName}
                                  </span>
                                  <div className="text-xs font-mono text-right">
                                    {item.savings && item.savings > 0 ? (
                                      <span className="text-emerald-600 font-bold mr-2">SAVE TK {item.savings.toFixed(2)}</span>
                                    ) : null}
                                    <span className="text-slate-800 font-bold">TK {item.finalPaidAmount ? item.finalPaidAmount.toFixed(2) : (item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                              {item.bundleSelections && item.bundleSelections.length > 0 && (
                                <div className="pl-4 mt-1 flex flex-col gap-0.5">
                                  {item.bundleSelections.map((sel, idx2) => (
                                    <span key={idx2} className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                      + {sel}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.freeShipping && (
                                <div className="pl-4 mt-1 text-[10px] text-emerald-600 font-mono font-bold tracking-wider uppercase">
                                  + Free Shipping Included
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200/80 font-mono text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Order Total</span>
                          <span className="text-orange-600 font-bold text-sm">TK {order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                          {getStatusIcon(order.status)} {order.status}
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">No customer orders recorded yet.</p>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'revenue' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                      <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF8A00] flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-slate-800">TK {totalRevenue.toFixed(2)}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ArrowUpRight className="w-3 h-3" /> +14.2%
                        </span>
                        <span className="text-[10px] text-slate-400">vs last month</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Orders</span>
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-slate-800">{totalOrders}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          <CheckCircle2 className="w-3 h-3" /> {orders.length} Total
                        </span>
                        <span className="text-[10px] text-slate-400">orders logged</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-slate-800">TK {averageOrderValue.toFixed(2)}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <Sparkles className="w-3 h-3" /> High Yield
                        </span>
                        <span className="text-[10px] text-slate-400">per transaction</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Items Sold</span>
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-slate-800">{totalItemsSold} <span className="text-xs font-normal text-slate-400">pcs</span></div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          LoomAvenue Caps
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Interactive Smooth Revenue Area Chart */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        Revenue & Performance Statistics
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Client-computed trajectory based on active order records
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Metric toggle pill */}
                      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
                        <button
                          onClick={() => setAnalyticsMetric('revenue')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            analyticsMetric === 'revenue' 
                              ? 'bg-white text-[#FF8A00] shadow-xs' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Revenue (TK)
                        </button>
                        <button
                          onClick={() => setAnalyticsMetric('orders')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            analyticsMetric === 'orders' 
                              ? 'bg-white text-[#FF8A00] shadow-xs' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Orders Count
                        </button>
                      </div>

                      {/* Year Selector */}
                      <div className="relative">
                        <select
                          value={analyticsYear}
                          onChange={(e) => setAnalyticsYear(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-orange-500 shadow-xs cursor-pointer"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Smooth Area Curve */}
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.02}/>
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94A3B8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={5}
                        />
                        <YAxis 
                          stroke="#94A3B8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => analyticsMetric === 'revenue' ? `${val}` : `${val}`}
                        />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const val = payload[0].value as number;
                              return (
                                <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-xs space-y-1">
                                  <div className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label} {analyticsYear}</div>
                                  <div className="text-orange-400 font-mono font-bold text-sm">
                                    {analyticsMetric === 'revenue' ? `TK ${val.toFixed(2)}` : `${val} Orders`}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={analyticsMetric} 
                          stroke={analyticsMetric === 'revenue' ? "#FF8A00" : "#3B82F6"} 
                          strokeWidth={3} 
                          fill={analyticsMetric === 'revenue' ? "url(#colorRevenue)" : "url(#colorOrders)"} 
                          dot={{ r: 4, fill: analyticsMetric === 'revenue' ? '#FF8A00' : '#3B82F6', stroke: '#FFF', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: analyticsMetric === 'revenue' ? '#FF8A00' : '#3B82F6', stroke: '#FFF', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Status Breakdown (Donut Chart) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-800 text-base">Order Status Distribution</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {orders.length} total
                      </span>
                    </div>

                    <div className="relative w-full h-48 flex items-center justify-center my-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {statusDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-medium">
                                    <span style={{ color: data.color }}>●</span> {data.name}: <span className="font-bold">{data.value}</span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Donut Center Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold font-mono text-slate-800">{orders.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Orders</span>
                      </div>
                    </div>

                    {/* Status Legend list */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {statusDistributionData.map((item, idx) => {
                        const pct = orders.length > 0 ? ((item.value / orders.length) * 100).toFixed(0) : '0';
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                              <span className="text-slate-600 font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-800 font-bold">{item.value}</span>
                              <span className="text-[10px] text-slate-400">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Performing Products Ranking & Revenue Share */}
                  <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Top Performing Catalog Items</h3>
                        <p className="text-xs text-slate-500">Revenue and unit distribution across cap designs</p>
                      </div>
                      <span className="text-xs text-[#FF8A00] font-bold bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                        Top {topProducts.length} Items
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {topProducts.length > 0 ? topProducts.map((product, idx) => {
                        const pctOfTotal = totalRevenue > 0 ? Math.min(100, Math.round((product.revenue / totalRevenue) * 100)) : 0;
                        return (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF8A00] font-bold text-xs flex items-center justify-center shrink-0">
                                  #{idx + 1}
                                </span>
                                <span className="font-semibold text-slate-800 text-sm truncate">{product.name}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-slate-800 text-sm">TK {product.revenue.toFixed(2)}</span>
                                <span className="text-xs text-slate-400 ml-2 font-mono">({product.quantity} sold)</span>
                              </div>
                            </div>

                            {/* Revenue Share Bar */}
                            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden flex">
                              <div 
                                className="bg-gradient-to-r from-amber-400 to-[#FF8A00] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${pctOfTotal}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                          No product sales recorded yet. Completed orders will automatically populate graph statistics.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ⚡ Computed instantly from local state • Zero database overhead
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingId && editForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{isAdding ? 'Add New Product' : 'Edit Product Details'}</h3>
                  <p className="text-xs text-slate-500">Configure catalog information and special quantity offers</p>
                </div>
                <button 
                  onClick={() => { setEditingId(null); setEditForm(null); setIsAdding(false); }} 
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                  <input 
                    name="name" 
                    value={editForm.name} 
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (TK)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Image URL</label>
                  <input 
                    name="imageUrl" 
                    value={editForm.imageUrl} 
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Images (One URL per line)</label>
                  <textarea 
                    name="additionalImages" 
                    value={editForm.additionalImages?.join('\n') || ''} 
                    onChange={(e) => {
                      if (!editForm) return;
                      const urls = e.target.value.split('\n');
                      setEditForm({ ...editForm, additionalImages: urls });
                    }}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all resize-none shadow-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs"
                  >
                    <option value="worn-textiles">Loom Avenue Caps</option>
                    <option value="earth-clay">New Era Mastercopy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#FF8A00] focus:ring-2 focus:ring-orange-500/20 transition-all resize-none shadow-xs"
                  />
                </div>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-xs font-bold text-slate-700">Available in Stock</span>
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="inStock" 
                      checked={editForm.inStock} 
                      onChange={handleChange}
                      className="sr-only" 
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${editForm.inStock ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${editForm.inStock ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                  </div>
                </label>

                {/* Offer Management Section */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Bundle & Special Offers</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editForm) return;
                        const newOffer: import('../types').Offer = {
                          id: `off-${Date.now()}`,
                          title: 'NEW OFFER',
                          quantity: 2,
                          freeShipping: false
                        };
                        setEditForm({ ...editForm, offers: [...(editForm.offers || []), newOffer] });
                      }}
                      className="text-xs text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Offer
                    </button>
                  </div>

                  {editForm.offers?.map((offer, idx) => (
                    <div key={offer.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const newOffers = editForm.offers?.filter(o => o.id !== offer.id);
                          setEditForm({ ...editForm, offers: newOffers });
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 bg-white rounded-lg border border-slate-200 transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Offer Title</label>
                          <input
                            value={offer.title}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].title = e.target.value;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Caps Quantity</label>
                          <input
                            type="number"
                            value={offer.quantity}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].quantity = parseInt(e.target.value) || 1;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Discount %</label>
                          <input
                            type="number"
                            value={offer.discountPercentage || ''}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].discountPercentage = e.target.value ? parseFloat(e.target.value) : undefined;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                            placeholder="e.g. 15"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fixed Discount (TK)</label>
                          <input
                            type="number"
                            value={offer.fixedDiscount || ''}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].fixedDiscount = e.target.value ? parseFloat(e.target.value) : undefined;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                            placeholder="e.g. 200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Badge Text</label>
                          <input
                            value={offer.badgeText || ''}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].badgeText = e.target.value;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                            placeholder="e.g. MOST POPULAR 🔥"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Badge Color</label>
                          <input
                            value={offer.badgeColor || ''}
                            onChange={e => {
                              const newOffers = [...(editForm.offers || [])];
                              newOffers[idx].badgeColor = e.target.value;
                              setEditForm({ ...editForm, offers: newOffers });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                            placeholder="e.g. bg-black text-white"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={offer.freeShipping}
                          onChange={e => {
                            const newOffers = [...(editForm.offers || [])];
                            newOffers[idx].freeShipping = e.target.checked;
                            setEditForm({ ...editForm, offers: newOffers });
                          }}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-xs font-semibold text-slate-700">Free Shipping Included</span>
                      </label>
                    </div>
                  ))}
                </div>

              </div>
              
              <button 
                type="button"
                onClick={handleSave}
                className="w-full mt-8 bg-[#FF8A00] hover:bg-[#e07a00] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
