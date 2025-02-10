import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const handleImageError = (e) => {
    e.target.src = '/placeholder.jpg'; // Fallback image
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const discount = calculateDiscount();

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        <div className="product-image-wrapper">
          <img 
            src={product.imageUrl || '/placeholder.jpg'} 
            alt={product.name}
            className="product-image"
            onError={handleImageError}
          />
          {discount > 0 && (
            <div className="discount-badge">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.categoryName}</p>
          <div className="price-section">
            <span className="current-price">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;