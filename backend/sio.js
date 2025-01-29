import {Server} from 'socket.io';

let sio = new Server();

export const setupSio = (server) => {
    sio = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
    });
    sio.on("connection", (socket) => {
        console.log("New sio connection");
    });
};

export const broadcastPostNewReply = async (postId, newReply) => {
    sio.emit(`newReplyUnderPost:${postId}`, newReply);
    // console.log(`SIO: emitting new reply to post ${postId}`);
}

export const broadcastPostLike = async (postId, username) => {
    sio.emit(`postLike:${postId}`, username);
    // console.log(`SIO: emitting like to post ${postId}`);
}

export const broadcastPostUnlike = async (postId, username) => {
    sio.emit(`postUnlike:${postId}`, username);
    // console.log(`SIO: emitting like to post ${postId}`);
}

export const broadcastUserNotification = async (username, notification) => {
    sio.emit(`notification:${username}`, notification);
    // console.log(`SIO: emitting notification to ${username}`);
}

export const broadcastUserPostReplyNotification = async (username, post, reply) => {
    await broadcastUserNotification(username, {
        type: 'yourPostReply',
        post: post,
        reply: reply
    })
}

export const broadcastUserPostLikeNotification = async (username, post, liker) => {
    await broadcastUserNotification(username, {
        type: 'yourPostLike',
        post: post,
        liker: liker
    })
}

export const broadcastFollowNotification = async (username, follower) => {
    await broadcastUserNotification(username, {
        type: 'newFollower',
        follower: follower
    })
}
