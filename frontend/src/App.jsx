import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f4f7f6' }}>
        {/* Navigation Bar */}
        <nav style={{ 
          padding: '15px 50px', 
          background: '#2c3e50', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0 }}>DriverApp 🚗</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Register</Link>
              </>
            ) : (
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            )}
          </div>
        </nav>

        {/* Routes Configuration */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h1 style={{ fontSize: '3rem', color: '#2c3e50' }}>Hire a Driver for Your Vehicle</h1>
                <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>Safe, Reliable, and Professional drivers at your doorstep.</p>
                {!isAuthenticated && (
                  <Link to="/register">
                    <button style={{ padding: '15px 30px', fontSize: '1.1em', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
                      Get Started Now
                    </button>
                  </Link>
                )}
              </div>
            } />
            
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            
            {/* Protected Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;