export interface Post {
    id: string,
    body: string,
    authorUsername: string,
    authorDisplayName: string,
    media?: string,
    likesCount: number,
    repliesCount: number,
    parent?: string,
    datePosted: Date,
    hasLiked: number,
    isMuted: number,
}
export interface User {
    username: string,
    displayName: string,
    dateCreated: Date,
    isFollowing: number,
    isMuted: number,
    isBlocked: number,
    followingCount: number,
    followersCount: number,

}