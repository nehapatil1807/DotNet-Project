import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedCategory === 'all') {
        response = await productService.getAllProducts();
      } else {
        response = await productService.getProductsByCategory(selectedCategory);
      }

      if (response.success) {
        setProducts(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Our Collection</h2>
      <div className="row g-4">
        {products.map((product) => (
          <div key={product.id} className="col-sm-6 col-lg-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;