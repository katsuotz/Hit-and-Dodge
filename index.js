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
        console.log(msg)
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
                    speed: 1.5,
                    rotate: 0,
                },
                interval: null,
                ready: false,
            };

        data[msg.room].users[this.id] = {
            id: this.id,
            name: msg.name,
            hp: 5,
            clientId: msg.clientId,
        };
        data[msg.room].total_user++;

        connected(msg.room, this.id);
    });

    function connected(room, id = null) {
        io.to(room).emit('connected', {
            status: 'success',
            data: data[socket.room_id],
            player: data[socket.room_id].users[id] || {},
        });
    }

    socket.on('ready', function () {
        data[socket.room_id].users[this.id].ready = true;

        let users = data[socket.room_id].users;

        let total_ready = 0;

        for (let k in users) {
            let user = users[k];
            total_ready += user.ready ? 1 : 0;
        }

        if (total_ready === data[socket.room_id].total_user && !data[socket.room_id].interval && data[socket.room_id].total_user > 1) {
            data[socket.room_id].ready = true;

            io.to(socket.room_id).emit('start-game', {
                status: 'success',
                data: data[socket.room_id],
            });

            data[socket.room_id].interval = setInterval(() => {
                render(data[socket.room_id]);
            }, 1000 / 60);
        }
    });

    function render(data) {
        if (data) {
            let d = data;
            d.ball.angle += d.ball.to_right ? d.ball.speed : -d.ball.speed;
            d.ball.rotate += d.ball.to_right ? d.ball.speed * 3 : -d.ball.speed * 3;

            io.to(socket.room_id).emit('render', {
                status: 'success',
                data: data,
            });
        }
    }

    socket.on('hitting', function (msg) {
        data[socket.room_id].users[msg.id].hitting = true;

        setTimeout(() => {
            data[socket.room_id].users[msg.id].hitting = false;
        }, 500);
    });
    socket.on('hit', function (msg) {
        data[socket.room_id].ball.to_right = data[socket.room_id].ball.to_right !== true;
        data[socket.room_id].ball.speed += .2;
    });
    socket.on('dodge', function (msg) {
        data[socket.room_id].users[msg.id].dodging = true;

        setTimeout(() => {
            if (data[socket.room_id]) data[socket.room_id].users[msg.id].dodging = false;
        }, 500);
    });

    socket.on('got-hit', function (msg) {
        data[socket.room_id].ball.speed = 1;
        data[socket.room_id].users[this.id].hp--;

        gameOver();
    });

    function gameOver() {
        let die = 0;
        let total_user = 0;

        let users = data[socket.room_id].users;

        let winner = null;

        for (let k in users) {
            let user = users[k];
            total_user++;
            die += user.hp ? 0 : 1;
            if (user.hp > 0)
                winner = user;
        }

        if (die >= total_user - 1) {
            console.log('gg');
            clearInterval(data[socket.room_id].interval);
            data[socket.room_id].interval = null;
            render(data[socket.room_id]);
            delete data[socket.room_id];

            socket.to(socket.room_id).emit('game-over', {
                status: true,
                data: {
                    winner: winner.name,
                }
            });

            return true;
        }

        return false;
    }

    socket.on('disconnecting', function () {
        if (data[socket.room_id]) {
            if (!data[socket.room_id].ready) {
                delete data[socket.room_id].users[this.id];
                data[socket.room_id].total_user--;
            } else {
                console.log(data[socket.room_id].users[this.id])
                data[socket.room_id].users[this.id].hp = 0;
                if (gameOver()) return 0;
            }

            // connected(socket.room_id);

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