const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Split query parameters
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(PUBLIC_DIR, decodeURIComponent(urlPath));

    // If it's root, serve index.html
    if (urlPath === '/') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    // Function to check and serve the file
    const tryServe = (p) => {
        fs.stat(p, (err, stats) => {
            if (!err && stats.isFile()) {
                const ext = path.extname(p).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(p).pipe(res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>');
            }
        });
    };

    // Check if path has an extension
    if (path.extname(filePath)) {
        tryServe(filePath);
    } else {
        // Clean URL: check if filePath + '.html' exists
        const htmlFilePath = filePath + '.html';
        fs.stat(htmlFilePath, (err, stats) => {
            if (!err && stats.isFile()) {
                tryServe(htmlFilePath);
            } else {
                // Check if directory index exists (e.g. /3d-printing-ads/ -> /3d-printing-ads/index.html)
                const indexFilePath = path.join(filePath, 'index.html');
                tryServe(indexFilePath);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
