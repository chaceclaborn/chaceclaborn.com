# Stock Price Tracker

A professional, scalable web application for tracking real-time stock prices using the Yahoo Finance API.

## 📁 Project Structure

```
stock-tracker/
├── index.html              # Main HTML file
├── README.md              # Project documentation
├── package.json           # Node.js dependencies and scripts
├── .gitignore            # Git ignore file
├── .env.example          # Environment variables example
├── LICENSE               # Project license
│
├── css/                  # Stylesheets
│   ├── reset.css        # CSS reset for cross-browser consistency
│   ├── variables.css    # CSS custom properties (colors, spacing, etc.)
│   ├── main.css         # Main application styles
│   ├── components.css   # Reusable component styles
│   └── responsive.css   # Media queries and responsive design
│
├── js/                   # JavaScript modules
│   ├── config.js        # Configuration and constants
│   ├── api.js           # API service layer
│   ├── storage.js       # Local storage management
│   ├── utils.js         # Utility functions
│   ├── ui.js            # UI manipulation and updates
│   └── app.js           # Main application logic
│
├── assets/              # Static assets
│   ├── favicon.png      # Browser favicon
│   └── icons/           # Icon assets
│
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
│
└── docs/               # Additional documentation
    ├── API.md          # API documentation
    └── CONTRIBUTING.md # Contribution guidelines
```

## 🚀 Features

- **Real-time Stock Data**: Fetch current stock prices using Yahoo Finance API
- **Search Functionality**: Quick stock symbol search with suggestions
- **Watchlist**: Save and track multiple stocks
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Local Storage**: Persist watchlist and preferences
- **Error Handling**: Graceful error handling and user feedback
- **Performance Optimized**: Efficient API calls and caching

## 🛠️ Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **API**: Yahoo Finance API (via RapidAPI)
- **Storage**: LocalStorage API
- **Build Tools**: None (vanilla setup for simplicity)
- **Version Control**: Git

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/stock-tracker.git
cd stock-tracker
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Add your Yahoo Finance API key to `.env`:

```
YAHOO_FINANCE_API_KEY=your_api_key_here
```

4. Open `index.html` in a web browser or serve with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## 🔧 Configuration

Edit `js/config.js` to customize:

- API endpoints
- Update intervals
- Default watchlist stocks
- Cache duration
- UI preferences

## 📱 Usage

1. **Search for a Stock**: Enter a stock symbol (e.g., AAPL, GOOGL) in the search bar
2. **View Details**: Click search to see current price, change, volume, and more
3. **Add to Watchlist**: Click "Add to Watchlist" to track the stock
4. **Refresh Data**: Click the refresh button to update all stock prices
5. **Toggle Theme**: Use the theme toggle button for dark/light mode

## 🧪 Testing

Run tests using:

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See `docs/CONTRIBUTING.md` for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🙏 Acknowledgments

- Yahoo Finance for providing the stock data API
- [RapidAPI](https://rapidapi.com/) for API management
- Contributors and testers

## 📞 Support

For support, email support@stocktracker.com or open an issue in the GitHub repository.

---

**Disclaimer**: This application is for informational purposes only and should not be considered financial advice.
