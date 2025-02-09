import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';
import './ProductList.css';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState(localStorage.getItem('viewType') || 'grid');

  // Get URL params
  const searchParams = new URLSearchParams(location.search);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    priceRange: searchParams.get('price') || 'all',
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || ''
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.priceRange !== 'all') params.set('price', newFilters.priceRange);
    if (newFilters.sort !== 'latest') params.set('sort', newFilters.sort);
    if (newFilters.search) params.set('search', newFilters.search);
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location.pathname]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Update filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      category: params.get('category') || 'all',
      priceRange: params.get('price') || 'all',
      sort: params.get('sort') || 'latest',
      search: params.get('search') || ''
    });
  }, [location.search]);

  // Save view type preference
  useEffect(() => {
    localStorage.setItem('viewType', viewType);
  }, [viewType]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getPriceRange = (range) => {
    switch (range) {
      case '0-5000': return { min: 0, max: 5000 };
      case '5000-10000': return { min: 5000, max: 10000 };
      case '10000-50000': return { min: 10000, max: 50000 };
      case '50000+': return { min: 50000, max: Infinity };
      default: return { min: 0, max: Infinity };
    }
  };

  const filteredAndSortedProducts = useCallback(() => {
    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.categoryName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId.toString() === filters.category
      );
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange);
      filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, filters]);

  if (loading) return <Loading />;

  const filteredProducts = filteredAndSortedProducts();

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3">
          <div className="sidebar">
            <div className="filter-section mb-4">
              <h5 className="mb-3">Category</h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="category"
                  id="all"
                  checked={filters.category === 'all'}
                  onChange={() => handleFilterChange('category', 'all')}
                />
                <label className="form-check-label" htmlFor="all">
                  All Categories
                </label>
              </div>
              {['1', '2', '3', '4'].map((catId) => (
                <div className="form-check mb-2" key={catId}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="category"
                    id={`cat-${catId}`}
                    checked={filters.category === catId}
                    onChange={() => handleFilterChange('category', catId)}
                  />
                  <label className="form-check-label" htmlFor={`cat-${catId}`}>
                    {catId === '1' ? 'Rings' :
                     catId === '2' ? 'Necklaces' :
                     catId === '3' ? 'Earrings' : 'Bracelets'}
                  </label>
                </div>
              ))}
            </div>

            <div className="filter-section mb-4">
              <h5 className="mb-3">Price Range</h5>
              {['all', '0-5000', '5000-10000', '10000-50000', '50000+'].map((range) => (
                <div className="form-check mb-2" key={range}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="priceRange"
                    id={`price-${range}`}
                    checked={filters.priceRange === range}
                    onChange={() => handleFilterChange('priceRange', range)}
                  />
                  <label className="form-check-label" htmlFor={`price-${range}`}>
                    {range === 'all' ? 'All Prices' :
                     range === '50000+' ? '₹50,000+' :
                     `₹${range.replace('-', ' - ₹')}`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9">
          {/* Header with sort and view options */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
            <div className="btn-group">
              <button
                className={`btn btn-outline-secondary ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
              >
                <i className="bi bi-grid"></i>
              </button>
              <button
                className={`btn btn-outline-secondary ${viewType === 'list' ? 'active' : ''}`}
                onClick={() => setViewType('list')}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-3"></i>
              <h4>No products found</h4>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setFilters({
                    category: 'all',
                    priceRange: 'all',
                    sort: 'latest',
                    search: ''
                  });
                  updateURL({
                    category: 'all',
                    priceRange: 'all',
                    sort: 'latest',
                    search: ''
                  });
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-muted mb-4">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
              <div className={`row g-4 ${viewType === 'list' ? 'product-list' : ''}`}>
                {filteredProducts.map((product) => (
                  <div key={product.id} 
                       className={viewType === 'grid' ? 'col-sm-6 col-lg-4' : 'col-12'}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;