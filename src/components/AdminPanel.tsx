import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { ArrowLeft, Save, Edit3, Image as ImageIcon, Package, X, ShoppingBag, LayoutGrid, Clock, Truck, CheckCircle2, Lock, BarChart3, TrendingUp, CreditCard, Plus, Trash2 } from 'lucide-react';
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
      if (isAdding) {
        onAddProduct(editForm);
      } else {
        onUpdateProduct(editForm);
      }
      setEditingId(null);
      setEditForm(null);
      setIsAdding(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Processing': return <Package className="w-4 h-4 text-blue-400" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-white/50" />;
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
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-earth-950 flex flex-col items-center justify-center p-6 text-white relative z-50">
        <button onClick={onBack} className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Lock className="w-6 h-6 text-white/50" />
            </div>
            <h1 className="font-serif italic text-3xl">Admin Access</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-2">Authorized Personnel Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input type="email" placeholder="ID (Email)" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" required />
            </div>
            <div>
              <input type="password" placeholder="Passphrase" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" required />
            </div>
            {authError && <div className="text-red-400 text-xs text-center font-mono">{authError}</div>}
            <button type="submit" className="w-full bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-white/90 transition-colors mt-2">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-950 text-white p-6 md:p-12 relative z-50">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight text-white">Loom Control</h1>
              <p className="font-mono text-xs text-white/50 tracking-widest uppercase mt-1">Store Management</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Catalog
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'revenue' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <BarChart3 className="w-4 h-4" /> Revenue
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
               <button onClick={handleAddNew} className="px-4 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-lg flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Product
               </button>
            </div>
            {/* Main List */}
            {products.map(product => (
              <motion.div
                key={product.id}
                layoutId={`card-${product.id}`}
                className={`p-5 rounded-2xl border transition-all ${editingId === product.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/') ? (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif text-lg text-white truncate pr-4">{product.name}</h3>
                      <span className="font-mono text-sm text-[#e8dcc4]">TK {product.price.toFixed(2)}</span>
                    </div>
                    <p className="font-sans text-xs text-white/50 truncate mb-3">{product.category} • {product.materials}</p>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${product.inStock ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <Package className="w-3 h-3" />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                    >
                      <Edit3 className="w-4 h-4 text-white/70" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : activeTab === 'orders' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {orders.map(order => (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-white font-bold">{order.id}</span>
                      <span className="font-mono text-xs text-white/50">{new Date(order.date).toLocaleString()}</span>
                    </div>
                    <div className="font-serif text-lg text-white/90">{order.customerName}</div>
                    <div className="font-sans text-xs text-white/50">{order.customerEmail}</div>
                  </div>
                  
                  <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center font-sans text-sm">
                          <span className="text-white/80"><span className="text-white/40 mr-2">{item.quantity}x</span> {item.productName}</span>
                          <span className="font-mono text-white/70">TK {item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/10 font-mono text-sm">
                      <span className="text-white/50 uppercase tracking-widest">Total</span>
                      <span className="text-[#e8dcc4]">TK {order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-white/80">
                      {getStatusIcon(order.status)} {order.status}
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeTab === 'revenue' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4 text-white/50">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase tracking-widest">Total Revenue</span>
                </div>
                <div className="font-serif italic text-4xl text-white">TK {totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4 text-white/50">
                  <Package className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase tracking-widest">Completed Orders</span>
                </div>
                <div className="font-serif italic text-4xl text-white">{totalOrders}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4 text-white/50">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase tracking-widest">Average Value</span>
                </div>
                <div className="font-serif italic text-4xl text-white">TK {averageOrderValue.toFixed(2)}</div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-serif italic text-2xl text-white mb-6">Top Performing Pieces</h2>
              <div className="space-y-4">
                {topProducts.length > 0 ? topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-mono text-xs text-white/50">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-serif text-lg text-white/90">{product.name}</div>
                        <div className="font-sans text-xs text-white/50">{product.quantity} units sold</div>
                      </div>
                    </div>
                    <div className="font-mono text-[#e8dcc4]">TK {product.revenue.toFixed(2)}</div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-white/50 font-mono text-xs uppercase tracking-widest">
                    No sales data available
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingId && editForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-xl bg-[#0a0f0d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif italic text-3xl text-white tracking-tight">{isAdding ? 'Add New Product' : 'Edit Item'}</h2>
                <button 
                  onClick={() => { setEditingId(null); setEditForm(null); setIsAdding(false); }} 
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                  <input 
                    name="name" 
                    value={editForm.name} 
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors shadow-inner"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 ml-1">Price (TK)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono shadow-inner"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 ml-1">Image URL</label>
                  <input 
                    name="imageUrl" 
                    value={editForm.imageUrl} 
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors shadow-inner"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors shadow-inner"
                  >
                    <option value="worn-textiles">Loom Avenue Caps</option>
                    <option value="earth-clay">New Era Mastercopy</option>
                    <option value="carry-core">Bundles</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea 
                    name="description" 
                    value={editForm.description} 
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none shadow-inner"
                  />
                </div>
                
                <label className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group">
                  <span className="font-mono text-xs text-white/80 uppercase tracking-wider group-hover:text-white transition-colors">Available in Stock</span>
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="inStock" 
                      checked={editForm.inStock} 
                      onChange={handleChange}
                      className="sr-only" 
                    />
                    <div className={`w-12 h-7 rounded-full transition-colors ${editForm.inStock ? 'bg-green-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition-transform ${editForm.inStock ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
                  </div>
                </label>
              </div>
              
              <button 
                onClick={handleSave}
                className="w-full mt-10 bg-white text-black font-mono text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
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
