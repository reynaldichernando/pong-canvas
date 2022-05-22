const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
let bounce = new Audio('./bounce.mp3');

canvas.width = 800;
canvas.height = 600;

class Table {
    constructor() { }

    draw() {
        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.strokeStyle = 'white';
        c.setLineDash([10, 30]);
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(canvas.width / 2, 0);
        c.lineTo(canvas.width / 2, canvas.height);
        c.closePath();
        c.stroke();
    }
}

class Ball {
    constructor(x, y, radius, color, direction, speed, modifier) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.radius = radius;
        this.color = color;
        this.direction = direction;
        this.speed = speed;
        this.modifier = modifier;
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.modifier = this.speed;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        if (this.y - this.radius - 0 < 1 ||
            canvas.height - this.y - this.radius < 1) {
            this.direction.y *= -1;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x = this.x + this.direction.x * this.modifier;
        this.y = this.y + this.direction.y * this.modifier;
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
    constructor(x, y, w, h, color, difficulty = 40) {
        super(x, y, w, h, color);
        this.difficulty = difficulty;
    }

    update() {
        this.draw();
    }

    move(ball) {
        if (counter < this.difficulty
            && ball.x > canvas.width / 2
            && ball.x > ball.prevX
            && ball.x < canvas.width
        ) {
            if (ball.y <= this.y) {
                this.up();
            }
            else if (ball.y >= this.y + this.h) {
                this.down();
            }
        }
    }
}

let random;
let angle;
let modifier;
let counter;
let gameRunning;
let isPaused;
let winningScore = 5;
let speedModifier = 10;

let paddleWidth;
let paddleHeight;

let animationId;

let ball;
let player;
let opponent;
let table;

let playerScore;
let opponentScore;

function init() {
    random = 0;
    while ((0.15 < random && random < 0.35)
        || (0.65 < random && random < 0.85)
        || random == 0.5
        || random == 0
    ) random = Math.random();

    angle = random * Math.PI * 2;
    modifier = 6;
    counter = 0;
    gameRunning = true;
    isPaused = false;

    paddleWidth = 4;
    paddleHeight = 100;

    ball = new Ball(canvas.width / 2, canvas.height / 2, 8, 'white', {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }, modifier, modifier);
    player = new Player(
        10,
        canvas.height / 2 - paddleHeight / 2,
        paddleWidth,
        paddleHeight,
        'white'
    );
    opponent = new Opponent(
        canvas.width - 10 - paddleWidth,
        canvas.height / 2 - paddleHeight / 2,
        paddleWidth,
        paddleHeight,
        'white',
        50
    );
    table = new Table();

    playerScore = 0;
    document.querySelector('#player').innerHTML = playerScore;
    opponentScore = 0;
    document.querySelector('#opponent').innerHTML = opponentScore;
}

function animate() {
    if (!isPaused)
        animationId = requestAnimationFrame(animate);

    counter += 1;
    if (counter == 60) counter = 0;

    // player action
    if (keys["ArrowUp"]) player.up();
    if (keys["ArrowDown"]) player.down();

    opponent.move(ball);

    // collision logic
    if (player.x + player.w > ball.x - ball.radius
        && player.x < ball.x + ball.radius
        && ball.y > player.y
        && player.y + player.h > ball.y
    ) {
        if (ball.y + ball.radius > player.y
            || ball.y - ball.radius < player.y + player.h) {
            ball.x = player.x + player.w + ball.radius;
        }

        let segmentDistance = ball.y - player.y;

        if (segmentDistance > 80) {
            angle = 0.10 * Math.PI * 2;
        } else if (segmentDistance > 60) {
            angle = 0.05 * Math.PI * 2;
        } else if (segmentDistance > 40) {
            angle = 0 * Math.PI * 2;
        } else if (segmentDistance > 20) {
            angle = 0.95 * Math.PI * 2;
        } else {
            angle = 0.90 * Math.PI * 2;
        }

        ball.modifier *= 1 + (speedModifier/100)

        ball.direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        bounce.play();
    }

    if (opponent.x < ball.x + ball.radius
        && opponent.x + opponent.w > ball.x - ball.radius
        && ball.y > opponent.y
        && opponent.y + opponent.h > ball.y
    ) {
        if (ball.y + ball.radius > opponent.y
            || ball.y - ball.radius < opponent.y + opponent.h) {
            ball.x = opponent.x - ball.radius;
        }
        let segmentDistance = ball.y - opponent.y;

        if (segmentDistance > 80) {
            angle = 0.40 * Math.PI * 2;
        } else if (segmentDistance > 60) {
            angle = 0.45 * Math.PI * 2;
        } else if (segmentDistance > 40) {
            angle = 0.5 * Math.PI * 2;
        } else if (segmentDistance > 20) {
            angle = 0.55 * Math.PI * 2;
        } else {
            angle = 0.60 * Math.PI * 2;
        }

        ball.modifier *= 1 + (speedModifier/100)

        ball.direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        bounce.play();
    }

    if (gameRunning && (ball.x + ball.radius < 0 || ball.x - ball.radius > canvas.width)) {
        if (ball.x + ball.radius < 0) {
            document.querySelector('#opponent').innerHTML = ++opponentScore;
        }
        else if (ball.x - ball.radius > canvas.width) {
            document.querySelector('#player').innerHTML = ++playerScore;
        }

        if (opponentScore == winningScore || playerScore == winningScore) {
            isPaused = true;
            gameRunning = false;
            document.querySelector('#game-over').style.display = "flex";
            return;
        }

        gameRunning = false;
        setTimeout(() => {
            gameRunning = true;
            ball.reset();
        }, 1500)
    }

    table.draw();
    opponent.update();
    player.update();
    ball.update();
}

function handleWelcomeMenu() {
    document.querySelector('#welcome-menu').style.display = "none";
    document.querySelector('#start-menu').style.display = "block";

    window.removeEventListener('keydown', handleWelcomeMenu);
    document.querySelector('#menu').removeEventListener('click', handleWelcomeMenu);
}

function handlePlayButton() {
    document.querySelector('#start-menu').style.display = "none";
    document.querySelector('#mode-menu').style.display = "block";
}

function handleStartButton(difficulty = "medium") {
    document.querySelector('#menu').style.display = "none";
    init();
    let modes = {
        "easy": 40,
        "medium": 50,
        "hard": 55
    }
    opponent.difficulty = modes[difficulty];
    animate();
}

function handleOptionsButton() {
    document.querySelector('#start-menu').style.display = "none";
    document.querySelector('#options-menu').style.display = "block";

    document.querySelector('#win-score').innerHTML = winningScore;
    document.querySelector('#speed-modifier').innerHTML = speedModifier;
}

function handleDecrWinScore() {
    if (winningScore == 1) return;
    document.querySelector('#win-score').innerHTML = --winningScore;
}

function handleIncrWinScore() {
    if (winningScore == 15) return;
    document.querySelector('#win-score').innerHTML = ++winningScore;
}

function handleDecrSpeedModifier() {
    if (speedModifier == 5) return;
    speedModifier -= 5;
    document.querySelector('#speed-modifier').innerHTML = speedModifier;
}

function handleIncrSpeedModifier() {
    if (speedModifier == 80) return;
    speedModifier += 5;
    document.querySelector('#speed-modifier').innerHTML = speedModifier;
}

function togglePause() {
    isPaused = !isPaused;
    document.querySelector('#pause').style.display = isPaused ? "flex" : "none";
    animate();
}

function handleExitButton() {
    isPaused = false;
    document.querySelector('#pause').style.display = "none";
    document.querySelector('#game-over').style.display = "none";
    document.querySelector('#mode-menu').style.display = "none";
    document.querySelector('#options-menu').style.display = "none";
    gameRunning = false;
    animationId = null;

    document.querySelector('#menu').style.display = "flex";
    document.querySelector('#start-menu').style.display = "block";
}

let keys = [];

window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key == 'p' && !!animationId) {
        togglePause();
    }
});

window.addEventListener('keyup', (event) => {
    delete keys[event.key];
});

window.addEventListener('keydown', handleWelcomeMenu);
document.querySelector('#menu').addEventListener('click', handleWelcomeMenu);

document.querySelector('#play').addEventListener('click', handlePlayButton);
document.querySelectorAll('.start').forEach(element => {
    element.addEventListener('click', () => handleStartButton(element.id));
})
document.querySelector('#options').addEventListener('click', handleOptionsButton);
document.querySelector('#decr-win-score').addEventListener('click', handleDecrWinScore);
document.querySelector('#incr-win-score').addEventListener('click', handleIncrWinScore);

document.querySelector('#decr-speed-modifier').addEventListener('click', handleDecrSpeedModifier);
document.querySelector('#incr-speed-modifier').addEventListener('click', handleIncrSpeedModifier);

document.querySelector('#continue').addEventListener('click', togglePause);
document.querySelectorAll('.exit').forEach(element => {
    element.addEventListener('click', handleExitButton);
})
