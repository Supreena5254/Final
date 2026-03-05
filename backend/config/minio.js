const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123',
});

const BUCKET_NAME = 'recipe-images';

module.exports = { minioClient, BUCKET_NAME };