import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        uid: '',
        uname: '',
        password: '',
        email: '',
        phone: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join Kodbank and get started with ₹1,00,000</p>

                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">User ID</label>
                        <input type="text" name="uid" className="form-input" placeholder="e.g. KOD123" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" name="uname" className="form-input" placeholder="Choose a unique username" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="form-input" placeholder="you@example.com" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-input" placeholder="••••••••" required onChange={handleChange} />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>

                <Link to="/login" className="auth-link">Already have an account? Login</Link>
            </div>
        </div>
    );
};

export default Register;
