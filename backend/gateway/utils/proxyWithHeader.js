import { createProxyMiddleware as proxy } from "http-proxy-middleware";

export const proxyWithHeader = (serviceUrl, options = {}) => {
  return proxy({
    target: serviceUrl,
    changeOrigin: true,

    ...options,

    on: {
      ...options.on,

      proxyReq: (proxyReq, srcReq) => {
        if (srcReq.user) {
          proxyReq.setHeader("x-user-id", srcReq.user.userId);
        }

        if (options.on?.proxyReq) {
          options.on.proxyReq(proxyReq, srcReq);
        }
      },
    },
  });
};