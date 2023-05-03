## <h1 align="center">Node Firestore</h1>

### <p align="center">Using Firestore made easier!</p>

## <h1>Install</h1>

```bash
npm install node-firestore
# OR
yarn add node-firestore
# OR
pnpm add node-firestore
```

## <h1>Docs</h1>

Checkout the API docs @ [mdxwarriorxop.github.io/node-firestore](https://mdxwarriorxop.github.io/node-firestore)

## <h1>Usage</h1>

```js
const { DB } = require("node-firestore");
const { join } = require("path");

//OR

import { DB } from "node-firestore";
import { join } from "node:path";

const db = new DB(join(__dirname, "./my-firebase-key.json"));

// add data to the DB.
const success = db.addData("foo", "bar", {
  hello: "world",
});

// if not successful
if (!success) {
  console.error("There was an error adding data!");
}

// read data from the DB.
const data = db.getData("foo", "bar");

if (!data) {
  console.error("Error retrieving data!");
} else {
  console.log(data); //=> { hello: "world" }
}

// delete data on the DB.
const success = db.deleteDocument("foo", "bar");

if (!success) {
  console.error("Error deleting document!");
}

// delete collection on the DB
const success = firestore.deleteCollection("foo", 5);

if (!success) {
  console.error("Error deleting collection!");
}
```
