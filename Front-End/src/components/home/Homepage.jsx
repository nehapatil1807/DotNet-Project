import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../layout/Carousel';
import './Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: 'Bridal Choker',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435297728.jpeg',
      description: 'Elegant for your special day',
      link: '/products?category=1'
    },
    {
      id: 2,
      name: 'Royalty Bangles',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435591278.jpeg',
      description: 'Beautiful bangles for every occasion',
      link: '/products?category=2'
    },
    {
      id: 3,
      name: 'Temple Earrings',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435401640.jpeg',
      description: 'Traditional temple jewelry earrings',
      link: '/products?category=3'
    },
    {
      id: 4,
      name: 'Exquisite Rings',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435346824.jpeg',
      description: 'Fine crafted rings for every style',
      link: '/products?category=4'
    }
  ];

  return (
    <div className="home-page">
      {/* Carousel Section */}
      <Carousel />
      
      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Traditional Jewellery</h2>
          <div className="row g-4">
            {categories.map((category) => (
              <div key={category.id} className="col-md-6 col-lg-3">
                <div 
                  className="category-card"
                  onClick={() => navigate(category.link)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-img-wrapper">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="img-fluid"
                    />
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="brand-story">
        <div className="container">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <h2>Our Story</h2>
              <p className="lead">
                Since 1990, Elegant Jewellery has been crafting timeless pieces that celebrate life's most precious moments. 
                Our commitment to excellence and traditional craftsmanship has made us a trusted name in fine jewelry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;