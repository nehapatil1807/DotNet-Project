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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: ''
  });
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    stockStatus: 'all'
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.imageUrl) newErrors.imageUrl = 'Image URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        toast.success(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
        await fetchProducts(); // Wait for the products to be fetched
        resetForm();
        setShowForm(false);
        document.body.classList.remove('modal-open'); // Remove modal-open class
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await productService.deleteProduct(selectedProduct.id);
      if (response.success) {
        toast.success('Product deleted successfully');
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

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      imageUrl: '',
      categoryId: ''
    });
    setErrors({});
    setSelectedProduct(null);
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

  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.categoryId.toString() !== filters.category) return false;
    
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
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Products Management</h1>
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
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Stock Status</label>
                <select
                  className="form-select"
                  value={filters.stockStatus}
                  onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                >
                  <option value="all">All Stock Status</option>
                  <option value="low">Low Stock (&lt; 5)</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="rounded me-3"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/placeholder.jpg' }}
                        />
                        <div>
                          <h6 className="mb-0">{product.name}</h6>
                          <small className="text-muted">#{product.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      <span className={`badge bg-${product.stock < 5 ? 'danger' : 'success'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                        >
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
      </div>

      {/* Product Form Modal */}
      <div className={`modal fade ${showForm ? 'show' : ''}`} style={{ display: showForm ? 'block' : 'none' }}>
        <div className="modal-dialog">
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
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
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
                  {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                  {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '150px' }}
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
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