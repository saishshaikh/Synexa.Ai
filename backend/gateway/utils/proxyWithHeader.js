import { createProxyMiddleware as proxy } from "http-proxy-middleware";

export const proxyWithHeader = (serviceUrl) => {
  return proxy({
    target: serviceUrl,
    changeOrigin: true,

    on: {
      proxyReq: (proxyReq, srcReq) => {
        if (srcReq.user) {
          proxyReq.setHeader("x-user-id", srcReq.user.userId);
        }
      },
    },
  });
};