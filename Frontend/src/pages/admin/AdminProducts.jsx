import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { deleteProduct, getProducts } from '@/services/productService';
import { formatCurrency } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: getProducts,
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const products = productsData?.products || [];

  // Filter products by search query
  const filteredProducts = products.filter((product) =>
    (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <div className="p-10 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-[900] text-gray-900 tracking-tight uppercase italic">Inventory</h1>
          <div className="flex items-center gap-2 mt-1">
            <Package className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{filteredProducts.length} Live Items</p>
          </div>
        </div>
        <Link to="/products/new">
          <Button className="font-black uppercase text-xs tracking-widest py-3 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter by product name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No entries found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F9FB] border-b border-gray-100">
                <tr>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Product Detail
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Pricing
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Inventory
                  </th>
                  <th className="text-left px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-right px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Management
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{product.unit || 'Standard Unit'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-widest py-1.5 px-3 bg-gray-100 rounded-lg">{product.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-gray-900 text-lg tabular-nums tracking-tight">{formatCurrency(product.price)}</p>
                        {product.OldPrice && product.OldPrice > product.price && (
                          <p className="text-[10px] text-gray-400 line-through font-bold">{formatCurrency(product.OldPrice)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`text-sm font-black tabular-nums ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock || 0}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Units Left</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="success" size="sm" className="font-black uppercase text-[10px] tracking-widest">Active</Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="p-2.5 bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 stroke-[2.5px]" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2.5 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                          disabled={deleteProductMutation.isPending}
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

export default AdminProducts;
