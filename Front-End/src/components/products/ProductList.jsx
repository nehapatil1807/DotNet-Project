import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './ProductList.css';

const ProductList = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [processingItems, setProcessingItems] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    priceRange: searchParams.get('price') || 'all',
    sort: searchParams.get('sort') || 'latest',
    search: searchParams.get('search') || '',
    minPrice: 0,
    maxPrice: 250000
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response.success) {
        setProducts(response.data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      setProcessingItems(prev => new Set(prev).add(productId));
      const result = await addToCart(productId, 1);
      if (result.success) {
        toast.success('Product added to cart');
      } else {
        toast.error(result.message);
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.priceRange !== 'all') params.set('price', newFilters.priceRange);
    if (newFilters.sort !== 'latest') params.set('sort', newFilters.sort);
    if (newFilters.search) params.set('search', newFilters.search);
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.categoryId.toString() !== filters.category) {
      return false;
    }
    
    const price = product.price;
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.categoryName.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  }).sort((a, b) => {
    switch (filters.sort) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="products-grid">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="product-card">
            <div className="product-image-wrapper skeleton"></div>
            <div className="listing-product-info">
              <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ height: '32px', width: '40%', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ height: '40px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Hero Section */}
      <div className="products-hero">
        <div className="container">
          <h1 className="hero-title">Our Collection</h1>
          <p className="hero-description">
            Discover our exquisite collection of handcrafted jewellery pieces, 
            designed to make every moment special.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row g-4">
          {/* Filters Panel */}
          {/* Filters Panel */}
<div className="col-lg-3">
  <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
    <div className="d-flex d-lg-none justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Filters</h5>
      <button 
        className="btn-close" 
        onClick={() => setShowFilters(false)}
      ></button>
    </div>

    <div className="filter-section">
      <h6 className="filter-title">Categories</h6>
      <div className="form-check mb-2">
        <input
          type="radio"
          className="form-check-input"
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
            type="radio"
            className="form-check-input"
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

    <div className="filter-section">
      <h6 className="filter-title">Price Range</h6>
      <div className="price-range-slider">
        <input
          type="range"
          className="form-range"
          min="0"
          max="250000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
        />
        <div className="d-flex justify-content-between">
          <span>₹0</span>
          <span>{formatPrice(filters.maxPrice)}</span>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Products Grid */}
          <div className="col-lg-9">
            {/* Results Summary */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary d-lg-none"
                  onClick={() => setShowFilters(true)}
                >
                  <i className="bi bi-funnel me-2"></i>
                  Filters
                </button>
                <select
                  className="form-select w-auto"
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
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-state">
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
                      search: '',
                      minPrice: 0,
                      maxPrice: 250000
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
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    {/* Quick View Button */}
                    <button 
                      className="quick-view-btn btn btn-light shadow-sm"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Product Image */}
                    <div className="product-image-wrapper" onClick={() => navigate(`/products/${product.id}`)}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="listing-product-info">
                      <h3 className="product-name text-truncate">{product.name}</h3>
                      <div className="product-category">{product.categoryName}</div>
                      <div className="product-price">{formatPrice(product.price)}</div>
                      
                      <div className="product-actions">
                        <button
                          className="btn btn-outline-secondary product-btn"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-primary product-btn"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={processingItems.has(product.id)}
                        >
                          {processingItems.has(product.id) ? (
                            <span className="spinner-border spinner-border-sm" role="status" />
                          ) : (
                            <i className="bi bi-cart-plus"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Button */}
      <button
        className="btn btn-primary rounded-pill px-4 py-2 filters-mobile-button d-lg-none"
        onClick={() => setShowFilters(true)}
      >
        <i className="bi bi-funnel me-2"></i>
        Filters
      </button>

      {/* Filters Backdrop */}
      {showFilters && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default ProductList;