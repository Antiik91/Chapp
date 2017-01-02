var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
//var client;
io.on('connection', function(socket) {
    console.log('a user is connected');
    socket.on('setUsername', function(data){
       if(clients.indexOf(data) > -1) {
           socket.emit('userTaken', data + ' Valitettavasti on jo varattu');
           console.log(data +' varattu');
       }
       else {
           clients.push(data);
           socket.emit('setUser', {username: data});
           console.log(data +' Vapaana');
           io.sockets.emit('broadcast', {description: data + ' Liittyi kanavalle'});
       }
    });
    socket.on('disconnect', function(data){
        console.log('user disconnected');
        io.sockets.emit('broadcast', {description: data + '  Lähti kanavalta'});
    });
    socket.on('chat message', function(data){
        io.sockets.emit('broadcast', {description: data});
        console.log('viesti ' + data);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
