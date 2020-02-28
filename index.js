const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/frontend'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/index.html');
});

let data = {};
let total_users = 0;

io.on('connection', function (socket) {

    socket.on('join', function (msg) {
        socket.room_id = msg.room;

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
                ready: false,
            };

        data[msg.room].users[this.id] = {
            id: this.id,
            name: msg.name,
            hp: 5,
        };
        data[msg.room].total_user++;

        socket.emit('connected', {
            status: 'success',
            data: data[socket.room_id],
            player: data[socket.room_id].users[this.id]
        });
    });

    socket.on('ready', function () {
        data[socket.room_id].users[this.id].ready = true;

        let users = data[socket.room_id].users;

        let total_ready = 0;

        for (let k in users) {
            let user = users[k];
            total_ready += user.ready ? 1 : 0;
        }

        if (total_ready === data[socket.room_id].total_user && !data[socket.room_id].interval) {
            data[socket.room_id].ready = true;
            data[socket.room_id].interval = setInterval(() => {
                let d = data[socket.room_id];

                if (d) {
                    d.ball.angle += d.ball.to_right ? 2 : -2;

                    io.to(socket.room_id).emit('start-game', {});

                    console.log(this.id)

                    io.to(socket.room_id).emit('render', {
                        status: 'success',
                        data: data[socket.room_id],
                    });
                }
            }, 1000 / 60);
        }
    });

    socket.on('hit', function (msg) {
        data[socket.room_id].ball.to_right = data[socket.room_id].ball.to_right !== true;
    });

    socket.on('got-hit', function (msg) {
        data[socket.room_id].users[this.id].hp--;
    });

    socket.on('disconnecting', function () {
        let rooms = Object.keys(socket.rooms);

        if (data[socket.room_id]) {
            if (!data[socket.room_id].ready) delete data[socket.room_id].users[this.id];
            data[socket.room_id].total_user--;
            if (data[socket.room_id].total_user == 0) {
                clearInterval(data[socket.room_id].interval);
                data[socket.room_id].interval = null;
                delete data[socket.room_id];
                return 0;
            }

            // if (data[socket.room_id] && data[socket.room_id].users[this.id]) {
            // io.to(socket.room_id).emit('render', {
            //     status: 'success',
            //     data: data[socket.room_id],
            //     player: data[socket.room_id].users[this.id],
            // });
            // }
        }


        console.log('disconnected');
    });

    console.log('user connected');
});

http.listen(3000, function () {
    console.log('listen on 3000');
});