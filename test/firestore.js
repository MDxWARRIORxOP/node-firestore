const firestore = require("..");
const key = require("./firebase-key.json");

const test = async () => {
  const time = new Date().getTime();
  await firestore.initialize(key);

  await firestore.addData("hello", "hey", { hello: "world" });
  console.log("added data!");

  const data = await firestore.getData("hello", "hey");
  console.log("Data:", data);

  await firestore.deleteData("hello", "hey");
  console.log("deleted data!");

  await firestore.deleteCollection("hello", 10);
  console.log("deleted collection!");

  const timeEnd = new Date().getTime() - time;
  console.log(
    "Time taken for adding, reading and deleting data:",
    timeEnd / 1000 + "s"
  );
};

test();
