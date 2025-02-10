import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/formatters';
import Loading from '../common/Loading';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(id);
      if (response.success) {
        setProduct(response.data);
        fetchRelatedProducts(response.data.categoryId);
        fetchProductReviews(id);
        
        const cartItem = cart?.items?.find(item => item.productId === parseInt(id));
        setQuantity(cartItem ? cartItem.quantity : 1);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      toast.error('Error loading product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await productService.getProductsByCategory(categoryId);
      if (response.success) {
        setRelatedProducts(response.data.filter(p => p.id !== parseInt(id)).slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const fetchProductReviews = async (productId) => {
    const simulatedReviews = [
      { id: 1, rating: 5, comment: "Excellent product!" },
      { id: 2, rating: 4, comment: "Very good quality." },
      { id: 3, rating: 3, comment: "It's okay, not what I expected." },
    ];
    setReviews(simulatedReviews);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setAddingToCart(true);
      const result = await addToCart(product.id, quantity);
      if (result.success) {
        toast.success('Product added to cart');
        navigate('/cart');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'danger' };
    if (product.stock < 5) return { text: 'Low Stock', color: 'warning' };
    return { text: 'In Stock', color: 'success' };
  };

  if (loading) return <Loading />;
  if (!product) return null;

  const stockStatus = getStockStatus();

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/products">Products</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.categoryId}`}>
              {product.categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6 position-relative">
            {!imageLoaded && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-100 h-100 object-fit-cover"
              style={{ 
                minHeight: '500px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                transition: 'opacity 0.3s ease'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
                setImageLoaded(true);
              }}
            />
          </div>

          <div className="col-md-6">
            <div className="p-4 p-lg-5">
              <h1 className="h2 mb-3">{product.name}</h1>
              
              <div className="mb-4">
                <span className="h3 text-primary me-3">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-decoration-line-through text-muted">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className={`badge bg-${stockStatus.color} me-2`}>
                  {stockStatus.text}
                </span>
                {product.stock > 0 && (
                  <small className="text-muted">
                    {product.stock} units available
                  </small>
                )}
              </div>

              {product.stock > 0 && (
                <div className="mb-4">
                  <label className="form-label">Quantity:</label>
                  <div className="input-group" style={{ width: '140px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) handleQuantityChange(val);
                      }}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </>
                  )}
                </button>
                <Link 
                  to="/products" 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-4">
                <h5>Product Description</h5>
                <p className="text-muted">
                  Discover the exceptional features of our {product.name}. Crafted with precision and care, this product is designed to meet your needs and exceed your expectations. Whether you're using it for personal enjoyment or as a thoughtful gift, it promises quality and satisfaction.
                </p>
                <ul className="text-muted">
                  <li><strong>Premium Quality:</strong> Made from high-grade materials that ensure durability and longevity.</li>
                  <li><strong>Versatile Options:</strong> Available in a variety of colors and sizes to suit your style.</li>
                  <li><strong>Eco-Friendly Packaging:</strong> We prioritize sustainability with our recyclable and biodegradable packaging.</li>
                  <li><strong>Comprehensive Warranty:</strong> Enjoy peace of mind with a 1-year warranty included with your purchase.</li>
                  <li><strong>Customer-Centric Design:</strong> Thoughtfully designed to enhance user experience and functionality.</li>
                </ul>
              </div>

              <div className="mt-4">
                <h5>User Reviews</h5>
                {reviews.length > 0 ? (
                  <ul className="list-unstyled">
                    {reviews.map(review => (
                      <li key={review.id} className="border-bottom mb-2 pb-2">
                        <div className="d-flex justify-content-between">
                          <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          <span className="text-muted">Review {review.id}</span>
                        </div>
                        <p>{review.comment}</p>
                        <small className="text-muted">- User {review.id}, {new Date().toLocaleDateString()}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">Related Products</h3>
          <div className="row g-4">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="col-6 col-md-3">
                <div className="card h-100 border-0 shadow-sm hover-elevation">
                  <img
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/placeholder.jpg' }}
                  />
                  <div className="card-body">
                    <h6 className="card-title mb-2">{relatedProduct.name}</h6>
                    <p className="card-text text-primary mb-0">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                  <Link
                    to={`/products/${relatedProduct.id}`}
                    className="stretched-link"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;