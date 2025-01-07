import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ErrorMessage from '../common/ErrorMessage';
import { formatPrice } from '../../utils/formatters';
import '../../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, refreshCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await addToCart(product.id, 1);
      if (result.success) {
        await refreshCart();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card card h-100">
      <div className="product-image-wrapper">
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.imageUrl || '/placeholder-image.jpg'} 
            className="product-image"
            alt={product.name}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </Link>
        <span className="product-category-badge">
          {product.categoryName}
        </span>
      </div>
      
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-2">{product.name}</h5>
        
        <div className="mb-3">
          <div className="product-price mb-1">
            {formatPrice(product.price)}
          </div>
          <div className="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        
        <div className="product-buttons mt-auto d-flex gap-2">
          <Link 
            to={`/products/${product.id}`} 
            className="btn btn-view-details flex-grow-1"
          >
            View Details
          </Link>
          <button
            className="btn btn-add-cart flex-grow-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;