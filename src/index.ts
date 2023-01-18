import { initializeApp, App, cert, ServiceAccount } from "firebase-admin/app";
import {
  getFirestore,
  Firestore,
  DocumentData,
  Query,
} from "firebase-admin/firestore";

let app: App;
let db: Firestore;

export const initialize = async (config: ServiceAccount) => {
  if (!app || !db) {
    app = await initializeApp({
      credential: cert(config),
    });

    db = await getFirestore(app);
  }
};

/**
 *  @async This function is async, so please use await/promise syntax accordingly.
 *  @param collectionName name of the collection to add data to.
 *  @param docName name of the document to add data to.
 *  @param  dataObj JS object, the data to add to the document.
 *  @returns true if successful or false when unsuccessfull
 *  @example
 * import { addData } from "node-firestore";
 * await addData("cities", "LA", { hello: "world" })
 **/
export async function addData(
  collectionName: string,
  docName: string,
  dataObj: {}
): Promise<Boolean> {
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
}

/**
 *  @async This function is async, so please use await/promise syntax accordingly.
 *  @returns data if all is successful, or false
 *  @param collectionName name of the collection to get a doc from.
 *  @param docName name of the doc ot get data from.
 *  @example
 * import { getData } from "node-firestore";
 * const data = await getData("cities", "LA");
 **/
export async function getData(
  collectionName: string,
  docName: string
): Promise<DocumentData | Boolean> {
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
}

/**
 * @async This function is async, so please use await/promise syntax accordingly.
 * @returns true if all is successful, or false if unsuccessful
 * @param collectionName The name of the collection
 * @param docName The name of teh document
 * @remarks Doesn't delete sub collections.
 * @example
 * import { deleteDocument } from "node-firestore";
 * await deleteDocument("cities", "LA");
 */
export async function deleteDocument(
  collectionName: string,
  docName: string
): Promise<Boolean> {
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
}

const deleteBatches = async (query: Query) => {
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
 * @async This function is async, so please use await/promise syntax accordingly.
 * @param collectionName The name of the collection to delete
 * @param batchSize The size of the batches to delete
 * @returns true is successful or false if unsuccessful
 * @example
 * import { deleteCollection } from "node-firestore";
 * deleteCollection("cities", 5);
 */
export async function deleteCollection(
  collectionName: string,
  batchSize: number
): Promise<Boolean> {
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
}
