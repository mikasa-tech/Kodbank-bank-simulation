import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import confetti from 'canvas-confetti';
import { Wallet, LogOut, TrendingUp, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCheckBalance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/balance');
            const data = response.data;
            setBalance(data.balance);

            // Party Popper Animation
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // In a real app, we'd call a logout endpoint to clear the cookie
        // For now, we'll just redirect to login (the cookie will still exist but we can't clear httpOnly from JS)
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                        <Wallet size={24} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Kodbank</h2>
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>
                    <LogOut size={20} /> Logout
                </button>
            </header>

            <main>
                <div className="balance-card">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <ShieldCheck size={32} color="var(--primary)" style={{ opacity: 0.8 }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Secure</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <TrendingUp size={32} color="var(--success)" style={{ opacity: 0.8 }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Dynamic</p>
                        </div>
                    </div>

                    <h4 style={{ color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>Available Balance</h4>

                    <div className="balance-amount">
                        {balance !== null ? `₹${parseFloat(balance).toLocaleString('en-IN')}` : '••••••'}
                    </div>

                    {balance !== null && (
                        <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '2rem', fontSize: '1.25rem' }}>
                            🎉 Your balance is: ₹{parseFloat(balance).toLocaleString('en-IN')}
                        </p>
                    )}

                    <button className="check-btn" onClick={handleCheckBalance} disabled={loading}>
                        {loading ? 'Checking...' : 'Check Balance'}
                    </button>
                </div>
            </main>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                {[
                    { title: 'Fixed Deposits', desc: 'Secure your future with high returns', color: '#818cf8' },
                    { title: 'Credit Cards', desc: 'Exclusive rewards and premium access', color: '#c084fc' },
                    { title: 'Loans', desc: 'Tailored solutions for your needs', color: '#2dd4bf' }
                ].map((item, i) => (
                    <div key={i} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ width: '40px', height: '4px', background: item.color, borderRadius: '2px', marginBottom: '1rem' }} />
                        <h5 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>{item.title}</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
