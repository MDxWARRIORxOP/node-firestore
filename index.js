const firebase = require("firebase-admin/app");
const firestore = require("firebase-admin/firestore");

let app;
let db;

/**
 * @typedef {Object} firebaseConfig
 * @property {String} type
 * @property {String} project_id
 * @property {String} private_key_id
 * @property {String} private_key
 * @property {String} client_email
 * @property {String} client_id
 * @property {String} auth_uri
 * @property {String} token_uri
 * @property {String} auth_provider_x509_cert_url
 * @property {String} client_x509_cert_url
 */

/**
 * @param {firebaseConfig} config Your Firebase service account config
 */
const initialize = async (config) => {
  if (!app || !db) {
    app = await firebase.initializeApp({
      credential: firebase.cert(config),
    });

    db = await firestore.getFirestore(app);
  }
};

/**
 *  @param {String} collectionName name of the collection to add data to.
 *  @param {String} docName name of the document to add data to.
 *  @param {{}} dataObj JS object, the data to add to the document.
 *  @returns {Boolean} true if successful or false
 *  @example await addData("users", "test", {hello: "world"})
 **/
const addData = async (collectionName, docName, dataObj) => {
  if (!app || !db) {
    throw new Error(
      "Firebase is not initialized. Please initialize firebase before trying to access any of its service."
    );
  }

  try {
    const dataRef = await db.collection(collectionName).doc(docName);
    await dataRef.set(dataObj);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * @returns data if all is successful, or false
 *  @param {String} collectionName name of the collection to get a doc from.
 *  @param {String} docName name of the doc ot get data from.
 *  @example const data = await getData("users", "Kingerious")

 **/
const getData = async (collectionName, docName) => {
  if (!app || !db) {
    throw new Error(
      "Firebase is not initialized. Please initialize firebase before trying to access any of its service."
    );
  }

  try {
    const dataRef = db.collection(collectionName).doc(docName);
    const doc = await dataRef.get();
    if (!doc.exists) {
      return false;
    } else {
      return doc.data();
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * @returns {Boolean} true if all is successful, or false
 * @param {String} collectionName The name of the collection
 * @param {String} docName The name of teh document
 * @example await deleteData("cities", "LA")
 * @remarks Doesn't delete sub collections.
 */
const deleteData = async (collectionName, docName) => {
  if (!app || !db) {
    throw new Error(
      "Firebase is not initialized. Please initialize firebase before trying to access any of its service."
    );
  }

  try {
    await db.collection(collectionName).doc(docName).delete();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const deleteBatches = async (query) => {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    return true;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteBatches(query);
  });
};

/**
 * @param {String} collectionName The name of the collection to delete
 * @param {Number} batchSize The size of the batches to delete
 * @returns {Boolean} true is successful or false
 */
const deleteCollection = async (collectionName, batchSize) => {
  if (!app || !db) {
    throw new Error(
      "Firebase is not initialized. Please initialize firebase before trying to access any of its service."
    );
  }

  try {
    const collectionRef = await db.collection(collectionName);
    const query = await collectionRef.orderBy("__name__").limit(batchSize);

    await deleteBatches(query);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = {
  initialize,
  addData,
  getData,
  deleteData,
  deleteCollection,
};
