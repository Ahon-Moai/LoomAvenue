import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ArrowLeft, Save, Edit3, Image as ImageIcon, Package, X } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  onBack: () => void;
}

export default function AdminPanel({ products, onUpdateProduct, onBack }: AdminPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateProduct(editForm);
      setEditingId(null);
      setEditForm(null);
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

  return (
    <div className="min-h-screen bg-earth-950 text-white p-6 md:p-12 relative z-50">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight text-white">Loom Control</h1>
              <p className="font-mono text-xs text-white/50 tracking-widest uppercase mt-1">Catalog Management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
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
                      <span className="font-mono text-sm text-[#e8dcc4]">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="font-sans text-xs text-white/50 truncate mb-3">{product.category} • {product.materials}</p>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${product.inStock ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        <Package className="w-3 h-3" />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                    >
                      <Edit3 className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {editingId && editForm ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif italic text-2xl text-white">Edit Item</h2>
                    <button onClick={() => { setEditingId(null); setEditForm(null); }} className="p-2 hover:bg-white/10 rounded-full transition-all">
                      <X className="w-4 h-4 text-white/50 hover:text-white" />
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Product Name</label>
                      <input 
                        name="name" 
                        value={editForm.name} 
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Price (USD)</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={editForm.price} 
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Image URL</label>
                      <input 
                        name="imageUrl" 
                        value={editForm.imageUrl} 
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea 
                        name="description" 
                        value={editForm.description} 
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                      />
                    </div>
                    
                    <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          name="inStock" 
                          checked={editForm.inStock} 
                          onChange={handleChange}
                          className="sr-only" 
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${editForm.inStock ? 'bg-green-500' : 'bg-white/20'}`}></div>
                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${editForm.inStock ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="font-mono text-xs text-white/80 uppercase tracking-wider">Available in Stock</span>
                    </label>
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    className="w-full mt-8 bg-white text-black font-mono text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-white/30">
                  <Edit3 className="w-8 h-8 mb-4 opacity-50" />
                  <p className="font-mono text-xs uppercase tracking-widest">Select item to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
