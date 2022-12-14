class Main {
    constructor() {
        this.circleR = 300;
        this.circleX = 0;
        this.circleY = 0;
        this.users = {};
        this.total_user = 0;

        this.ball = {};

        this.ball_image = new Image();
        this.ball_image.src = 'assets/star.png';

        this.player = null;
        this.ready = false;
    }

    init(users, total_user, ball) {
        this.users = users;
        this.total_user = total_user;
        this.ball = ball;

        this.render();
    }

    clearRect() {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    }

    render() {
        this.clearRect();
        this.drawPlatform();

        let i = 0;

        let users = this.users;

        for (let k in users) {
            let user = users[k];
            if (user.hp > 0) {
                let res = this.drawPlayer(360 * i / this.total_user + 180, user);
                user.x = res.x;
                user.y = res.y;

                $(`.player-${i + 1} .player-health > span`).addClass('lost');
                for (let j = 0; j < user.hp; j++) {
                    $(`.player-${i + 1} .player-health > span:nth-child(${j + 1})`).removeClass('lost');
                }
            } else {
                $(`.player-${i + 1}`).addClass('lost');
                $(`.player-${i + 1} .player-health > span`).addClass('lost');
            }
            i++;
        }

        this.drawBall();

        this.doHit();

        let player = this.users[this.player.id];

        if (player.hp > 0) {
            let rectW = (player.dodging ? 60 : 140) / 2;
            let rectH = 80 / 2;

            if (!player.dodging && !player.hitting && !this.player_get_hit && this.checkBallCollision({
                x1: player.x - rectW,
                y1: player.y - rectH,
                x2: player.x + rectW,
                y2: player.y + rectH,
            })) {
                this.player_get_hit = true;
                collidedWithBall();
            } else if (this.player_get_hit) {
                let player_radius = 80;

                if (!this.checkBallCollision({
                    x1: player.x - player_radius,
                    y1: player.y - player_radius,
                    x2: player.x + player_radius,
                    y2: player.y + player_radius,
                })) {
                    this.player_get_hit = false;
                }
            }
        }
    }

    drawPlatform() {
        let circleR = this.circleR;
        let circleX = canvas.offsetWidth / 2;
        let circleY = canvas.offsetHeight / 2;

        this.circleX = circleX;
        this.circleY = circleY;

        ctx.beginPath();
        ctx.arc(circleX, circleY, circleR, 0, Math.PI * 180);
        ctx.fillStyle = "#fce000";
        ctx.fill();
        ctx.closePath();
    }

    drawPlayer(angle, user) {
        let rad = angle * Math.PI / 180;

        let x = (this.circleR / 2) * 2 * Math.cos(rad) + this.circleX;
        let y = (this.circleR / 2) * 2 * Math.sin(rad) + this.circleY;
        let rectW = user.dodging ? 60 : 140;
        let rectH = 80;

        // ctx.beginPath();
        // ctx.rect(x, y, rectR, rectR);
        // ctx.fillStyle = "#f00";
        // ctx.fill();
        // ctx.closePath();

        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(rad);
        ctx.rect(-200 / 2, -200 / 2, 200, 200);
        ctx.fillStyle = user.hitting ? "#0f0" : "#f00";
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(rad);
        ctx.rect(-rectW / 2, -rectH / 2, rectW, rectH);
        ctx.fillStyle = user.id === this.player.id ? "#00f" : "#000";
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        return {
            x: x,
            y: y,
        }
    }

    drawBall() {
        let rad = this.ball.angle * Math.PI / 180;
        let rotate = this.ball.rotate * Math.PI / 180;

        let circleRBall = this.circleR + 60;

        this.ball.x = (circleRBall / 2) * 2 * Math.cos(rad) + this.circleX;
        this.ball.y = (circleRBall / 2) * 2 * Math.sin(rad) + this.circleY;

        this.ball.r = 35;

        ctx.save();
        ctx.beginPath();
        ctx.translate(this.ball.x, this.ball.y);
        ctx.rotate(rotate);
        ctx.drawImage(this.ball_image, -this.ball.r / 2, -this.ball.r / 2, this.ball.r, this.ball.r);
        // ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 180);
        // ctx.fillStyle = "#FFF";
        // ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    hit() {
        if (!this.hitting && !this.player_get_hit) {
            this.hitting = true;
            playerHitting();

            setTimeout(() => {
                this.hitting = false;
            }, 500);
        }
    }

    dodge() {
        if (!this.dodging) {
            this.dodging = true;
            playerDodge();

            setTimeout(() => {
                this.dodging = false;
            }, 500);
        }
    }

    doHit() {
        if (!this.player_get_hit) {
            let player = this.users[this.player.id];

            let player_radius = 80;

            if (this.hitting && !this.ball_got_hit) {
                if (this.checkBallCollision({
                    x1: player.x - player_radius,
                    y1: player.y - player_radius,
                    x2: player.x + player_radius,
                    y2: player.y + player_radius,
                })) {
                    this.ball_got_hit = true;
                    playerHit();
                }
            }

            if (this.ball_got_hit) {
                if (!this.checkBallCollision({
                    x1: player.x - player_radius,
                    y1: player.y - player_radius,
                    x2: player.x + player_radius,
                    y2: player.y + player_radius,
                })) {
                    setTimeout(() => {
                        this.ball_got_hit = false;
                    }, 200);
                }
            }
        }
    }

    checkBallCollision(player) {
        let ball = this.ball;

        return (
            ball.x + ball.r > player.x1 && ball.y + ball.r > player.y1 &&
            ball.x - ball.r < player.x2 && ball.y - ball.r < player.y2
        );
    }
}