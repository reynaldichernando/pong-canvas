const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

class Ball {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // c.strokeStyle = 'red';
        // c.beginPath();
        // c.setLineDash([0]);
        // c.moveTo(0, this.y);
        // c.lineTo(canvas.width, this.y);
        // c.closePath();
        // c.stroke();
    }

    update() {
        this.draw();
        if (this.y - this.radius - 0 < 1 ||
            canvas.height - this.y - this.radius < 1) {
            this.velocity.y *= -1;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Player {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;

        this._speed = 15;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.draw();
    }

    up() {
        if (this.y < 1) return;
        else if (this.y - this._speed < 1) this.y = 0;
        else this.y -= this._speed;
    }

    down() {
        if (this.y + this.h > canvas.height) return;
        else if (this.y + this.h + this._speed > canvas.height) this.y = canvas.height - this.h;
        else this.y += this._speed;
    }
}

class Opponent extends Player {
    constructor(x, y, w, h, color) {
        super(x, y, w, h, color);
    }
}

let random = Math.random();
console.log(random);

while ((0.15 < random && random < 0.35) || (0.65 < random && random < 0.85) || random == 0.5 || random == 0) {
    random = Math.random();
}

let angle = random * Math.PI * 2;

let modifier = 5;

let ball = new Ball(canvas.width / 2, canvas.height / 2, 8, 'white', {
    x: Math.cos(angle) * modifier,
    y: Math.sin(angle) * modifier
});

let paddleWidth = 4;
let paddleHeight = 100;
let player = new Player(
    10,
    canvas.height / 2 - paddleHeight / 2,
    paddleWidth,
    paddleHeight,
    'white'
);
let opponent = new Opponent(
    canvas.width - 10 - paddleWidth,
    canvas.height / 2 - paddleHeight / 2,
    paddleWidth,
    paddleHeight,
    'white'
);

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);

    // table
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // line separator
    c.strokeStyle = 'white';
    c.setLineDash([10, 30]);
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(canvas.width / 2, 0);
    c.lineTo(canvas.width / 2, canvas.height);
    c.closePath();
    c.stroke();

    // player action
    if (keys["ArrowUp"]) player.up();
    if (keys["ArrowDown"]) player.down();

    // opponent logic
    if (ball.x > canvas.width / 2 && ball.x > ball.prevX) {
        if (ball.y <= opponent.y) opponent.up();
        else if (ball.y >= opponent.y + opponent.h) opponent.down();
    }

    // collision logic
    if (player.x + player.w > ball.x - ball.radius
        && player.x < ball.x + ball.radius
        && ball.y > player.y
        && player.y + player.h > ball.y
    ) {
        if (ball.y + ball.radius > player.y) {
            ball.x = player.x + player.w + ball.radius;
        }
        ball.velocity.x *= -1.01;
    }

    if (opponent.x < ball.x + ball.radius
        && opponent.x + opponent.w > ball.x - ball.radius
        && ball.y > opponent.y
        && opponent.y + opponent.h > ball.y
    ) {
        if (ball.y + ball.radius > opponent.y) {
            ball.x = opponent.x - ball.radius;
        }
        ball.velocity.x *= -1.01;
    }

    opponent.update();
    player.update();
    ball.update();
}

let keys = [];

window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    delete keys[event.key];
});

animate();
