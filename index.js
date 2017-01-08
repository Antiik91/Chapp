var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
io.sockets.on('connection', function(socket) {
    console.log('a user is connected');
    // Check if username is taken or not.
    socket.on('setUsername', function(data){
       if(clients.indexOf(data) > -1) {
           socket.emit('userTaken', data + ' Valitettavasti on jo varattu');
//           console.log(data +' varattu');
       } else {
           clients.push(data);
           socket.emit('setUser', {username: data});
//           console.log(data +' Vapaana');
           io.sockets.emit('broadcast', {description: data + ' Liittyi kanavalle'});
       }
    });
    // Join to room
    socket.on('join', function(channel) {
       socket.join(channel);
       console.log('user is now on ' + channel);
    });
    //leave from room
    socket.on('leave', function(channel){
       socket.leave(channel);
       console.log('user is now left from: ' + channel);
    });
    //Handling the disconnection from the server
    socket.on('disconnect', function(data){
        var u =  clients.indexOf(data);
        clients.splice(u, 1);
        console.log(' user disconnected');
        io.sockets.emit('broadcast', {description: 'Käyttäjä lähti kanavalta'});
    });
    //Handles the chat message event.
    socket.on('chat message', function(user, channel, data){
        //This currently doesn't work. channel is null
        console.log('viesti.' + channel + ': ' + data);
        socket.broadcast.to(channel).emit('broadcast', {description: user +": "+ data});

        });

    });

http.listen(3000, function() {
    console.log('listening on *:3000');
});
