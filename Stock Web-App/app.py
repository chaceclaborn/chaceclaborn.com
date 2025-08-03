from flask import Flask, render_template, request
import requests
import json

app = Flask(__name__)

API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY'  # Replace with your actual key

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/track', methods=['POST'])
def track_stock():
    symbol = request.form['symbol'].upper()
    
    # Fetch current quote
    quote_url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}'
    quote_response = requests.get(quote_url)
    quote_data = quote_response.json().get('Global Quote', {})
    
    if not quote_data:
        return render_template('index.html', error='Invalid ticker or API error. Try again.')
    
    # Fetch historical daily data (last 100 days for chart)
    historical_url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=compact&apikey={API_KEY}'
    historical_response = requests.get(historical_url)
    historical_data = historical_response.json().get('Time Series (Daily)', {})
    
    # Prepare data for chart: dates and closing prices
    dates = list(historical_data.keys())[:100]  # Last 100 days
    dates.reverse()  # Chronological order
    closes = [float(historical_data[date]['4. close']) for date in dates[::-1]]  # Reverse to match dates
    chart_data = json.dumps({'labels': dates, 'data': closes})
    
    return render_template('quote.html', symbol=symbol, quote=quote_data, chart_data=chart_data)

if __name__ == '__main__':
    app.run(debug=True)