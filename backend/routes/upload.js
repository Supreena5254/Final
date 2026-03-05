const express = require('express');
const router = express.Router();
const multer = require('multer');
const { minioClient, BUCKET_NAME } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const fileBuffer = req.file.buffer;
    const contentType = req.file.mimetype;

    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, { 'Content-Type': contentType });

    const imageUrl = `http://localhost:9000/${BUCKET_NAME}/${fileName}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;