import "source-map-support/register";
import chalk from "chalk";
import winston from "../lib/logger";

import { test1, test2, test3, test4 } from "./ObjectMatchTest";
//import test from "./database";
import { main as m } from "./sharp-test";

winston.initialize('./logs/info.log', './logs/errors.log');

function main () {
    console.log(chalk.blueBright("Starting Unit Tests..."));
    test1();
    test2();
    test3();
    test4();
    console.log(chalk.blueBright("Starting DB Test..."));
    //test();
}

m();
//main();