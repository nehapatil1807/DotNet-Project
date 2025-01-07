import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../layout/Carousel';

const HomePage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: 'Traditional Bridal Choker',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435297728.jpeg',
      description: 'Elegant for your special day',
      link: '/products'
    },
    {
      id: 2,
      name: 'Royalty Bangles',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435591278.jpeg',
      description: 'Beautiful bangles for every occasion',
      link: '/products'
    },
    {
      id: 3,
      name: 'Temple Earrings',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435401640.jpeg',
      description: 'Traditional temple jewelry earrings',
      link: '/products'
    },
    {
      id: 4,
      name: 'Exquisite Rings',
      image: 'https://cdn.bradojewellery.com/is/540x/1713435346824.jpeg',
      description: 'Fine crafted rings for every style',
      link: '/products'
    }
  ];

  return (
    <div className="home-page">
      <Carousel />
      
      

      {/* Categories Section */}
      <section className="categories py-5">
        <div className="container">
          <h2 className="text-center mb-5 display-6">Traditional Jewellery</h2>
          <div className="row g-4">
            {categories.map((category) => (
              <div key={category.id} className="col-md-6 col-lg-3">
                <div 
                  className="category-card shadow-sm rounded overflow-hidden"
                  onClick={() => navigate(category.link)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-img-wrapper">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-100"
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="category-info p-3 bg-white">
                    <h3 className="h5 mb-2">{category.name}</h3>
                    <p className="small text-muted mb-0">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Brand Story Section */}
      <section className="brand-story py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-8 mx-auto text-center">
              <h2 className="display-5 mb-4">Our Story</h2>
              <p className="lead mb-4">
                Since 1990, Elegant Jewellery has been crafting timeless pieces that celebrate life's most precious moments. 
                Our commitment to excellence and traditional craftsmanship has made us a trusted name in fine jewelry.
              </p>
              <hr className="my-4 w-25 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;