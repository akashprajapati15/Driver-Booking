import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert("Registration Successful!");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <form onSubmit={handleSubmit} style={{ width: '350px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center' }}>Create Account</h2>
                <input type="text" placeholder="Name" required style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" required style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="Password" required style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <select style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="user">User (Vehicle Owner)</option>
                    <option value="driver">Driver</option>
                </select>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}>Register</button>
            </form>
        </div>
    );
};

export default Register;