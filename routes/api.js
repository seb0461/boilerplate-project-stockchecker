'use strict';

module.exports = function (app) {
  const stockLikes = {}; // Stores stock like counts and IPs
  
  async function getStockPriceFromProxy(symbol) {
    const proxyUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) return null; // Return null on non-OK HTTP status
      const data = await response.json();
      if (data && typeof data.latestPrice === 'number') return data.latestPrice.toFixed(2);
      return null; // Return null if price data is not found or not a number
    } catch (error) {
      // Catch network or JSON parsing errors
      return null;
    }
  } 

  // app.route('/api/stock-prices')
  //   .get(function (req, res){
      
  //   });
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let stockSymbols = req.query.stock; // Get stock symbol(s) from query (e.g., ?stock=AAPL)
      const like = req.query.like === 'true'; // Check if 'like=true' is in query
      const ipAddress = req.ip; // Get the client's IP address for unique liking

      // Input validation: Ensure stock symbol is provided
      if (!stockSymbols) {
        return res.status(400).json({ error: 'No stock symbol provided.' });
      }

      // Normalize stockSymbols to always be an array
      if (!Array.isArray(stockSymbols)) {
        stockSymbols = [stockSymbols];
      }

      // Input validation: Limit to a maximum of 2 stock symbols per request
      if (stockSymbols.length > 2) {
        return res.status(400).json({ error: 'Maximum of 2 stock symbols allowed.' });
      }

      const results = [];
      // Process each stock symbol
      for (const symbol of stockSymbols) {
        const cleanedSymbol = symbol.toUpperCase().trim(); // Clean and standardize symbol
        const price = await getStockPriceFromProxy(cleanedSymbol); // Fetch price

        // Initialize likes for a stock if it's new
        if (!stockLikes[cleanedSymbol]) {
          stockLikes[cleanedSymbol] = { count: 0, ips: new Set() };
        }

        // Increment likes only if 'like' is true and IP hasn't liked this stock before
        if (like && !stockLikes[cleanedSymbol].ips.has(ipAddress)) {
          stockLikes[cleanedSymbol].count++;
          stockLikes[cleanedSymbol].ips.add(ipAddress);
        }

        // Prepare stock data object
        const stockData = {
          stock: cleanedSymbol,
          price: price,
          likes: stockLikes[cleanedSymbol].count
        };

        // Add an error message if price could not be fetched and remove the price field
        if (price === null) {
            stockData.error = 'Could not fetch price.';
            delete stockData.price;
        }

        results.push(stockData);
      }

      // Send response based on number of stocks requested
      if (results.length === 1) {
        res.json({ stockData: results[0] });
      } else {
        res.json({ stockData: results });
      }
    });
    
};
