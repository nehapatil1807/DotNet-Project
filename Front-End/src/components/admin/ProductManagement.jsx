import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5135/api/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
      };

      const url = editingProduct
        ? `http://localhost:5135/api/products/${editingProduct.id}`
        : 'http://localhost:5135/api/products';

      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        await fetchProducts();
        resetForm();
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      imageUrl: '',
      categoryId: '',
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId.toString(),
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5135/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          await fetchProducts();
        } else {
          setError(result.message);
        }
      } catch {
        setError('Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Product Management</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row g-4">
        {/* Form Section */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="img-thumbnail mt-2"
                      onError={(e) => (e.target.src = '/api/placeholder/200/200')}
                    />
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="1">Rings</option>
                    <option value="2">Necklaces</option>
                    <option value="3">Earrings</option>
                    <option value="4">Bracelets</option>
                  </select>
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary" type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      className="btn btn-secondary mt-2"
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Product List Section */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="card-title mb-0">Product List</h5>
            </div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.imageUrl || '/api/placeholder/50/50'}
                          alt={product.name}
                          className="img-thumbnail"
                          style={{ width: '50px', height: '50px' }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.categoryName}</td>
                      <td>₹{product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <p className="text-center my-3">No products available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;