import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [marketData, setMarketData] = useState({});
  const [error, setError] = useState(null);
  const [smaShort, setSmaShort] = useState(5);
  const [smaLong, setSmaLong] = useState(20);
  const [rsiPeriod, setRsiPeriod] = useState(14); // Dynamic RSI Period
  const [currencyPair, setCurrencyPair] = useState('BTCUSDT');
  const [predictionType, setPredictionType] = useState('days'); // 'days' or 'hours'
  const [predictionValue, setPredictionValue] = useState(1); // Number of days or hours to predict
  const [predictedPrices, setPredictedPrices] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);

    // New State for Historical Market Cap
    const [hoursAgo, setHoursAgo] = useState(0);
    const [minutesAgo, setMinutesAgo] = useState(0);
    const [historicalMarketCap, setHistoricalMarketCap] = useState(null);
    const [marketCapChange, setMarketCapChange] = useState(null);

  const currencyPairs = [
    { symbol: 'BTCUSDT', name: 'Bitcoin (BTC) to Tether (USDT)' },
    { symbol: 'ETHUSDT', name: 'Ethereum (ETH) to Tether (USDT)' },
    { symbol: 'BNBUSDT', name: 'Binance Coin (BNB) to Tether (USDT)' },
    { symbol: 'ADAUSDT', name: 'Cardano (ADA) to Tether (USDT)' },
    { symbol: 'XRPUSDT', name: 'Ripple (XRP) to Tether (USDT)' },
    { symbol: 'SOLUSDT', name: 'Solana (SOL) to Tether (USDT)' },
    { symbol: 'DOTUSDT', name: 'Polkadot (DOT) to Tether (USDT)' },
    { symbol: 'LTCUSDT', name: 'Litecoin (LTC) to Tether (USDT)' },
    { symbol: 'AVAXUSDT', name: 'Avalanche (AVAX) to Tether (USDT)' },
    { symbol: 'MATICUSDT', name: 'Polygon (MATIC) to Tether (USDT)' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE) to Tether (USDT)' },
    { symbol: 'SHIBUSDT', name: 'Shiba Inu (SHIB) to Tether (USDT)' },
    { symbol: 'TRXUSDT', name: 'Tron (TRX) to Tether (USDT)' },
    { symbol: 'LINKUSDT', name: 'Chainlink (LINK) to Tether (USDT)' },
    { symbol: 'UNIUSDT', name: 'Uniswap (UNI) to Tether (USDT)' },
    { symbol: 'XLMUSDT', name: 'Stellar (XLM) to Tether (USDT)' },
    { symbol: 'FILUSDT', name: 'Filecoin (FIL) to Tether (USDT)' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash (BCH) to Tether (USDT)' },
    { symbol: 'FTMUSDT', name: 'Fantom (FTM) to Tether (USDT)' },
    { symbol: 'ICPUSDT', name: 'Internet Computer (ICP) to Tether (USDT)' },
    { symbol: 'ACTUSDT', name: 'ACT (ACT) to Tether (USDT)' },
    { symbol: 'SUIUSDT', name: 'SUI (ACT) to Tether (USDT)' },
  ];

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/market_data?sma_short=${smaShort}&sma_long=${smaLong}&rsi_period=${rsiPeriod}&symbol=${currencyPair}`
        );
        setMarketData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching market data.');
      }
    };

    fetchMarketData();
  }, [smaShort, smaLong, rsiPeriod, currencyPair]);

  // Fetch prediction data
  const fetchPrediction = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/predict?symbol=${currencyPair}&${predictionType}=${predictionValue}`
      );
      setPredictedPrices(response.data.predicted_prices);
      setCurrentPrice(response.data.current_price);
      setError(null);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching prediction data.');
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Cryptocurrency Dashboard</h1>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {/* Market Data Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white text-center">
          Market Data for {currencyPairs.find(pair => pair.symbol === currencyPair)?.name}
        </div>
        <div className="card-body">
          <p>
            <strong>Latest Price:</strong> {marketData.latest_price || 'Loading...'}
          </p>
          <p>
            <strong>SMA Short ({smaShort} days):</strong> {marketData.sma_short || 'Loading...'}
          </p>
          <p>
            <strong>SMA Long ({smaLong} days):</strong> {marketData.sma_long || 'Loading...'}
          </p>
          <p>
            <strong>Market Cap:</strong> {marketData.market_cap ? `$${marketData.market_cap.toLocaleString()}` : 'Loading...'}
          </p>
          <p>
            <strong>Signal:</strong>{' '}
            <span
              className={`text-${
                marketData.signal === 'BUY' ? 'success' : marketData.signal === 'SELL' ? 'danger' : 'secondary'
              } fw-bold`}
            >
              {marketData.signal || 'Loading...'}
            </span>
          </p>
        </div>
      </div>

      {/* RSI Section */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">RSI Indicator</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="rsiPeriod" className="form-label">
              RSI Period (Days):
            </label>
            <input
              type="number"
              id="rsiPeriod"
              className="form-control"
              value={rsiPeriod}
              onChange={e => setRsiPeriod(Number(e.target.value))}
              min="1"
            />
          </div>
          <p>
            <strong>RSI Value:</strong> {marketData.rsi || 'Loading...'}{' '}
            <span
              className={`text-${
                marketData.rsi_signal === 'BUY' ? 'success' : marketData.rsi_signal === 'SELL' ? 'danger' : 'secondary'
              } fw-bold`}
            >
              {marketData.rsi_signal || ''}
            </span>
          </p>
        </div>
      </div>

      {/* Prediction Section */}
      <div className="card my-4">
        <div className="card-header bg-warning text-white">Predict Future Prices</div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="predictionType" className="form-label">
              Prediction Type:
            </label>
            <select
              id="predictionType"
              className="form-select"
              value={predictionType}
              onChange={e => setPredictionType(e.target.value)}
            >
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="predictionValue" className="form-label">
              {predictionType === 'days' ? 'Number of Days:' : 'Number of Hours:'}
            </label>
            <input
              type="number"
              id="predictionValue"
              className="form-control"
              value={predictionValue}
              onChange={e => setPredictionValue(Number(e.target.value))}
              min="1"
            />
          </div>
          <button className="btn btn-primary" onClick={fetchPrediction}>
            Predict
          </button>
          {currentPrice && (
            <div className="mt-3">
              <h5>Current Price:</h5>
              <p>${currentPrice.toFixed(2)}</p>
            </div>
          )}
          {predictedPrices.length > 0 && (
            <div className="mt-3">
              <h5>Future Predicted Prices ({predictionType}):</h5>
              <ul>
                {predictedPrices.map((price, index) => (
                  <li key={index}>
                    {predictionType === 'days' ? `Day ${index + 1}` : `Hour ${index + 1}`}: ${price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">Adjust SMA Periods</div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="smaShort" className="form-label">
                  Short SMA Period (Days):
                </label>
                <input
                  type="number"
                  id="smaShort"
                  className="form-control"
                  value={smaShort}
                  onChange={e => setSmaShort(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="smaLong" className="form-label">
                  Long SMA Period (Days):
                </label>
                <input
                  type="number"
                  id="smaLong"
                  className="form-control"
                  value={smaLong}
                  onChange={e => setSmaLong(Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">Select Currency Pair</div>
            <div className="card-body">
              <label htmlFor="currencyPair" className="form-label">
                Currency Pair:
              </label>
              <select
                id="currencyPair"
                className="form-select"
                value={currencyPair}
                onChange={e => setCurrencyPair(e.target.value)}
              >
                {currencyPairs.map(pair => (
                  <option key={pair.symbol} value={pair.symbol}>
                    {pair.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
