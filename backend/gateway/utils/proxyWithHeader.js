import { createProxyMiddleware as proxy } from "http-proxy-middleware";

export const proxyWithHeader = (serviceUrl, options = {}) => {
    return proxy({
        target: serviceUrl,
        changeOrigin: true,

        ...options,

        on: {
            ...options.on,

            proxyReq: (proxyReq, srcReq) => {
                console.log("🔄 Proxy request:", srcReq.method, srcReq.originalUrl);
                console.log("👤 x-user-id:", srcReq.user?.userId);
                console.log("🎯 TARGET:", serviceUrl);

                if (srcReq.user) {
                    proxyReq.setHeader(
                        "x-user-id",
                        srcReq.user.userId
                    );
                }

                console.log(
                    "➡️ Forwarding to:",
                    proxyReq.path
                );

                if (options.on?.proxyReq) {
                    options.on.proxyReq(proxyReq, srcReq);
                }
            },

            proxyRes: (proxyRes, req) => {
                console.log(
                    "✅ Agent response:",
                    proxyRes.statusCode,
                    req.originalUrl
                );
            },

            error: (err, req, res) => {
                console.error(
                    "❌ PROXY ERROR:",
                    err.message
                );

                console.error(
                    "❌ URL:",
                    req.originalUrl
                );

                console.error(
                    "❌ TARGET:",
                    serviceUrl
                );
            },
        },
    });
};