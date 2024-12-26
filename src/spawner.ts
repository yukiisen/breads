import "source-map-support/register";
import cluster, { Worker } from "cluster";
import os from "os";

cluster.setupPrimary({
    exec: './dist/server.js'
});

const workers: Worker[] = [];

for (let i = 0; i < os.cpus().length; i++) {
    spawnOne();
}

function spawnOne () {
    workers.unshift(cluster.fork());
    workers[0].on("exit", () => {
        console.log(`Worker died, restarting`);
        spawnOne();
    });

    console.log(`Running ${workers.filter(worker => !worker.isDead()).length} workers.`);
}