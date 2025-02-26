// Fetch data from DEXScreener API
async function fetchDexData(endpoint) {
    const response = await fetch(`https://api.dexscreener.com${endpoint}`);
    return response.json();
}

// Overview: Example with Solana trending pairs
async function loadOverview() {
    const data = await fetchDexData('/latest/dex/search?q=solana');
    const pairs = data.pairs.slice(0, 3); // Top 3 pairs
    let html = '<p>Top Solana Pairs:</p><ul>';
    pairs.forEach(pair => {
        html += `<li>${pair.baseToken.symbol}/${pair.quoteToken.symbol}: $${pair.priceUsd}</li>`;
    });
    html += '</ul>';
    document.getElementById('overview-data').innerHTML = html;
}

// Daily Trends: Tokens with high 24h volume
async function loadDailyTrends() {
    const data = await fetchDexData('/latest/dex/search?q=trending');
    const pairs = data.pairs.filter(p => p.volume.h24 > 100000).slice(0, 5);
    let html = '<ul>';
    pairs.forEach(pair => {
        html += `<li>${pair.baseToken.name}: $${pair.priceUsd} (${pair.volume.h24.toLocaleString()} 24h vol)</li>`;
    });
    html += '</ul>';
    document.getElementById('trends-data').innerHTML = html;
}

// Top Tokens: High liquidity pairs
async function loadTopTokens() {
    const data = await fetchDexData('/latest/dex/search?q=top');
    const pairs = data.pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd).slice(0, 5);
    let html = '<ul>';
    pairs.forEach(pair => {
        html += `<li>${pair.baseToken.name}: $${pair.priceUsd} (Liquidity: $${pair.liquidity.usd.toLocaleString()})</li>`;
    });
    html += '</ul>';
    document.getElementById('tokens-data').innerHTML = html;
}

// Transactions: Static example (DEXScreener doesn’t provide tx lists directly)
function loadTransactions() {
    const txs = [
        { pair: 'SOL/USDC', amount: '10 SOL', usd: '$2,000' },
        { pair: 'ETH/WETH', amount: '1 ETH', usd: '$3,500' }
    ];
    let html = '<ul>';
    txs.forEach(tx => {
        html += `<li>${tx.pair}: ${tx.amount} ($${tx.usd})</li>`;
    });
    html += '</ul>';
    document.getElementById('tx-data').innerHTML = html;
}

// DCA Checker: Calculate based on pair price history
async function checkDCA() {
    const pairAddress = document.getElementById('pair-input').value;
    const data = await fetchDexData(`/latest/dex/pairs/solana/${pairAddress}`);
    if (!data.pair) {
        document.getElementById('dca-result').innerHTML = 'Pair not found! Enter a valid Solana pair address.';
        return;
    }
    const currentPrice = parseFloat(data.pair.priceUsd);
    const investment = 100; // $100 monthly
    let totalInvested = 0, totalTokens = 0;
    // Simulate 12 months (DEXScreener doesn’t provide historical data via API, so we approximate)
    for (let i = 0; i < 12; i++) {
        const pastPrice = currentPrice * (1 - (i * 0.05)); // Assume 5% drop/month for demo
        totalInvested += investment;
        totalTokens += investment / pastPrice;
    }
    const avgPrice = totalInvested / totalTokens;
    document.getElementById('dca-result').innerHTML = `
        <p>Total Invested: $${totalInvested}</p>
        <p>Total Tokens: ${totalTokens.toFixed(4)}</p>
        <p>Avg Buy Price: $${avgPrice.toFixed(2)}</p>
        <p>Current Price: $${currentPrice.toFixed(2)}</p>
    `;
}

// Smart Money Tracker: High volume movers
async function loadSmartMoney() {
    const data = await fetchDexData('/latest/dex/search?q=volume');
    const pairs = data.pairs.sort((a, b) => b.txns.h24.buys - a.txns.h24.buys).slice(0, 3);
    let html = '<p>High Buy Activity (Whale Proxy):</p><ul>';
    pairs.forEach(pair => {
        html += `<li>${pair.baseToken.name}: ${pair.txns.h24.buys} buys (24h)</li>`;
    });
    html += '</ul>';
    document.getElementById('smart-money-data').innerHTML = html;
}

// Load all sections
window.onload = () => {
    loadOverview();
    loadDailyTrends();
    loadTopTokens();
    loadTransactions();
    loadSmartMoney();
};