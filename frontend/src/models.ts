export interface Post {
    id: string,
    body: string,
    author: User,
    media?: string,
    likesCount: number,
    repliesCount: number,
    parent?: Post,
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