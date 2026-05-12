export const storageConfig = () => ({
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
    bucket: process.env.STORAGE_BUCKET || '3dprint',
    publicBaseUrl:
      process.env.STORAGE_PUBLIC_URL || 'http://localhost:9000/3dprint',
  },
});
