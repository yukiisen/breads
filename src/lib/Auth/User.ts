import crypto from "crypto";

function deco (constructor: Function) {
    console.log(constructor);
}

interface OnlineUser {
    new(username: string, id: number): OnlineUser
    id: number
    username: string
    token: string
    timeout?:  NodeJS.Timeout
    socket: string | null
}

// An online user structure
class OnlineUser {
    constructor (public username: string, public id: number) {
        this.token = crypto.randomBytes(16).toString('hex');
        this.timeout = undefined;
        this.socket = null;
    }

    left (Online: OnlineUser[]) {
        this.timeout = setTimeout(() => {
            let index = Online.findIndex(user => user.username == this.username);
            Online.splice(index, 1);
        }, (1000 * 60 * 2.5));
    }

    back () {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}

export default OnlineUser;