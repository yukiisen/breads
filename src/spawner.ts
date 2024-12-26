import cluster from "cluster";

cluster.setupPrimary({
    exec: './server.js',
    execArgv: process.argv
});

