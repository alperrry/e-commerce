import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';
import { Product, ProductImage, Category, PaginatedResponse } from '../../types';

const FiPackage = Icons.FiPackage as any;
const FiPlus = Icons.FiPlus as any;
const FiEdit = Icons.FiEdit as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiSearch = Icons.FiSearch as any;
const FiX = Icons.FiX as any;
const FiSave = Icons.FiSave as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiImage = Icons.FiImage as any;
const FiStar = Icons.FiStar as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiEye = Icons.FiEye as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiUpload = Icons.FiUpload as any;
const FiCheck = Icons.FiCheck as any;

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  brand: string;
  categoryId: number;
  isFeatured: boolean;
  isActive: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured' | 'low-stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Image Modal States - Eksik olan state'ler eklendi
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [newImageAlt, setNewImageAlt] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    stockQuantity: 0,
    sku: '',
    brand: '',
    categoryId: 0,
    isFeatured: false,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchQuery, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories/admin/all');
      setCategories(response.data);
    } catch (error) {
      // Fallback to regular endpoint
      try {
        const response = await api.get<Category[]>('/categories');
        setCategories(response.data);
      } catch (fallbackError) {
        console.error('Error fetching categories:', error);
      }
    }
  };

  const fetchProducts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('categoryId', categoryFilter.toString());

      const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
      
      let filteredProducts = response.data.products;

      // Apply status filter on frontend (since API might not support all filters)
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          switch (statusFilter) {
            case 'active':
              return product.isActive;
            case 'inactive':
              return !product.isActive;
            case 'featured':
              return product.isFeatured;
            case 'low-stock':
              return product.stockQuantity <= 10;
            default:
              return true;
          }
        });
      }

      setProducts(filteredProducts);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      
      // **YENİ: Debug için ekle**
      console.log('🔍 Fetched products:', filteredProducts.map(p => ({
        id: p.id,
        name: p.name,
        imageCount: p.images?.length || 0,
        images: p.images?.map(img => ({
          id: img.id,
          url: img.imageUrl,
          isMain: img.isMainImage
        }))
      })));
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        brand: product.brand,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: undefined,
        stockQuantity: 0,
        sku: '',
        brand: '',
        categoryId: categories[0]?.id || 0,
        isFeatured: false,
        isActive: true,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      stockQuantity: 0,
      sku: '',
      brand: '',
      categoryId: 0,
      isFeatured: false,
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Ürün adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Ürün adı en az 2 karakter olmalıdır';
    }

    if (!formData.description.trim()) {
      errors.description = 'Ürün açıklaması gereklidir';
    }

    if (formData.price <= 0) {
      errors.price = 'Fiyat 0\'dan büyük olmalıdır';
    }

    if (formData.discountPrice && formData.discountPrice >= formData.price) {
      errors.discountPrice = 'İndirimli fiyat normal fiyattan küçük olmalıdır';
    }

    if (formData.stockQuantity < 0) {
      errors.stockQuantity = 'Stok miktarı negatif olamaz';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU gereklidir';
    }

    if (!formData.brand.trim()) {
      errors.brand = 'Marka gereklidir';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Kategori seçimi gereklidir';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        brand: formData.brand.trim(),
      };

      if (editingProduct) {
        // Update existing product
        await api.put(`/products/${editingProduct.id}`, {
          ...productData,
          id: editingProduct.id,
        });
      } else {
        // Create new product
        await api.post('/products', productData);
      }

      await fetchProducts();
      closeModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Ürün kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`"${product.name}" ürününü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Ürün silinirken hata oluştu');
    }
  };

  // Image Management Functions
  const openImageModal = (product: Product) => {
    setImageProduct(product);
    setNewImageAlt('');
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageProduct(null);
    setNewImageAlt('');
    setIsImageModalOpen(false);
    setDragActive(false);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!imageProduct || files.length === 0) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      
      // Dosya tipini ve boyutunu kontrol et
      const validFiles = Array.from(files).filter(file => {
        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
          console.warn(`Geçersiz dosya tipi: ${file.name}`);
          return false;
        }
        
        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Dosya çok büyük: ${file.name}`);
          setError(`${file.name} dosyası çok büyük. Maksimum 5MB olmalıdır.`);
          return false;
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        setError('Geçerli resim dosyası seçilmedi.');
        setUploadingFile(false);
        return;
      }

      // Geçerli dosyaları FormData'ya ekle
      validFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('productId', imageProduct.id.toString());
      if (newImageAlt.trim()) {
        formData.append('altText', newImageAlt.trim());
      }

      console.log('Dosyalar yükleniyor:', validFiles.map(f => f.name));

      // Upload endpoint'ini kullan
      const response = await api.post(`/products/${imageProduct.id}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload başarılı:', response.data);

      // Refresh products to get updated images
      await fetchProducts();
      
      // **YENİ: imageProduct state'ini güncelle**
      if (imageProduct) {
        // Güncel ürün bilgisini bul ve imageProduct'ı güncelle
        const updatedProducts = await api.get<PaginatedResponse<Product>>(`/products?page=${currentPage}&pageSize=${pageSize}`);
        const updatedProduct = updatedProducts.data.products.find(p => p.id === imageProduct.id);
        if (updatedProduct) {
          setImageProduct(updatedProduct);
          console.log('🔄 ImageProduct güncellendi:', {
            id: updatedProduct.id,
            imageCount: updatedProduct.images?.length || 0,
            images: updatedProduct.images
          });
        }
      }
      
      // Reset alt text
      setNewImageAlt('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error uploading images:', error);
      
      // Daha detaylı hata mesajları
      if (error.response?.status === 413) {
        setError('Dosya çok büyük. Maksimum 5MB dosya yükleyebilirsiniz.');
      } else if (error.response?.status === 415) {
        setError('Desteklenmeyen dosya formatı. Sadece JPG, PNG, WebP dosyaları yükleyebilirsiniz.');
      } else if (error.response?.status === 404) {
        setError('Resim yükleme endpoint\'i bulunamadı. Backend API\'sini kontrol edin.');
      } else {
        setError(error.response?.data?.message || 'Resim yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        handleFileUpload(imageFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      console.log('Selected files:', Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })));
      handleFileUpload(e.target.files);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // Eğer ImagesController kullanıyorsanız:
      await api.delete(`/images/${imageId}`);
      
      // Eğer ProductsController kullanıyorsanız:
      // await api.delete(`/products/images/${imageId}`);
      
      await fetchProducts();
      
      // **YENİ: imageProduct state'ini güncelle**
      if (imageProduct) {
        const updatedProducts = await api.get<PaginatedResponse<Product>>(`/products?page=${currentPage}&pageSize=${pageSize}`);
        const updatedProduct = updatedProducts.data.products.find(p => p.id === imageProduct.id);
        if (updatedProduct) {
          setImageProduct(updatedProduct);
        }
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setError(error.response?.data?.message || 'Resim silinirken hata oluştu');
    }
  };

  const handleSetMainImage = async (productId: number, imageId: number) => {
    try {
      // Eğer ImagesController kullanıyorsanız:
      await api.put(`/images/${imageId}/main`);
      
      // Eğer ProductsController kullanıyorsanız:
      // await api.put(`/products/images/${imageId}/main`);
      
      await fetchProducts();
      
      // **YENİ: imageProduct state'ini güncelle**
      if (imageProduct) {
        const updatedProducts = await api.get<PaginatedResponse<Product>>(`/products?page=${currentPage}&pageSize=${pageSize}`);
        const updatedProduct = updatedProducts.data.products.find(p => p.id === imageProduct.id);
        if (updatedProduct) {
          setImageProduct(updatedProduct);
        }
      }
    } catch (error: any) {
      console.error('Error setting main image:', error);
      setError(error.response?.data?.message || 'Ana resim ayarlanırken hata oluştu');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'bg-red-100 text-red-800', text: 'Stokta Yok' };
    } else if (quantity <= 10) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Düşük Stok' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'Stokta' };
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Bilinmeyen';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Güncelleniyor...' : 'Yenile'}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <FiPlus />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter || ''}
              onChange={(e) => {
                setCategoryFilter(e.target.value ? parseInt(e.target.value) : null);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
                { value: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700' },
                { value: 'inactive', label: 'Pasif', color: 'bg-red-100 text-red-700' },
                { value: 'featured', label: 'Öne Çıkan', color: 'bg-yellow-100 text-yellow-700' },
                { value: 'low-stock', label: 'Düşük Stok', color: 'bg-orange-100 text-orange-700' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    statusFilter === filter.value
                      ? 'bg-purple-600 text-white'
                      : `${filter.color} hover:bg-gray-200`
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">{totalItems}</div>
              <div>Toplam Ürün</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {products.filter(p => p.isActive).length}
              </div>
              <div>Aktif</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-yellow-600">
                {products.filter(p => p.isFeatured).length}
              </div>
              <div>Öne Çıkan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiPackage className="mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Ürün bulunamadı</h3>
            <p>
              {searchQuery || categoryFilter || statusFilter !== 'all'
                ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
                : 'Henüz ürün bulunmuyor. İlk ürününüzü ekleyin.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stockQuantity);
                    const mainImage = product.images?.find(img => img.isMainImage)?.imageUrl;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                              {mainImage ? (
                                <img 
                                  src={`http://localhost:5288${mainImage}`} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FiImage className="text-gray-400" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.isFeatured && (
                                  <FiStar className="ml-2 text-yellow-500" size={16} />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getCategoryName(product.categoryId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                          {product.discountPrice && (
                            <div className="text-sm text-green-600">
                              İndirimli: {formatCurrency(product.discountPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                            {product.stockQuantity} - {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                            {product.isFeatured && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Öne Çıkan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openImageModal(product)}
                              className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                              title="Resim Yönetimi"
                            >
                              <FiImage size={16} />
                            </button>
                            <button
                              onClick={() => openModal(product)}
                              className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                              title="Düzenle"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                              title="Kalıcı Sil"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ürün adını girin"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ürün açıklaması"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirimli Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      discountPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.discountPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="İsteğe bağlı"
                  />
                  {formErrors.discountPrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.discountPrice}</p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Miktarı *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {formErrors.stockQuantity && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.stockQuantity}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ürün kodu"
                  />
                  {formErrors.sku && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.brand ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Marka adı"
                  />
                  {formErrors.brand && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.brand}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Aktif ürün
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Öne çıkan ürün
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave />
                  )}
                  {saving ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {isImageModalOpen && imageProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {imageProduct.name} - Resim Yönetimi
              </h3>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Current Images */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4">Mevcut Resimler</h4>
                
                {imageProduct.images && imageProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageProduct.images.map((image) => {
                      // DEBUG: Console'a yaz
                      console.log('🖼️ Rendering image:', image);
                      console.log('🖼️ Image URL:', image.imageUrl);
                      console.log('🖼️ Full URL:', `http://localhost:5288${image.imageUrl}`);
                      
                      return (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={`http://localhost:5288${image.imageUrl}`}
                              alt={image.altText}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Image Actions */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!image.isMainImage && (
                              <button
                                onClick={() => handleSetMainImage(imageProduct.id, image.id)}
                                className="bg-green-600 text-white p-1 rounded-full text-xs hover:bg-green-700"
                                title="Ana resim yap"
                              >
                                <FiStar size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
                              title="Sil"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>

                          {/* Main Image Badge */}
                          {image.isMainImage && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <FiStar size={10} />
                                Ana Resim
                              </span>
                            </div>
                          )}

                          {/* Image Info */}
                          <div className="mt-2 text-xs text-gray-600">
                            <p className="truncate">{image.altText}</p>
                            <p>Sıra: {image.displayOrder}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiImage size={48} className="mx-auto mb-2" />
                    <p>Henüz resim yüklenmemiş</p>
                  </div>
                )}
              </div>

                              {/* Add New Images */}
              <div className="space-y-6 border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-4">Yeni Resim Ekle</h4>

                {/* Alt Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resim Açıklaması (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`${imageProduct.name} resmi`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Boş bırakılırsa ürün adı kullanılacak
                  </p>
                </div>

                {/* File Upload Area */}
                <div>
                  {/* Drag & Drop Area */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400'
                    } ${uploadingFile ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <FiUpload className="mx-auto mb-4 text-gray-400" size={64} />
                    <p className="text-xl font-medium text-gray-700 mb-2">
                      Resim dosyalarını buraya sürükleyin
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      veya bilgisayarınızdan seçmek için aşağıdaki butonu kullanın
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 mx-auto text-lg"
                    >
                      {uploadingFile ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <FiUpload size={20} />
                          Resim Dosyalarını Seç
                        </>
                      )}
                    </button>
                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                      <p><strong>Desteklenen formatlar:</strong> JPG, PNG, WebP</p>
                      <p><strong>Maksimum dosya boyutu:</strong> 5MB per dosya</p>
                      <p><strong>Çoklu seçim:</strong> Birden fazla resim birden seçebilirsiniz</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;