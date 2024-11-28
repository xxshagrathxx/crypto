import os
from flask import Flask, jsonify, request
from binance.client import Client
from flask_cors import CORS
import time
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Binance API keys (replace these with your keys)
BINANCE_API_KEY = os.environ.get('BINANCE_API_KEY', 'BKcFzzXQsfTjdb0DNiPNpjtSvXPywMgXCxiFfqrUH4uLZD9bzz3Hohh6KWwmNjX6')
BINANCE_API_SECRET = os.environ.get('BINANCE_API_SECRET', 'BKcFzzXQsfTjdb0DNiPNpjtSvXPywMgXCxiFfqrUH4uLZD9bzz3Hohh6KWwmNjX6')

# Binance client setup
client = Client(BINANCE_API_KEY, BINANCE_API_SECRET)

# Adjust for Binance server time difference
def get_time_difference():
    server_time = client.get_server_time()
    local_time = int(time.time() * 1000)
    return server_time['serverTime'] - local_time

time_diff = get_time_difference()

@app.route("/")
def home():
    return "Flask Server is Running!"

@app.route("/api/market_data", methods=["GET"])
def get_market_data():
    try:
        # Query parameters
        symbol = request.args.get('symbol', 'BTCUSDT')  # Default to BTCUSDT
        sma_short = int(request.args.get('sma_short', 5))  # Default 5
        sma_long = int(request.args.get('sma_long', 20))  # Default 20

        # Get historical data
        klines = client.get_klines(
            symbol=symbol,
            interval=Client.KLINE_INTERVAL_1DAY,
            limit=max(sma_short, sma_long)
        )

        # Extract closing prices
        closing_prices = [float(kline[4]) for kline in klines]

        # Calculate SMA
        def calculate_sma(prices, period):
            if len(prices) < period:
                return None
            return sum(prices[-period:]) / period

        sma_short_value = calculate_sma(closing_prices, sma_short)
        sma_long_value = calculate_sma(closing_prices, sma_long)

        # Determine signal
        if sma_short_value and sma_long_value:
            if sma_short_value > sma_long_value:
                signal = "BUY"
            elif sma_short_value < sma_long_value:
                signal = "SELL"
            else:
                signal = "HOLD"
        else:
            signal = "Insufficient data"

        # Response
        return jsonify({
            "symbol": symbol,
            "latest_price": closing_prices[-1],
            "sma_short": sma_short_value,
            "sma_long": sma_long_value,
            "signal": signal
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/predict", methods=["GET"])
def predict_price():
    try:
        # Query parameters
        symbol = request.args.get('symbol', 'BTCUSDT')  # Default symbol
        days = int(request.args.get('days', 1))  # Days to predict, default is 1

        # Fetch historical data
        klines = client.get_klines(
            symbol=symbol,
            interval=Client.KLINE_INTERVAL_1DAY,
            limit=100  # Use last 100 days of data
        )
        closing_prices = [float(kline[4]) for kline in klines]
        dates = np.arange(len(closing_prices)).reshape(-1, 1)

        # Prepare data for linear regression
        model = LinearRegression()
        model.fit(dates, closing_prices)
        
        # Predict prices for the next 'days'
        future_dates = np.arange(len(closing_prices), len(closing_prices) + days).reshape(-1, 1)
        predicted_prices = model.predict(future_dates)

        # Response
        return jsonify({
            "symbol": symbol,
            "predicted_prices": predicted_prices.tolist(),
            "days": days
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Adjust to deploy environment
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
