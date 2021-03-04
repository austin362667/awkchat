const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!")
})

io.on('connection', socket => {
    //Get the chatID of the user and join in a room of the same name
    chatID = socket.handshake.query.chatID
    socket.join(chatID)
    console.log('One connect!')

    //Leave the room if the user closes the socket
    socket.on('disconnect', () => {
        socket.leave(chatID)
        console.log('One disconnect!')
    })

    //Send message to only a particular user
    socket.on('send_message', message => {
        receiverChatID = message.receiverChatID
        senderChatID = message.senderChatID
        content = message.content

        //Send message to only that particular id
        socket.in(receiverChatID).emit('receive_message', {
            'content': content,
            'senderChatID': senderChatID,
            'receiverChatID':receiverChatID,
        })
        console.log(senderChatID,'-', receiverChatID, ': ', contcnt)
    })
});

http.listen(3000)
console.log('Server on!!!')