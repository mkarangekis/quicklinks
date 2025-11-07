const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let urls = [];

function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', urls: urls.length });
});

app.post('/api/shorten', (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) return res.status(400).json({ error: 'URL required' });
    
    const shortCode = generateShortCode();
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${PORT}`;
    
    const urlData = {
        id: Date.now(),
        longUrl,
        shortCode,
        shortUrl: `${baseUrl}/${shortCode}`,
        created: new Date().toISOString(),
        clicks: 0
    };
    
    urls.push(urlData);
    res.json({ success: true, data: urlData });
});

app.get('/:shortCode', (req, res) => {
    const url = urls.find(u => u.shortCode === req.params.shortCode);
    if (!url) return res.status(404).send('URL not found');
    url.clicks++;
    res.redirect(301, url.longUrl);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
