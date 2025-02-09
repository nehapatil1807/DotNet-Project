import React, { useState } from 'react';

const PasswordInput = ({ 
  value, 
  onChange, 
  onBlur, 
  name = "password", 
  label = "Password",
  error,
  touched,
  placeholder = "Enter your password"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          className={`form-control ${touched && error ? 'is-invalid' : touched && !error ? 'is-valid' : ''}`}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-describedby={`${name}-feedback`}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
        </button>
        {touched && error && (
          <div id={`${name}-feedback`} className="invalid-feedback">{error}</div>
        )}
      </div>
    </div>
  );
};

export default PasswordInput;