declare interface ParamsDictionary {
    [key: string]: string;
}

declare type variant = {
    [key: string]: any
}

/** Request handler Types */
declare namespace BodyTypes {
    declare type singupInput = loginInput & {
        rePassword: string
        email?: string
    }

    declare type loginInput = {
        username: string
        password: string
    }
}

/** BodyRequest (a normal express request with body of type ```T```) */
declare interface BRequest<T> extends Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> {
    user?: any;
    body: T
}

declare type LoggedUser = {
    id: number
    username: string
}

// Database Types:

declare type RowDataPacket = { 
    constructor: {
        name: 'RowDataPacket'
    }
} & _RDP;

declare type _RDP = {
    [key: string]: unknown 
}

declare type RowDataPackets<T=unknown> = unknown extends T?
                                        RowDataPacket[]
                                        :
                                        T extends _RDP?
                                            (T & {constructor: { name: 'RowDataPacket'}})[]
                                            :
                                            any;

declare interface OkPacket {
    constructor: {
        name: 'OkPacket';
    }
    fieldCount: number
    affectedRows: number
    insertId: number
    serverStatus: number
    warningCount: number
    message: string
    protocol41: boolean
    changedRows: number
}

declare type BoolToBuff<T> = { [key in keyof T]: T[key] extends boolean? Buffer: T[key] }

// Object validation types:
declare type typo = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "any"

declare interface bodyStructure {
    [key: string]: typo | bodyStructure | string
}