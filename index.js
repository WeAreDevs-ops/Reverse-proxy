const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/', createProxyMiddleware({
    target: 'https://www.incbot.site',
    changeOrigin: true,
    secure: true,
    on: {
        error: (err, req, res) => {
            console.error('Proxy error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT} -> https://www.incbot.site`);
});
