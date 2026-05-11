import { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            
            // Data save karna
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('userName', res.data.user.name);

            alert("Login Success! Redirecting to Dashboard...");
            
            // Page ko refresh karke dashboard par bhejna (Sabse best tarika navigation fix karne ka)
            window.location.href = '/dashboard';
            
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Login Failed. Check backend server.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
            <form onSubmit={handleLogin} style={{ width: '350px', padding: '30px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>Please login to your account</p>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="email@example.com" 
                        required 
                        style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                    Login
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</a>
                </p>
            </form>
        </div>
    );
};

export default Login;