import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard state
  const [rates, setRates] = useState({
    gold24: { purchaseRate: '', sellRate: '' },
    gold22: { purchaseRate: '', sellRate: '' },
    gold18: { purchaseRate: '', sellRate: '' },
    silver: { purchaseRate: '', sellRate: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCurrentRates();
    }
  }, [token]);

  const fetchCurrentRates = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/rates`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.gold24) {
          // Populate form if data exists
          setRates({
            gold24: data.gold24,
            gold22: data.gold22,
            gold18: data.gold18,
            silver: data.silver
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch current rates");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success('Logged in successfully');
      } else {
        toast.error(data.msg || 'Login failed');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success('Logged out');
  };

  const handleRateChange = (metal, type, value) => {
    setRates(prev => ({
      ...prev,
      [metal]: {
        ...prev[metal],
        [type]: Number(value)
      }
    }));
  };

  const handleSubmitRates = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(rates),
      });

      if (res.ok) {
        toast.success('Rates updated successfully!', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
      } else {
        toast.error('Failed to update rates');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Toaster />
        <nav className="navbar">
          <div className="navbar-brand">
            <img src="/logo.png" alt="Logo" className="navbar-logo" />
            Rani Sati Jewellers Admin
          </div>
        </nav>
        <div className="login-container">
          <div className="login-card">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="navbar-logo" />
          Rani Sati Jewellers Admin
        </div>
        <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      </nav>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Rate Manager</h1>
          {/* Logout button moved to navbar */}
        </div>



        <form onSubmit={handleSubmitRates}>
          {/* GOLD 24K */}
          <h3 className="section-title">Gold 24K</h3>
          <div className="metal-grid">
            <div className="form-group">
              <label className="form-label">Sell Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold24.purchaseRate}
                onChange={(e) => handleRateChange('gold24', 'purchaseRate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold24.sellRate}
                onChange={(e) => handleRateChange('gold24', 'sellRate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* GOLD 22K */}
          <h3 className="section-title">Gold 22K</h3>
          <div className="metal-grid">
            <div className="form-group">
              <label className="form-label">Sell Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold22.purchaseRate}
                onChange={(e) => handleRateChange('gold22', 'purchaseRate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold22.sellRate}
                onChange={(e) => handleRateChange('gold22', 'sellRate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* GOLD 18K */}
          <h3 className="section-title">Gold 18K</h3>
          <div className="metal-grid">
            <div className="form-group">
              <label className="form-label">Sell Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold18.purchaseRate}
                onChange={(e) => handleRateChange('gold18', 'purchaseRate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.gold18.sellRate}
                onChange={(e) => handleRateChange('gold18', 'sellRate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* SILVER */}
          <h3 className="section-title">Silver</h3>
          <div className="metal-grid">
            <div className="form-group">
              <label className="form-label">Sell Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.silver.purchaseRate}
                onChange={(e) => handleRateChange('silver', 'purchaseRate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Buy Rate (10gm)</label>
              <input
                type="number"
                className="form-input"
                value={rates.silver.sellRate}
                onChange={(e) => handleRateChange('silver', 'sellRate', e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" style={{ marginTop: '2rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Rates'}
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
