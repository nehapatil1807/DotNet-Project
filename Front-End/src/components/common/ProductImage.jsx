// src/components/common/ProductImage.jsx

import React, { useState } from 'react';

const ProductImage = ({ 
  src, 
  alt, 
  className = '', 
  size = 'md',
  fallbackSrc = '/placeholder.jpg' 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Size classes map (can be adjusted based on needs)
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const baseClasses = 'rounded overflow-hidden relative';
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${baseClasses} ${sizeClass} ${className}`}>
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
};

// Specialized versions for different contexts
export const CartItemImage = ({ product }) => (
  <ProductImage
    src={product.imageUrl}
    alt={product.name}
    size="lg"
    className="border"
  />
);

export const OrderItemImage = ({ item }) => (
  <ProductImage
    src={item.imageUrl}
    alt={item.productName}
    size="md"
    className="border"
  />
);

export const ProductThumbnail = ({ product }) => (
  <ProductImage
    src={product.imageUrl}
    alt={product.name}
    size="xl"
    className="border"
  />
);

export default ProductImage;