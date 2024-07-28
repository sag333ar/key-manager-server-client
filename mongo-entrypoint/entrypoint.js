var db = connect(
  "mongodb://some-admin:some-admin-password@localhost:27017/admin"
);

const dbname = "some-db";

console.log("switching db")
db = db.getSiblingDB(dbname); // we can not use "use" statement here to switch db
console.log("switched to " + dbname);

console.log("Creating db read-write user");
db.createUser({
  user: `${dbname}-admin`,
  pwd: `${dbname}-admin-password`,
  roles: [{ role: "readWrite", db: dbname }],
  passwordDigestor: "server",
});
console.log("Created db read-write user");