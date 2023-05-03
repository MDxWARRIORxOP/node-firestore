import { DB } from "../src/index";
import { join, dirname } from "path";
// import { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new DB(join(__dirname, "./firebase-key.json"));

describe("Testing the addData function", () => {
  it("Should return a boolean", async () => {
    expect(
      await db.addData("foo", "bar", {
        hello: "world",
      })
    ).toBe(true);
  });
});

describe("testing the getData function", () => {
  it("Should return the data or a boolean", async () => {
    expect(await db.getData("foo", "bar")).toStrictEqual({ hello: "world" });
  });
});

describe("testing the deleteData function", () => {
  it("Should return a boolean", async () => {
    expect(await db.deleteDocument("foo", "bar")).toBe(true);
  });
});

describe("testing the deleteCollection function", () => {
  it("Should return a boolean", async () => {
    expect(await db.deleteCollection("foo")).toBe(true);
  });
});
