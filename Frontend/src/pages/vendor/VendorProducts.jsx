import {
  getMyProducts, getMyProductById, createMyProduct, updateMyProduct, deleteMyProduct,
} from '@/services/storeService';
import { CATEGORIES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit2, Loader2, Package,
  Plus, Search, Sparkles, Trash2, UploadCloud, X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

// â”€â”€ Product Form (exact AdminProductForm design, inline not routed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ProductForm = ({ productId, onBack }) => {
  const qc = useQueryClient();
  const isEditing = !!productId;

  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const [imageError, setImageError]     = useState('');
  const [aiLoading, setAiLoading]       = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', description: '', category: '',
    OldPrice: '', price: '', stock: 0,
  });
  const [errors, setErrors] = useState({});

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['vendor-product', productId],
    queryFn:  () => getMyProductById(productId),
    enabled:  isEditing,
  });

  useEffect(() => {
    const p = existing?.data ?? existing?.product;
    if (p) {
      setForm({
        name: p.name || '', description: p.description || '',
        category: p.category || '', OldPrice: p.OldPrice ?? '',
        price: p.price ?? '', stock: p.stock ?? 0,
      });
      setImagePreview(p.imageUrl || '');
    }
  }, [existing]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.category) e.category = 'Category is required';
    if (form.OldPrice === '' || Number(form.OldPrice) < 0) e.OldPrice = 'Required, must be >= 0';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Required, must be >= 0';
    if (Number(form.price) > Number(form.OldPrice)) e.price = 'Sale price cannot exceed old price';
    if (form.stock < 0) e.stock = 'Must be >= 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setImageError('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setImageError('Image must be smaller than 5 MB'); return; }
    setImageError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(isEditing ? (existing?.data?.imageUrl || '') : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateDescription = async () => {
    if (!form.name || !form.category) { toast.error('Fill in Name and Category first'); return; }
    setAiLoading(true);
    try {
      // Call the backend AI endpoint
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, category: form.category, price: form.price }),
      });
      const data = await res.json();
      if (data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
        toast.success('Description generated!');
      }
    } catch {
      toast.error('AI generation failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (fd) => isEditing ? updateMyProduct(productId, fd) : createMyProduct(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      onBack();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!imageFile && !imagePreview) { setImageError('Product image is required'); return; }
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description || '');
    fd.append('category', form.category);
    fd.append('OldPrice', form.OldPrice);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    if (imageFile) fd.append('image', imageFile);
    else if (isEditing && imagePreview) fd.append('imageUrl', imagePreview);
    mutation.mutate(fd);
  };

  if (isEditing && loadingExisting) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </button>

      <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic mb-8">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
            <input
              value={form.name} onChange={set('name')}
              placeholder="e.g., Puja Samagri Set"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description + AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Description</label>
              <button
                type="button" onClick={handleGenerateDescription} disabled={aiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>}
              </button>
            </div>
            <textarea
              value={form.description} onChange={set('description')} rows={3}
              placeholder="Product description... or click ✨ Generate with AI"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select
              value={form.category} onChange={set('category')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Old Price / MRP (₹) *</label>
              <input
                type="number" step="0.01" min="0"
                value={form.OldPrice} onChange={set('OldPrice')} placeholder="120.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
              />
              {errors.OldPrice && <p className="mt-1 text-xs text-red-600">{errors.OldPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sale Price (₹) *</label>
              <input
                type="number" step="0.01" min="0"
                value={form.price} onChange={set('price')} placeholder="99.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity *</label>
            <input
              type="number" step="1" min="0"
              value={form.stock} onChange={set('stock')} placeholder="e.g., 100"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>

          {/* Image Upload (exact AdminProductForm drag-and-drop) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Product Image *</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-xl border border-gray-200 shadow-sm" />
                <button
                  type="button" onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  {imageFile ? imageFile.name : 'Current image'} &nbsp;·&nbsp;
                  <button type="button" className="text-amber-500 underline" onClick={() => fileInputRef.current?.click()}>
                    Change
                  </button>
                </p>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition
                  ${dragOver ? 'border-amber-400 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50'}`}
              >
                <UploadCloud className={`w-8 h-8 ${dragOver ? 'text-amber-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-amber-500">Click to upload</span> or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400">JPG, PNG, WebP · max 5 MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])} />
            {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="submit" disabled={mutation.isPending}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button" onClick={onBack}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// â”€â”€ Main Products Page (exact AdminProducts design) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Products = () => {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId]     = useState(null);  // productId being edited
  const [showForm, setShowForm]       = useState(false); // true = show ProductForm inline

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn:  () => getMyProducts({ limit: 100 }),
  });

  const products         = data?.data ?? data?.products ?? [];
  const filteredProducts = products.filter((p) =>
    !searchQuery ||
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: deleteMyProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product deleted.'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) deleteMutation.mutate(id);
  };

  // Show form view
  if (showForm) {
    return (
      <ProductForm
        productId={editingId}
        onBack={() => { setShowForm(false); setEditingId(null); }}
      />
    );
  }

  return (
    <div className="p-10 bg-gray-50/30 min-h-screen">

      {/* â”€â”€ Header (same as AdminProducts) â”€â”€ */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">Inventory</h1>
          <div className="flex items-center gap-2 mt-1">
            <Package className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{filteredProducts.length} Live Items</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3px]" /> New Entry
        </button>
      </div>

      {/* â”€â”€ Search Bar (same as AdminProducts) â”€â”€ */}
      <div className="mb-10">
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter by product name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium text-sm"
          />
        </div>
      </div>

      {/* â”€â”€ Products Table (same as AdminProducts) â”€â”€ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-amber-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              {products.length === 0 ? 'No entries found — add your first product' : 'No entries found matching criteria'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => { setEditingId(null); setShowForm(true); }}
                className="mt-4 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F9FB] border-b border-gray-100">
                <tr>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product Detail</th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Inventory</th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {product.imageUrl
                            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300">ðŸ“¦</div>}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                            {product.unit || 'Standard Unit'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-widest py-1.5 px-3 bg-gray-100 rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-900 text-lg tabular-nums tracking-tight">{formatCurrency(product.price)}</p>
                      {product.OldPrice && product.OldPrice > product.price && (
                        <p className="text-[10px] text-gray-400 line-through font-bold">{formatCurrency(product.OldPrice)}</p>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black tabular-nums ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock || 0}
                      </span>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units Left</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-green-100 text-green-700 border-green-200 uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingId(product._id); setShowForm(true); }}
                          className="p-2.5 bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 stroke-[2.5px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2.5 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                          disabled={deleteMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
