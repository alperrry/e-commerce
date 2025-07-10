import React, { useState, useEffect } from 'react';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiGrid = Icons.FiGrid as any;
const FiPlus = Icons.FiPlus as any;
const FiEdit = Icons.FiEdit as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiSearch = Icons.FiSearch as any;
const FiX = Icons.FiX as any;
const FiSave = Icons.FiSave as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiChevronRight = Icons.FiChevronRight as any;

interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories?: Category[];
  products?: any[];
}

interface CategoryFormData {
  name: string;
  description: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentCategoryId: null,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Tüm kategorileri getir (aktif + pasif) - backend'e eklenince kullanılacak
      try {
        const response = await api.get<Category[]>('/categories/admin/all');
        console.log('Admin API Response:', response.data);
        setCategories(response.data);
      } catch (adminError) {
        // Admin endpoint yoksa normal endpoint'i kullan
        const response = await api.get<Category[]>('/categories');
        console.log('Fallback API Response:', response.data);
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.response?.data?.message || 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCategories(true);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parentCategoryId: category.parentCategoryId || null,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parentCategoryId: null,
        isActive: true,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategoryId: null,
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Kategori adı en az 2 karakter olmalıdır';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Açıklama 500 karakterden fazla olamaz';
    }

    // Check if parent category selection creates a circular reference
    if (formData.parentCategoryId && editingCategory) {
      const isCircular = checkCircularReference(editingCategory.id, formData.parentCategoryId);
      if (isCircular) {
        errors.parentCategoryId = 'Döngüsel referans oluşturulamaz';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkCircularReference = (categoryId: number, parentId: number): boolean => {
    if (categoryId === parentId) return true;
    
    const findParentChain = (id: number): boolean => {
      const category = categories.find(c => c.id === id);
      if (!category) return false;
      if (category.parentCategoryId === categoryId) return true;
      if (category.parentCategoryId != null) { // null ve undefined kontrolü
        return findParentChain(category.parentCategoryId);
      }
      return false;
    };

    return findParentChain(parentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      if (editingCategory) {
        // Update existing category
        console.log('Updating category with data:', { ...categoryData, id: editingCategory.id }); // Debug
        
        const response = await api.put(`/categories/${editingCategory.id}`, {
          ...categoryData,
          id: editingCategory.id,
        });
        
        console.log('Update response:', response); // Debug
        
        // Local state'i de güncelle
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory.id 
              ? { ...cat, ...categoryData, id: editingCategory.id, updatedAt: new Date().toISOString() }
              : cat
          )
        );
        
      } else {
        // Create new category
        const response = await api.post('/categories', categoryData);
        setCategories(prevCategories => [...prevCategories, response.data]);
      }

      closeModal();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Kategori kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`"${category.name}" kategorisini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      // Hard delete - kaydı tamamen sil
      await api.delete(`/categories/${category.id}`);
      
      // Local state'ten de kaldır
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== category.id)
      );
      
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.response?.data?.message || 'Kategori silinirken hata oluştu');
    }
  };

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter(category => {
    // Arama filtresi
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Durum filtresi - TAM OLARAK SİZİN İSTEDİĞİNİZ GİBİ
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.isActive === true) ||    // isActive true ise "Aktif"
      (statusFilter === 'inactive' && category.isActive === false);   // isActive false ise "Pasif"
    
    return matchesSearch && matchesStatus;
  });

  const getParentCategoryName = (parentId: number | null | undefined): string => {
    if (!parentId) return 'Ana Kategori';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Bilinmeyen';
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ marginLeft: level * 20 }}>
              {hasSubCategories && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
              )}
              <div className="flex items-center">
                <FiGrid className="text-purple-600 mr-3" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {getParentCategoryName(category.parentCategoryId)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {category.products?.length || 0} ürün
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(category.createdAt).toLocaleDateString('tr-TR')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2">
              <button
                onClick={() => openModal(category)}
                className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                title="Düzenle"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                title="Kalıcı Sil"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        
        {hasSubCategories && isExpanded && category.subCategories!.map(subCategory => 
          renderCategoryRow(subCategory, level + 1)
        )}
      </React.Fragment>
    );
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
        <h1 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h1>
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
            Yeni Kategori
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pasif
              </button>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">{categories.length}</div>
              <div>Toplam</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {categories.filter(c => c.isActive).length}
              </div>
              <div>Aktif</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-red-600">
                {categories.filter(c => !c.isActive).length}
              </div>
              <div>Pasif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiGrid className="mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">Kategori bulunamadı</h3>
            <p>
              {searchQuery 
                ? 'Arama kriterlerinize uygun kategori bulunamadı.' 
                : 'Henüz kategori bulunmuyor. İlk kategorinizi ekleyin.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üst Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map(category => renderCategoryRow(category))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori adını girin"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Üst Kategori
                </label>
                <select
                  value={formData.parentCategoryId || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    parentCategoryId: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.parentCategoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Ana Kategori</option>
                  {categories
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
                {formErrors.parentCategoryId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.parentCategoryId}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Aktif kategori
                </label>
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
                  {saving ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;