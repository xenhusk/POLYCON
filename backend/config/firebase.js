const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(process.env.FIREBASE_ADMIN_CREDENTIALS));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://speech-to-text-448004.firebaseio.com',
});

const db = admin.firestore();

module.exports = { admin, db };
