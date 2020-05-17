module.exports = function(io) {
  let activeSockets = [];

  // area to put name spaces
  // let nameSpaces = [];
  
  io.on("connection", socket => {
    console.log(`User connected: ${socket.id}`);
  
    const existingSocket = activeSockets.find(
      existingSocket => existingSocket === socket.id
    );
  
    if (!existingSocket) {
      activeSockets.push({name: socket.handshake.query.name, socket: socket.id});
      socket.emit("update-user-list", {
        // Check if still crashes on none left
        users: activeSockets.filter(
          existingSocket => existingSocket.socket !== socket.id
        ),
        online: activeSockets
      });
  
      let data = {
        name: socket.handshake.query.name,
        socket: socket.id
      }
  
      socket.broadcast.emit("update-user-list", {
        users: [data],
        online: activeSockets
      });
    };
  
    socket.on("call-user", (data) => {
      socket.to(data.to).emit("call-made", {
        offer: data.offer,
        socket: socket.id
      });
    });
  
    socket.on("make-answer", data => {
      socket.to(data.to).emit("answer-made", {
        socket: socket.id,
        answer: data.answer
      });
    });
  
    socket.on("reject-call", data => {
      socket.to(data.from).emit("call-rejected", {
        socket: socket.id
      });
    });
  
    socket.on("hang-up", data => {
      socket.to(data.to).emit("hang-up", {
        from: socket.id
      });
    });
  
    socket.on("disconnect", () => {
      activeSockets = activeSockets.filter(
        existingSocket => existingSocket.socket !== socket.id
      );
      socket.broadcast.emit("remove-user", {
        socketId: socket.id
      });
  
      socket.leaveAll();
  
      console.log(`User disconnected: ${socket.id}`);
    });
  
    socket.on("friend-added", data => {
      socket.to(data.to).emit("friend-request", {
        socket: socket.id
      });
    });
  
    socket.on("chat-message", data => {
      console.log(data, "HERE");
      socket.to(data.to).emit("chat-sent", {
        msg: data,
        socket: socket.id
      });
      socket.to(data.to).emit("message-notification", {
        from: data.fromName
      });
    });

    socket.on("new-to-stream", data => {
      console.log(data);
      
      // socket.broadcast.emit("add-to-stream");

      socket.to(data.to[0]).emit("add-to-stream", {
        new: data.newStream
      });

      // data.to.forEach(call => {
      //   console.log(call, "CALL");
      //   socket.to(call).emit("add-to-stream", {
      //     new: data.newStream
      //   });
      // });
    });
  });
};