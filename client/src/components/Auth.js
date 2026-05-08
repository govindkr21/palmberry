import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import '../styles/Auth.css';

function Auth({ onLogin, onClose }) {
  const [mode, setMode] = useState('email'); // 'email', 'phone', 'otp'
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginSuccess = useCallback((data) => {
    localStorage.setItem('token', data.token);
    const userData = {
      _id: data._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    onLogin(userData);
    onClose();
  }, [onLogin, onClose]);

  const handleGoogleCallback = useCallback(async (response) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/google', { idToken: response.credential });
      loginSuccess(data);
    } catch (err) {
      setError('Google Login failed');
      setLoading(false);
    }
  }, [loginSuccess]);

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id",
        callback: handleGoogleCallback
      });
      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, [mode, handleGoogleCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'email') {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const isEmailInput = emailOrPhone.includes('@');
      const payload = isLogin 
        ? { [isEmailInput ? 'email' : 'phone']: emailOrPhone, password }
        : { name, [isEmailInput ? 'email' : 'phone']: emailOrPhone, password };

      try {
        const { data } = await axios.post(url, payload);
        loginSuccess(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Authentication failed');
      }
    } else if (mode === 'phone') {
      try {
        await axios.post('/api/auth/send-otp', { phone: emailOrPhone });
        setMode('otp');
      } catch (err) {
        setError('Failed to send OTP');
      }
    } else if (mode === 'otp') {
      try {
        const { data } = await axios.post('/api/auth/verify-otp', { 
          phone: emailOrPhone, 
          otp,
          name: isLogin ? undefined : name
        });
        loginSuccess(data);
      } catch (err) {
        setError('Invalid OTP');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal" onClick={(e) => { if (e.target.classList.contains('auth-modal')) onClose(); }}>
      <div className="auth-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        <div className="mode-toggle">
          <button className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>Email/Pass</button>
          <button className={mode === 'phone' || mode === 'otp' ? 'active' : ''} onClick={() => setMode('phone')}>Phone OTP</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && mode !== 'otp' && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}

          {mode === 'email' && (
            <>
              <input type="text" placeholder="Email or Phone" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </>
          )}

          {mode === 'phone' && (
            <input type="text" placeholder="Phone Number" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
          )}

          {mode === 'otp' && (
            <>
              <p>Enter OTP sent to {emailOrPhone}</p>
              <input type="text" placeholder="6-digit OTP (Try 123456)" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'phone' ? 'Send OTP' : (isLogin ? 'Login' : 'Sign Up'))}
          </button>
        </form>

        {mode === 'email' && (
          <>
            <div className="auth-divider"><span>OR</span></div>
            <div id="googleBtn"></div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
        
        <p className="toggle-auth">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
