const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "https://ipqualityscore.com",
            changeOrigin: true,
            pathRewrite: {
                "^/api": "",
            },
            logLevel: "debug", // Включение логов
            onProxyReq: (proxyReq) => {
                proxyReq.removeHeader("Origin"); // Удалить заголовок Origin
            },
        })
    );
};
