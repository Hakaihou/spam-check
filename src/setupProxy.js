const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "https://ipqualityscore.com",
            changeOrigin: true,
            headers: {
                Host: "ipqualityscore.com",
            },
            pathRewrite: {
                "^/api": "",
            },
        })
    );
};
