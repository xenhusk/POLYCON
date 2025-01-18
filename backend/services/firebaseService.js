const { db } = require('../config/firebase');

const saveConsultation = async (data) => {
  const docRef = db.collection('consultations').doc();
  await docRef.set(data);
  return docRef.id;
};

module.exports = { saveConsultation };
