export function checkUsername (name: string) {
    const reg = /[^0-9a-zA-Z._]/gi;
    const reg2 = /[a-zA-z]/gi;

    if (!name) return false;

    return !reg.test(name) && reg2.test(name);
}

export async function login ({ username, password }: loginInput) {
    const body = JSON.stringify({ username, password });
    const res = await fetch('/api/login', {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            'content-length': body.length.toString()
        },
        body: body
    });
    
    const re: { Authenticated: boolean } = JSON.parse(await res.text());
    if (re.Authenticated) location.pathname = '/home';

    return re.Authenticated;
}