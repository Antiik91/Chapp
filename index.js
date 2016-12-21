var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
io.on('connection', function(socket) {
    ;
    console.log('a user is connected');
    socket.on("setUsername", function(data){
       if(clients.indexOf(data) > -1) {
           clients.push(data);
           socket.emit('userSet', {username: data});
       }
       else {
           socket.emit('userExists', data + 'Valitettavasti käyttäjänimi on jo varattu :()')
       }
    });
    io.sockets.emit('broadcast', {description: ' user joined in channel'});

    socket.on('disconnect', function(){
        console.log('user disconnected');
        io.sockets.emit('broadcast', {description: ' user left from channel'});
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        console.log('viesti ' + msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
