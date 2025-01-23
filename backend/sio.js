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

export const broadcastNewPostReplyNotification = async (postId, newReply) => {
    sio.emit(`newReplyUnderPost:${postId}`, newReply);
    console.log(`SIO: emitting new reply to post ${postId}`);
}
