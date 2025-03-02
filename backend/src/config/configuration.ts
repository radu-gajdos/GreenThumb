export default () => ({
    port: parseInt(process.env.PORT!, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN?.split(',') || ['<http://localhost:3000>'],
    },
  
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL!, 10) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT!, 10) || 10,
    },
  });