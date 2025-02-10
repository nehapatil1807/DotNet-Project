import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../../../services/productService';
import { formatPrice } from '../../../utils/formatters';
import './AdminProducts.css';

const CATEGORIES = [
  { id: 1, name: 'Rings' },
  { id: 2, name: 'Necklaces' },
  { id: 3, name: 'Earrings' },
  { id: 4, name: 'Bracelets' }
];

const AdminProducts = () => {
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [processingItems, setProcessingItems] = useState(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'all',
    sort: 'latest'
  });

  // Fetch products on mount
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId)
      };

      const response = selectedProduct
        ? await productService.updateProduct(selectedProduct.id, data)
        : await productService.createProduct(data);

      if (response.success) {
        toast.success(selectedProduct ? 'Product updated' : 'Product created');
        fetchProducts();
        resetForm();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await productService.deleteProduct(selectedProduct.id);
      if (response.success) {
        toast.success('Product deleted');
        fetchProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.stock || formData.stock < 0) {
      toast.error('Valid stock quantity is required');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('Category is required');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      imageUrl: '',
      categoryId: ''
    });
    setSelectedProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId.toString()
    });
    setShowForm(true);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return 'Low Stock';
    return 'In Stock';
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.categoryId.toString() !== filters.category) {
      return false;
    }
    
    if (filters.stockStatus !== 'all') {
      if (filters.stockStatus === 'low' && product.stock >= 5) return false;
      if (filters.stockStatus === 'out' && product.stock > 0) return false;
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="h3 mb-2">Products Management</h1>
          <p className="text-muted">Manage your product inventory</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Stock Status</label>
              <select
                className="form-select"
                value={filters.stockStatus}
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label className="form-label">Sort By</label>
              <select
                className="form-select"
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
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-wrapper">
        <div className="table-header">
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={selectedItems.size === filteredProducts.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(new Set(filteredProducts.map(p => p.id)));
                } else {
                  setSelectedItems(new Set());
                }
              }}
            />
            <span className="text-muted">
              {selectedItems.size} selected
            </span>
          </div>
          {selectedItems.size > 0 && (
            <div className="bulk-actions">
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-trash me-2"></i>
                Delete Selected
              </button>
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-download me-2"></i>
                Export Selected
              </button>
            </div>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-hover product-table mb-0">
            <thead>
              <tr>
                <th width="40px"></th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="product-row">
                  <td className="product-cell">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.has(product.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedItems);
                        if (e.target.checked) {
                          newSelected.add(product.id);
                        } else {
                          newSelected.delete(product.id);
                        }
                        setSelectedItems(newSelected);
                      }}
                    />
                  </td>
                  <td className="product-cell">
                    <div className="admin-product-info">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="admin-product-image"
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                      <div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-category">{product.categoryName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="product-cell">
                    {product.categoryName}
                  </td>
                  <td className="product-cell">
                    <strong>{formatPrice(product.price)}</strong>
                  </td>
                  <td className="product-cell">
                    <span className={`stock-status ${getStockStatus(product.stock)}`}>
                      {getStockLabel(product.stock)} ({product.stock})
                    </span>
                  </td>
                  <td className="product-cell">
                    <div className="action-buttons">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(product)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <div className={`modal fade ${showForm ? 'show' : ''}`} style={{ display: showForm ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h5>
              <button 
                type="button" 
                className="btn-close"
                onClick={() => setShowForm(false)}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Price</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="image-preview mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          onError={(e) => { e.target.src = '/placeholder.jpg' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{selectedProduct?.name}"?</p>
              <p className="text-danger mb-0">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {(showForm || showDeleteModal) && (
        <div 
          className="modal-backdrop fade show"
          onClick={() => {
            setShowForm(false);
            setShowDeleteModal(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default AdminProducts;