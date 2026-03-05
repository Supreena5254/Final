/**
 * RECIPE IMAGE UPLOADER FROM LOCAL FOLDER
 * Reads images from D:\Final_Year_Project\recipe_images\
 * Uploads each to MinIO and updates image_url in PostgreSQL
 *
 * Usage: node uploadFromFolder.js
 * Run from: D:\Final_Year_Project\backend\
 */

const Minio = require('minio');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ── CONFIG ────────────────────────────────────────────────────
const IMAGE_FOLDER = 'D:\\Final_Year_Project\\recipe_images';
const BUCKET_NAME = 'recipe-images';

// ── MinIO client ──────────────────────────────────────────────
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123',
});

// ── PostgreSQL client ─────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ── Main ──────────────────────────────────────────────────────
async function uploadFromFolder() {
  console.log('🚀 Starting upload from local folder...');
  console.log(`📁 Folder: ${IMAGE_FOLDER}\n`);

  // 1. Read all image files from the folder
  const allFiles = fs.readdirSync(IMAGE_FOLDER);
  const imageFiles = allFiles.filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  console.log(`📋 Found ${imageFiles.length} image files.\n`);

  let success = 0;
  let failed = 0;
  const failures = [];

  for (const fileName of imageFiles) {
    // Extract recipe ID from filename (e.g. "14.jpg" → 14)
    const recipeId = parseInt(path.parse(fileName).name);

    if (isNaN(recipeId)) {
      console.log(`⚠️  Skipping "${fileName}" — filename is not a number`);
      continue;
    }

    const filePath = path.join(IMAGE_FOLDER, fileName);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.png' ? 'image/png'
                      : ext === '.webp' ? 'image/webp'
                      : 'image/jpeg';

    try {
      process.stdout.write(`⬆️  [${recipeId}] Uploading "${fileName}"... `);

      // 2. Read file
      const fileBuffer = fs.readFileSync(filePath);

      // 3. Upload to MinIO (always save as .jpg naming for consistency)
      const minioFileName = `recipe-${recipeId}${ext}`;
      await minioClient.putObject(
        BUCKET_NAME,
        minioFileName,
        fileBuffer,
        fileBuffer.length,
        { 'Content-Type': contentType }
      );

      // 4. Build MinIO URL
      const newUrl = `http://localhost:9000/${BUCKET_NAME}/${minioFileName}`;

      // 5. Update database
      const result = await pool.query(
        'UPDATE recipes SET image_url = $1 WHERE recipe_id = $2 RETURNING title',
        [newUrl, recipeId]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️  No recipe found with ID ${recipeId}`);
      } else {
        console.log(`✅ "${result.rows[0].title}"`);
        success++;
      }

    } catch (err) {
      console.log(`❌ FAILED — ${err.message}`);
      failed++;
      failures.push({ recipeId, fileName, error: err.message });
    }
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log(`✅ Successfully uploaded: ${success} images`);
  console.log(`❌ Failed:               ${failed} images`);

  if (failures.length > 0) {
    console.log('\nFailed files:');
    failures.forEach(({ recipeId, fileName, error }) => {
      console.log(`  - [${recipeId}] ${fileName}: ${error}`);
    });
  }

  console.log('\n🎉 Done! Check your MinIO console:');
  console.log('   http://localhost:9001  →  recipe-images bucket');

  await pool.end();
}

uploadFromFolder().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});