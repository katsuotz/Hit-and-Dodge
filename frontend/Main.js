class Main {
    constructor() {
        this.circleR = 180;
        this.circleX = 0;
        this.circleY = 0;
        this.users = {};
        this.total_user = 0;

        this.ball = {};
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

    drawPlatform() {
        let circleR = this.circleR;
        let circleX = canvas.offsetWidth / 2;
        let circleY = canvas.offsetHeight / 2;

        this.circleX = circleX;
        this.circleY = circleY;

        ctx.beginPath();
        ctx.arc(circleX, circleY, circleR, 0, Math.PI * 180);
        ctx.fillStyle = "#7575F0";
        ctx.fill();
        ctx.closePath();
    }

    drawByAngle(angle) {
        let rad = angle * Math.PI / 180;

        let x = (this.circleR / 2) * 2 * Math.cos(rad) + this.circleX;
        let y = (this.circleR / 2) * 2 * Math.sin(rad) + this.circleY;

        let rectR = 100;
        ctx.save();
        ctx.beginPath();
        // ctx.rotate(rad);
        ctx.rect(x - rectR / 2, y - rectR / 2, rectR, rectR);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        return {
            x: x,
            y: y,
        }
    }

    render() {
        this.clearRect();
        this.drawPlatform();

        let i = 0;

        let users = this.users;

        for (let k in users) {
            let user = users[k];
            let res = this.drawByAngle(360 * i / this.total_user);
            user.x = res.x;
            user.y = res.y;
            i++;
        }

        this.drawBall();
    }


    drawBall() {
        let rad = this.ball.angle * Math.PI / 180;

        let circleRBall = this.circleR + 50;

        let ball_x = (circleRBall / 2) * 2 * Math.cos(rad) + this.circleX;
        let ball_y = (circleRBall / 2) * 2 * Math.sin(rad) + this.circleY;

        let r = 20;

        ctx.beginPath();
        ctx.arc(ball_x, ball_y, r, 0, Math.PI * 180);
        ctx.fillStyle = "#F07575";
        ctx.fill();
        ctx.closePath();
    }
}