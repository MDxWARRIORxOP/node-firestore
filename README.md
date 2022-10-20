# <h1 align="center">Node Firestore</h1>

<p align="center">Using Firestore made easy!</p>

## <h1>Functions</h1>

```js

const firestore = require("node-firestore");

// Initialize the DB, very important.
await firestore.initialize();

// Add data to the DB.

const success = firestore.addData("collectionName", "documentName", { your: "data" });

// checkout allowed data 

// if wasnt successful
if (!success) {
  console.error(); // "There was an error please try again later."
}

// Read data from the DB.

const data = firestore.getData("collectionName", "documentName");

if (!data) {
  console.error(); // "Data not found"
} else {
  console.log(data); //=> { your: "data" }
}

// Delete data on DB.

const success = firestore.deleteData("collectionName", "documentName");

if (!success) {
  console.error(); // "Couldn't delete data."
}

// Delete collection on DB

const success = firestore.deleteCollection("collectionName", 10);

if (!success) {
  console.error(); // "Couldn't delete collection."
}
```
