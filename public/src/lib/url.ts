export namespace url {
    export function current (path: string | string[]) {
        if (typeof path === "string") path = [path];
        return path.includes(location.pathname);
    }
}