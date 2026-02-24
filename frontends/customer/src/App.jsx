import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import AnimatedRate from './components/AnimatedRate'; // Import the new component

function App() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    fetchRates();

    // Connect to Socket.io server
    const socket = io(import.meta.env.VITE_API_URL || 'https://rsj-admin.onrender.com');

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen for rate updates
    socket.on('rateUpdated', (newRates) => {
      console.log('Received rate update:', newRates);
      // Ensure specific fields exist or fallback
      const updatedRates = {
        ...newRates,
        updatedAt: newRates.updatedAt || new Date().toISOString()
      };
      setRates(updatedRates);
      toast.success('Rates updated successfully!', {
        position: 'top-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://rsj-admin.onrender.com'}/api/rates`);
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }
      const data = await response.json();
      setRates(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // State for making charges per metal type
  const [makingCharges, setMakingCharges] = useState({
    gold24: 2,
    gold22: 7,
    gold18: 7,
    silver: 10
  });

  const handleMakingChange = (metal, value) => {
    // Allow any input, let the user type librement
    // We will validate/parse when calculating
    setMakingCharges(prev => ({
      ...prev,
      [metal]: value
    }));
  };

  // State for weights per metal type
  const [weights, setWeights] = useState({
    gold24: 10,
    gold22: 10,
    gold18: 10,
    silver: 10
  });

  const handleWeightChange = (metal, value) => {
    setWeights(prev => ({
      ...prev,
      [metal]: value
    }));
  };

  const calculatePrice = (rate10g, makingPercentage, weight) => {
    const ratePerGram = rate10g / 10;
    const w = (weight === '' || weight === null) ? 0 : Number(weight);
    const m = (makingPercentage === '' || makingPercentage === null) ? 0 : Number(makingPercentage);

    const basePrice = ratePerGram * w;

    // Making charges is % of the base price
    const makingChargesTotal = basePrice * (m / 100);

    const subTotal = basePrice + makingChargesTotal;
    const gst = subTotal * 0.03; // 3% GST of (Rate + Making)
    const total = subTotal + gst;

    return {
      basePrice,
      makingChargesTotal,
      gst,
      total
    };
  };

  if (loading) return <div className="loading-container"><h2>Loading Rates...</h2></div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <>
      <Toaster />
      <nav className="navbar">
        <a href="/" className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="navbar-logo" />
          Rani Sati Jewellers, Katras
        </a>
        <div className="navbar-right">
          <button onClick={toggleFullscreen} className="fullscreen-btn" aria-label="Toggle Fullscreen">
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            )}
          </button>
          <span className="bis-label">BIS Hallmarked</span>
          <img
            src="/bis_logo.png"
            alt="BIS Hallmark"
            className="bis-logo"
          />
        </div>
      </nav>
      <div className="container">
        {/* Offer Banner */}
        <div className="offer-banner">
          <div className="offer-content">
            <span className="offer-badge">Limited Time</span>
            <span className="offer-text">
              ✨ Making Charges Starting From Just <strong>7%</strong> !
            </span>
          </div>
        </div>

        <header className="header">
          <h1 className="title">Today's Live Rates</h1>
          <p className="subtitle">Real-time Gold & Silver Rates</p>
        </header>

        <div className="rates-layout">
          {/* Column 1: 24K and Silver */}
          <div className="rates-col">
            {/* 24K Gold */}
            <div className="rate-card card-gold24">
              <div className="card-header">
                <h2 className="card-title">24K Gold</h2>
                <span className="badge">99.9% Purity</span>
              </div>
              <div className="rate-details">
                {/* <div className="rate-row">
                  <span className="rate-label">Buy (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold24.sellRate} /></span>
                </div> */}
                <div className="rate-row">
                  <span className="rate-label">Sell (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold24.purchaseRate} /></span>
                </div>
              </div>
            </div>

            {/* Silver */}
            <div className="rate-card card-silver">
              <div className="card-header">
                <h2 className="card-title">Silver</h2>
                <span className="badge">Fine Silver</span>
              </div>
              <div className="rate-details">
                {/* <div className="rate-row">
                  <span className="rate-label">Buy (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.silver.sellRate} /></span>
                </div> */}
                <div className="rate-row">
                  <span className="rate-label">Sell (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.silver.purchaseRate} /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: 22K Gold */}
          <div className="rates-col">
            <div className="rate-card card-gold22">
              <div className="card-header">
                <h2 className="card-title">22K Gold</h2>
                <span className="badge">91.6% Purity</span>
              </div>
              <div className="rate-details">
                <div className="rate-row">
                  <span className="rate-label">Sell (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold22.purchaseRate} /></span>
                </div>
                <div className="rate-row">
                  <span className="rate-label">Buy (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold22.sellRate} /></span>
                </div>
                <div className="calc-result">
                  <h3 className="calc-title">Rough Estimate</h3>
                  <div className="input-group">
                    <label className="input-label">Weight</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="calc-input"
                        value={weights.gold22}
                        onChange={(e) => handleWeightChange('gold22', e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="suffix">gm</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Making Charges</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="calc-input"
                        value={makingCharges.gold22}
                        onChange={(e) => handleMakingChange('gold22', e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>
                  {(() => {
                    const calc = calculatePrice(rates.gold22.purchaseRate, makingCharges.gold22, weights.gold22);
                    return (
                      <>
                        <div className="calc-row">
                          <span>Gold Value</span>
                          <span>₹ {calc.basePrice.toLocaleString()}</span>
                        </div>
                        <div className="calc-row">
                          <span>Making Charges</span>
                          <span>₹ {Math.round(calc.makingChargesTotal).toLocaleString()}</span>
                        </div>
                        <div className="calc-row">
                          <span>GST (3%)</span>
                          <span>₹ {Math.round(calc.gst).toLocaleString()}</span>
                        </div>
                        <div className="calc-row calc-total">
                          <span>Total<sub>(Approx)</sub></span>
                          <span>₹ {Math.round(calc.total).toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: 18K Gold */}
          <div className="rates-col">
            <div className="rate-card card-gold18">
              <div className="card-header">
                <h2 className="card-title">18K Gold</h2>
                <span className="badge">75% Purity</span>
              </div>
              <div className="rate-details">
                <div className="rate-row">
                  <span className="rate-label">Sell (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold18.purchaseRate} /></span>
                </div>
                <div className="rate-row">
                  <span className="rate-label">Buy (10gm)</span>
                  <span className="rate-value">₹ <AnimatedRate value={rates.gold18.sellRate} /></span>
                </div>

                <div className="calc-result">
                  <h3 className="calc-title">Rough Estimate</h3>
                  <div className="input-group">
                    <label className="input-label">Weight</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="calc-input"
                        value={weights.gold18}
                        onChange={(e) => handleWeightChange('gold18', e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="suffix">gm</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Making Charges</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        className="calc-input"
                        value={makingCharges.gold18}
                        onChange={(e) => handleMakingChange('gold18', e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>
                  {(() => {
                    const calc = calculatePrice(rates.gold18.purchaseRate, makingCharges.gold18, weights.gold18);
                    return (
                      <>
                        <div className="calc-row">
                          <span>Gold Value</span>
                          <span>₹ {calc.basePrice.toLocaleString()}</span>
                        </div>
                        <div className="calc-row">
                          <span>Making Charges</span>
                          <span>₹ {Math.round(calc.makingChargesTotal).toLocaleString()}</span>
                        </div>
                        <div className="calc-row">
                          <span>GST (3%)</span>
                          <span>₹ {Math.round(calc.gst).toLocaleString()}</span>
                        </div>
                        <div className="calc-row calc-total">
                          <span>Total<sub>(Approx)</sub></span>
                          <span>₹ {Math.round(calc.total).toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Last Updated: {rates.updatedAt ? new Date(rates.updatedAt).toLocaleString() : new Date().toLocaleString()}
        </p>
      </div>
    </>
  );
}

export default App;
