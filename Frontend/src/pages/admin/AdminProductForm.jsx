import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createProduct, getProductById, updateProduct } from '@/services/productService';
import { CATEGORIES } from '@/utils/constants';
import { generateProductDescription } from '@/services/aiService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UploadCloud, X, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  OldPrice: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  price: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  stock: z.number({ invalid_type_error: 'Required' }).int('Must be a whole number').min(0, 'Must be ≥ 0'),
}).refine(d => d.price <= d.OldPrice, {
  path: ['price'],
  message: 'Sale price cannot be greater than old price',
});

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // File upload state
  const [imageFile, setImageFile] = useState(null);          // File object
  const [imagePreview, setImagePreview] = useState('');       // Data URL or remote URL
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  // AI description state
  const [aiLoading, setAiLoading] = useState(false);

  const categories = CATEGORIES;

  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: isEditing,
  });

  const product = productData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      OldPrice: 0,
      price: 0,
      stock: 0,
    },
  });

  // AI Description Generator
  const handleGenerateDescription = async () => {
    const { name, category, price } = getValues();
    if (!name || !category) {
      toast.error('Please fill in Product Name and Category first');
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateProductDescription({ name, category, price });
      setValue('description', result.description, { shouldDirty: true });
      toast.success('Description generated!');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.error('AI rate limit reached. Please wait a moment and try again.');
      } else {
        toast.error('AI generation failed. Please try again.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        OldPrice: product.OldPrice || 0,
        price: product.price || 0,
        stock: product.stock ?? 0,
      });
      setImagePreview(product.imageUrl || '');
    }
  }, [product, reset]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be smaller than 5 MB');
      return;
    }
    setImageError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(isEditing ? (product?.imageUrl || '') : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mutation = useMutation({
    mutationFn: (formData) =>
      isEditing ? updateProduct(id, formData) : createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['product', id]);
      toast.success(isEditing ? 'Product updated!' : 'Product created!');
      navigate('/products');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save product');
    },
  });

  const onSubmit = (data) => {
    // Require an image for new products; editing can keep the existing one
    if (!imageFile && !imagePreview) {
      setImageError('Product image is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('category', data.category);
    formData.append('OldPrice', data.OldPrice);
    formData.append('price', data.price);
    formData.append('stock', data.stock);

    if (imageFile) {
      // New file picked — send for upload
      formData.append('image', imageFile);
    } else if (isEditing && imagePreview) {
      // No new file, keep the existing URL
      formData.append('imageUrl', imagePreview);
    }

    mutation.mutate(formData);
  };

  if (isEditing && loadingProduct) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

          {/* Product Name */}
          <Input
            label="Product Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Fresh Milk"
          />

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                id="ai-generate-description"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>
                }
              </button>
            </div>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Product description... or click ✨ Generate with AI"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Old Price & Sale Price */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Old Price / MRP (₹) *"
              type="number"
              step="0.01"
              {...register('OldPrice', { valueAsNumber: true })}
              error={errors.OldPrice?.message}
              placeholder="120.00"
            />
            <Input
              label="Sale Price (₹) *"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
              placeholder="99.00"
            />
          </div>

          {/* Stock */}
          <Input
            label="Stock Quantity *"
            type="number"
            step="1"
            min="0"
            {...register('stock', { valueAsNumber: true })}
            error={errors.stock?.message}
            placeholder="e.g., 100"
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
            </label>

            {imagePreview ? (
              /* Preview with remove button */
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-40 h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  {imageFile ? imageFile.name : 'Current image'} &nbsp;·&nbsp;
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </button>
                </p>
              </div>
            ) : (
              /* Drag & drop zone */
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition
                  ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5'}`}
              >
                <UploadCloud className={`w-8 h-8 ${dragOver ? 'text-primary' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-primary">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-gray-400">JPG, PNG, WebP · max 5 MB</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {imageError && (
              <p className="mt-1 text-sm text-red-600">{imageError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button type="submit" loading={mutation.isPending} className="flex-1">
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
