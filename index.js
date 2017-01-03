var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var clients = [];
io.sockets.on('connection', function(socket) {
    console.log('a user is connected');
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

    socket.on('join', function(channel, ack) {
       socket.get('channel', function(err,oldChannel){
         if(oldChannel) {
             socket.leave('oldChannel');
         }
         socket.set('channel', channel, function() {
            socket.join(channel);
            ack();
         });
       });
    });
    socket.on('disconnect', function(data){
        var u =  clients.indexOf(data);
        clients.splice(u, 1);
        console.log(' user disconnected');
        io.sockets.emit('broadcast', {description: 'Käyttäjä lähti kanavalta'});
    });
    socket.on('chat message', function(user, data, ack){
        socket.get('channel', function(err,channel){
            if(err) {
                socket.emit('error',err);
            }
            else if(channel) {
               io.socket.broadcast.to(channel).emit('broadcast', {description: user +": "+ data});
               ack();
            } else {
                socket.emit('error', 'Ei kanavaa valittuna');
                console.log('Something happened in chat message section.');
            }
        });

//        console.log('viesti ' + user + " "+ data);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
