import database from "../lib/database";

export default function test () {
    database.query("SELECT * FROM users;").then(console.log);
}
