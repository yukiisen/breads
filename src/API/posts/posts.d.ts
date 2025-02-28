declare type RawPost = {
    id: number
    username: string
    name: string
    verified: number
    profile: string
    content: string
    views: number
    has_media: Buffer
    quote: number
    date: Date
    likes: number
    comments: number
    reposts: number
}

declare interface PostAPIResponse extends RawPost {
    verified: boolean
    has_media: boolean
    liked: boolean
    saved: boolean
    images: ImageData[]
    mine: boolean
}

declare type UserPosts = PostAPIResponse[]

// helpers:
declare type ImageData = { postID: number } & {
    filename: string
    type: "img" | "vid"
    github: boolean
}