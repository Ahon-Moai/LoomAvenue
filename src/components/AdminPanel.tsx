import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { 
  ArrowLeft, Save, Edit3, Image as ImageIcon, Package, X, ShoppingBag, 
  LayoutGrid, Clock, Truck, CheckCircle2, Lock, BarChart3, TrendingUp, 
  CreditCard, Plus, Trash2, Search, Bell, Mail, LogOut, DollarSign,
  ChevronRight, Sparkles
} from 'lucide-react';
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
                <span className="font-bold text-lg text-slate-800 leading-tight tracking-tight">ShapeRex</span>
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
                {/* Metric Summary Cards (ShapeRex style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-slate-800">TK {totalRevenue.toFixed(2)}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      +12.5% from last month
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Orders</span>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-slate-800">{totalOrders}</div>
                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      Active store orders
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-slate-800">TK {averageOrderValue.toFixed(2)}</div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      Optimized bundle revenue
                    </span>
                  </div>
                </div>

                {/* Top Performing Products */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                  <h3 className="font-bold text-slate-800 text-base mb-4">Top Performing Products</h3>
                  <div className="space-y-3">
                    {topProducts.length > 0 ? topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{product.name}</div>
                            <div className="text-xs text-slate-400">{product.quantity} units sold</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-800 text-sm">TK {product.revenue.toFixed(2)}</div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                        No product sales recorded yet.
                      </div>
                    )}
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
