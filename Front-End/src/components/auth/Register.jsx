import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../common/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'User'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateField = (name, value) => {
    let fieldError = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          fieldError = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length < 2) {
          fieldError = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 3 characters`;
        } else if (/\d/.test(value)) { 
          fieldError = `${name === 'firstName' ? 'First' : 'Last'} name cannot contain numbers`;
        }
        break;
      case 'email':
        if (!value) {
          fieldError = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          fieldError = 'Please enter a valid email';
        }
        break;
      case 'phoneNumber':
        if (!value) {
          fieldError = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          fieldError = 'Please enter a valid 10-digit phone number';
        }
        break;
      case 'password':
        if (!value) {
          fieldError = 'Password is required';
        } else if (value.length < 6) {
          fieldError = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    return fieldError;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'role') { // Skip validation for role as it has a default value
        const fieldError = validateField(key, formData[key]);
        if (fieldError) {
          newErrors[key] = fieldError;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Touch all fields to show validation messages
    const touchedFields = {};
    Object.keys(formData).forEach(key => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/products');
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Register</h2>
              <ErrorMessage message={error} />
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : 
                        touched.firstName && !errors.firstName ? 'is-valid' : ''}`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.firstName && errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : 
                        touched.lastName && !errors.lastName ? 'is-valid' : ''}`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.lastName && errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${touched.email && errors.email ? 'is-invalid' : 
                      touched.email && !errors.email ? 'is-valid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-control ${touched.phoneNumber && errors.phoneNumber ? 'is-invalid' : 
                      touched.phoneNumber && !errors.phoneNumber ? 'is-valid' : ''}`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <div className="invalid-feedback">{errors.phoneNumber}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${touched.password && errors.password ? 'is-invalid' : 
                      touched.password && !errors.password ? 'is-valid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.password && errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>

                <div className="text-center">
                  Already have an account? <Link to="/login">Login here</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;