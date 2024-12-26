import fs from "fs";
import path from "path";
import winston from "./logger";

const { error, info } = winston;

var Queries: {
    [queryName: string]: string
} = {};



function readQueries(fileName: string, cb?: () => void) {
    info(`Reading Queries From "${path.basename(fileName)}"`);
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        const queries = data.toString().split('--END_QUERY');
        queries.pop();
        queries.forEach(query => {
            const queryName = query.split('=> QUERY:')[0].trim().split('').splice(2).join('');
            const queryData = query.split('=> QUERY:')[1].trim();
            if (Queries[queryName]) {
                throw new Error('Duplicated Names ' + queryName);
            };
            Queries[queryName] = queryData;
        });
        info(`"${path.basename(fileName)}" Has been loaded`);
        (cb || (() => {}))();
    });
};

export function addFile(fileName: string, cb?: () => void) {
    if (fs.existsSync(fileName)) {
        if (path.extname(fileName) !== '.sql') {
            error(new Error('The Selected File Is not of Type "sql"'));
        } else {
            readQueries(fileName, cb);
        };
    } else {
        error(new Error('Cannot Find A File At ' + fileName));
    };
};

export function query(query: string) {
    return Queries[query] || '';
};

const qp = { addFile, query };

export default qp;