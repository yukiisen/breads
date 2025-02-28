export function createGetURL <T extends { [key: string]: unknown }>(basename: string, body: T): string {
    const res = `${basename}?${Object.keys(body).map(e => `${e}=${body[e]}`).join("&")}`;
    return res;
}