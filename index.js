const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/frontend/index.html');
// });

let data = {};
let total_users = 0;

io.on('connection', function (socket) {

    socket.on('join', function (msg) {
        socket.room_id = msg.room;

        let rooms = Object.keys(socket.rooms);

        socket.join(msg.room);

        total_users++;

        if (!data[msg.room])
            data[msg.room] = {
                users: {},
                total_user: 0,
                ball: {
                    angle: 45,
                    to_right: true,
                },
                interval: null,
            };

        data[msg.room].users[this.id] = {
            name: msg.name,
        };
        data[msg.room].total_user++;

        // io.to(msg.room).emit('connected', {
        //     status: 'success',
        //     data: data[msg.room],
        // });

        if (!data[msg.room].interval) {
            data[msg.room].interval = setInterval(() => {
                let d = data[socket.room_id];

                if (d) {
                    d.ball.angle += d.ball.to_right ? 3 : -3;

                    io.to(socket.room_id).emit('connected', {
                        status: 'success',
                        data: data[socket.room_id],
                    });
                }
            }, 1000 / 60);
        }
    });

    socket.on('disconnecting', function () {
        let rooms = Object.keys(socket.rooms);

        if (data[socket.room_id]) {
            delete data[socket.room_id].users[this.id];
            data[socket.room_id].total_user--;
            if (data[socket.room_id].total_user == 0) {
                clearInterval(data[socket.room_id].interval);
                data[socket.room_id].interval = null;
                delete data[socket.room_id];
            }
        }

        io.to(socket.room_id).emit('connected', {
            status: 'success',
            data: data[socket.room_id],
        });

        console.log('disconnected');
    });

    console.log('user connected');
});

http.listen(3000, function () {
    console.log('listen on 3000');
});