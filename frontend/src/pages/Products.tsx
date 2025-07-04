import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { AppDispatch, RootState } from '../store';
import { fetchProducts, setFilters } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';

const FiFilter = Icons.FiFilter as any;
const FiX = Icons.FiX as any;
const FiChevronDown = Icons.FiChevronDown as any;

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const { products, pagination, filters, isLoading } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');

  // Initialize filters from URL params
  useEffect(() => {
    const categoryId = searchParams.get('categoryId') || searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sale = searchParams.get('sale');

    if (categoryId) setSelectedCategory(categoryId);
    if (search) {
      dispatch(setFilters({ search }));
    }
    if (featured === 'true') {
      dispatch(setFilters({ featured: true }));
    }
    if (sale === 'true') {
      dispatch(setFilters({ sale: true }));
    }
  }, [searchParams, dispatch]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const newFilters = {
      ...filters,
      page: parseInt(searchParams.get('page') || '1'),
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy as any,
    };

    dispatch(setFilters(newFilters));
    dispatch(fetchProducts(newFilters));
  }, [selectedCategory, minPrice, maxPrice, sortBy, searchParams, dispatch]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set('categoryId', categoryId);
    } else {
      newParams.delete('categoryId');
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sort);
    setSearchParams(newParams);
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtreler</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Temizle
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Kategoriler</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Tüm Kategoriler</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id.toString()}
                      checked={selectedCategory === category.id.toString()}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Fiyat Aralığı</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handlePriceFilter}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Fiyat Filtrele
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-full shadow-lg z-10"
        >
          <FiFilter size={24} />
        </button>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filtreler</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Same filters as desktop */}
                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Kategoriler</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category-mobile"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Tüm Kategoriler</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category-mobile"
                          value={category.id.toString()}
                          checked={selectedCategory === category.id.toString()}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Fiyat Aralığı</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        handlePriceFilter();
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Fiyat Filtrele
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ürünler</h1>
                {pagination && (
                  <p className="text-sm text-gray-600 mt-1">
                    {pagination.totalItems} ürün bulundu
                  </p>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="name">İsme Göre (A-Z)</option>
                  <option value="price">Fiyata Göre (Düşük-Yüksek)</option>
                  <option value="price_desc">Fiyata Göre (Yüksek-Düşük)</option>
                  <option value="newest">En Yeniler</option>
                  <option value="popular">En Popülerler</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-purple-600 hover:text-purple-700"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.currentPage === page
                              ? 'bg-purple-600 text-white'
                              : 'bg-white shadow hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;