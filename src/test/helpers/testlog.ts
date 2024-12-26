import chalk from "chalk";

export function success (message: string) {
    console.log();
    console.log(chalk.green.bold(message));
    console.log();
}

export function info (...data: any) {
    if (process.argv[2] == '--debug' || process.argv[2] == '-d') {
        console.log(...data);
    }
}