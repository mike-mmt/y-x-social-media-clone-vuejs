export interface Post {
    id: string,
    body: string,
    authorUsername: string,
    authorDisplayName: string,
    media?: string,
    likesCount?: number,
    repliesCount?: number,
    parent?: string,
    datePosted: Date,
    liked: boolean,
}
export interface User {
    username: string,
    displayName: string,
    dateCreated: Date,
    following?: User[],
    muted?: User[],
    blocked?: User[],
}