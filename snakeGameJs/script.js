// SELECT ELEMENTS
const board = document.querySelector('.board');
const modal = document.querySelector('.modal');
const startBox = document.querySelector('.start-game');
const gameOverBox = document.querySelector('.game-over');
const startBtn = document.querySelector('.start-btn');
const restartBtn = document.querySelector('.restart-btn');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timeEl = document.getElementById('time');
const finalScoreEl = document.getElementById('final-score');

// GRID SIZE
const boxSize = 30;
let blocks = {};
let cols = 0;
let rows = 0;

// GAME STATE
let snake = [];
let direction = "right";
let intervalId = null;
let score = 0;
let time = 0;
let timerInterval = null;

// HIGH SCORE (ensure numeric)
let highScore = Number(localStorage.getItem('snakeHighScore')) || 0;
highScoreEl.textContent = highScore;

// FOOD
let food = null;

// Initialize grid and initial state
function setupGrid() {
    // clear any existing grid
    board.innerHTML = '';
    blocks = {};

    cols = Math.max(5, Math.floor(board.clientWidth / boxSize));
    rows = Math.max(5, Math.floor(board.clientHeight / boxSize));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const box = document.createElement('div');
            box.classList.add('box');
            board.appendChild(box);
            blocks[`${r}-${c}`] = box;
        }
    }

    // place snake in center
    snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
    direction = 'right';

    // fresh food and visuals
    food = generateFood();
    drawAll();
}

function drawAll() {
    for (const k in blocks) {
        blocks[k].classList.remove('fill', 'head', 'food');
    }
    // draw food
    if (food && blocks[`${food.x}-${food.y}`]) blocks[`${food.x}-${food.y}`].classList.add('food');
    // draw snake
    snake.forEach((seg, index) => {
        const el = blocks[`${seg.x}-${seg.y}`];
        if (!el) return;
        if (index === 0) el.classList.add('head'); else el.classList.add('fill');
    });
}

// KEY CONTROLS (prevent reverse)
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "down") direction = "up";
    if (e.key === "ArrowDown" && direction !== "up") direction = "down";
    if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
    if (e.key === "ArrowRight" && direction !== "left") direction = "right";
});

// MAIN RENDER LOOP
function render() {

    // REMOVE OLD SNAKE
    snake.forEach(seg => {
        blocks[`${seg.x}-${seg.y}`]?.classList.remove("fill", "head");
    });

    // NEW HEAD
    let head = { ...snake[0] };

    if (direction === "right") head.y++;
    if (direction === "left") head.y--;
    if (direction === "down") head.x++;
    if (direction === "up") head.x--;

    // WALL WRAPPING
    if (head.x < 0) head.x = rows - 1;
    if (head.x >= rows) head.x = 0;
    if (head.y < 0) head.y = cols - 1;
    if (head.y >= cols) head.y = 0;

    // SELF COLLISION
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        endGame();
        return;
    }

    // FOOD EAT
    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`]?.classList.remove("food");
        food = generateFood();
        snake.unshift(head); // grow
        score++;
        scoreEl.textContent = score;

        // UPDATE HIGH SCORE
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

    } else {
        snake.unshift(head);
        snake.pop(); // move
    }

    // DRAW FOOD
    blocks[`${food.x}-${food.y}`]?.classList.add("food");

    // DRAW SNAKE
    snake.forEach((seg, index) => {
        if (index === 0) {
            blocks[`${seg.x}-${seg.y}`]?.classList.add("head");
        } else {
            blocks[`${seg.x}-${seg.y}`]?.classList.add("fill");
        }
    });
}

// FOOD GENERATOR
function generateFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
}

// TIMER
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        time++;
        let minutes = String(Math.floor(time / 60)).padStart(2, '0');
        let seconds = String(time % 60).padStart(2, '0');
        timeEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// START GAME
startBtn.addEventListener("click", () => {
    if (intervalId) return; 
    modal.classList.remove("active"); // hide modal completely
    startBox.style.display = 'none';
    gameOverBox.style.display = 'none';
    score = 0;
    time = 0;
    scoreEl.textContent = score;
    timeEl.textContent = '00:00';
    startBtn.disabled = true;
    startTimer();
    intervalId = setInterval(render, 400);
});

// GAME OVER
function endGame() {
    clearInterval(intervalId);
    clearInterval(timerInterval);
    intervalId = null;
    timerInterval = null;
    finalScoreEl.textContent = score;
    modal.classList.add("active");
    gameOverBox.style.display = "flex";
    startBox.style.display = "none"; // hide start box on game over
    startBtn.disabled = false;
}

// RESTART
function resetGame() {
    clearInterval(intervalId);
    clearInterval(timerInterval);
    intervalId = null;
    timerInterval = null;
    score = 0;
    time = 0;
    scoreEl.textContent = '0';
    timeEl.textContent = '00:00';
    finalScoreEl.textContent = '0';
    startBox.style.display = 'flex';
    gameOverBox.style.display = 'none';
    modal.classList.add('active');
    startBtn.disabled = false;
    setupGrid();
}

restartBtn.addEventListener('click', resetGame);

// recompute grid on resize (debounced)
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => setupGrid(), 200);
});

// initial setup
setupGrid();
