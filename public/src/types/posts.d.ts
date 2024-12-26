declare interface PostAPIResponse {
    id: number
    username: string
    name: string
    profile: string
    content: string
    views: number
    quote: number
    date: Date
    likes: number
    comments: number
    reposts: number
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