import { createClient } from "redis";

async function main () {
    const client = await createClient().connect();
    console.log("connected!");

    client.set("Tobi", "Blyat!");

    const res = await client.get("Tobi");

    console.log(res);

    client.del("Tobi");
}

main();