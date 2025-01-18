const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

const uploadAudio = async (file) => {
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream();

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      // Return the GCS URI (gs:// format) instead of HTTP URL
      resolve(`gs://${bucket.name}/${blob.name}`);
    });

    blobStream.on('error', (err) => reject(err));

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadAudio };
