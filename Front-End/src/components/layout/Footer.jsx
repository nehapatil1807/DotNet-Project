// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="footer-info">
                <h3 className="footer-brand mb-3">Elegant Jewellery</h3>
                <p className="mb-4">
                  Discover timeless beauty with our exquisite collection of traditional and contemporary jewellery pieces.
                </p>
                <div className="footer-contact">
                  <p><i className="bi bi-geo-alt me-2"></i>123 Main Street, Mumbai, India</p>
                  <p><i className="bi bi-telephone me-2"></i>+91 98765 43210</p>
                  <p><i className="bi bi-envelope me-2"></i>info@elegantjewellery.com</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h5 className="footer-title mb-3">Categories</h5>
              <ul className="footer-links">
                <li><Link to="/products">Necklaces</Link></li>
                <li><Link to="/products">Earrings</Link></li>
                <li><Link to="/products">Bangles</Link></li>
                <li><Link to="/products">Rings</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h5 className="footer-title mb-3">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="col-lg-4">
              <h5 className="footer-title mb-3">Stay Connected</h5>
              <p className="mb-3">Subscribe to our newsletter for updates and exclusive offers.</p>
              <div className="footer-newsletter">
                <form className="d-flex">
                  <input 
                    type="email" 
                    className="form-control me-2" 
                    placeholder="Your email address"
                  />
                  <button className="btn btn-outline-light" type="submit">
                    Subscribe
                  </button>
                </form>
              </div>
              <div className="footer-social mt-3">
                <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
                <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                <a href="#" className="social-link"><i className="bi bi-pinterest"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">© {new Date().getFullYear()} Elegant Jewellery. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <img 
                src="/payment-methods.png" 
                alt="Payment Methods" 
                className="payment-methods"
                height="30"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;