import { initializeApp, App, cert, ServiceAccount } from "firebase-admin/app";
import {
  getFirestore,
  Firestore,
  DocumentData,
  Query,
} from "firebase-admin/firestore";

export type ConfigLike =
  | (ServiceAccount | string)
  | (() => ServiceAccount | string);
export type StringLike = string | (() => string);
export type NumberLike = number | (() => number);
export type DataLike = {} | (() => {});

export class DB {
  private config: string | ServiceAccount;
  private app: App;
  private db: Firestore;

  /**
   * @param {ConfigLike} config Path to the firebase service account or the config in json itself
   * @example
   * import { DB } from "node-firestore";
   *
   * const db = new DB("./firebase-key.json")
   *
   * // OR
   *
   * const db2 = new DB({
   *  clientEmail: "myClient@email.com",
   *  privateKey: "----BEGIN PRIVATE KEY-----.......-----END PRIVATE KEY-----",
   *  projectId: "myProjectId"
   * })
   */
  constructor(config: ConfigLike) {
    if (!config) {
      throw new Error("No config provided.");
    }

    this.config = typeof config == "function" ? config() : config;
    this.app = initializeApp({
      credential: cert(this.config),
    });
    this.db = getFirestore(this.app);
  }

  /**
   *  @async This function is async, so please use await/promise syntax accordingly.
   *  @param {StringLike} collectionName name of the collection to add data to.
   *  @param {StringLike} documentName name of the document to add data to.
   *  @param {DataLike} data The data to add to the document.
   * @description create a new document in the specified collection with the specified name if it doesn't already exist, then stores the data in the document
   *  @returns true if successful or false if unsuccessful.
   * @remarks Modifies the data if the document already exists.
   *  @example
   * import { DB } from "node-firestore";
   *
   * const db = new DB(config);
   * const successful = db.addData("foo", "bar", { hello: "world" });
   *
   * if (!successful) {
   *    console.error("There was an error adding data to the DB!")
   * }
   **/
  async addData(
    collectionName: StringLike,
    documentName: StringLike,
    data: DataLike
  ): Promise<boolean> {
    if (!collectionName || !documentName || !data) {
      throw new Error(
        "No collectionName or documentName or data was provided!"
      );
    }

    const colName: string =
      typeof collectionName === "function" ? collectionName() : collectionName;

    const docName: string =
      typeof documentName === "function" ? documentName() : documentName;

    const docData: {} = typeof data === "function" ? data() : data;

    try {
      const dataRef = this.db.collection(colName).doc(docName);
      await dataRef.set(docData);

      return true;
    } catch (error) {
      console.error(
        `There was an error adding data to the collection "${colName}"! error: ${error}`
      );

      return false;
    }
  }

  /**
   *  @async This function is async, so please use await/promise syntax accordingly.
   *  @param {StringLike} collectionName name of the collection to add data to.
   *  @param {StringLike} documentName name of the document to add data to.
   * @description gets data from the specified document in th specified collection.
   *  @returns data if successful or false if unsuccessful
   *  @example
   * import { DB } from "node-firestore";
   *
   * const db = new DB(config);
   *
   * const data = db.getData("foo", "bar");
   *
   * if (!data) {
   *  console.error("There was an error retrieving data from the DB!")
   * }
   **/
  async getData(
    collectionName: StringLike,
    documentName: StringLike
  ): Promise<DocumentData | false> {
    const colName: string =
      typeof collectionName === "function" ? collectionName() : collectionName;

    const docName: string =
      typeof documentName === "function" ? documentName() : documentName;

    try {
      const dataRef = this.db.collection(colName).doc(docName);
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
   * @returns true if successful, or false if unsuccessful
   * @param collectionName The name of the collection
   * @param documentName The name of the document
   * @description deleted the specified document in the specified collection
   * @example
   * import { DB } from "node-firestore";
   *
   * const db = new DB(config);
   *
   * const deleteSuccess = db.deleteDocument("foo",
   * bar)
   *
   * if (!deleteSuccess) {
   *  console.error("There was an error deleting a document!");
   * }
   */
  async deleteDocument(
    collectionName: StringLike,
    documentName: StringLike
  ): Promise<Boolean> {
    const colName: string =
      typeof collectionName === "function" ? collectionName() : collectionName;

    const docName: string =
      typeof documentName === "function" ? documentName() : documentName;

    try {
      await this.db.collection(colName).doc(docName).delete();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async deleteBatches(query: Query) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      return true;
    }

    // Delete documents in a batch
    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
      this.deleteBatches(query);
    });
  }

  /**
   * @async This function is async, so please use await/promise syntax accordingly.
   * @param collectionName The name of the collection to delete
   * @param batchSize The size of the batches to delete
   * @description deletes the specified collection
   * @returns true is successful or false if unsuccessful
   * @example
   * import { DB } from "node-firestore";
   *
   * const db = new DB(config);
   * const deleteCollectionSuccess = db.deleteCollection("foo");
   *
   * if (!deleteCollectionSuccess) {
   *  console.error("There was an error deleting a collection!")
   * }
   */
  async deleteCollection(
    collectionName: StringLike,
    batchSize: NumberLike = 5
  ): Promise<Boolean> {
    const colName =
      typeof collectionName === "function" ? collectionName() : collectionName;

    const batch = typeof batchSize === "function" ? batchSize() : batchSize;

    try {
      const collectionRef = await this.db.collection(colName);
      const query = await collectionRef.orderBy("__name__").limit(batch);

      await this.deleteBatches(query);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
