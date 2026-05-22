const player = document.querySelector('.def');
const playerWidth = player.offsetWidth;
let x = Math.trunc((window.innerWidth - playerWidth) / 2);
let work = false;
let speedIntervalTime = 200;
let totalLanes = 7;
let blocks = [];
let pointsCount = 0;
let hearts = 3;
let currentStage = 0;

let speedInterval;
let physics;
let checkTimer;

function addBlocks(lanesArray) {
    lanesArray.forEach(laneIndex => {
        const el = document.createElement('div');
        el.classList.add('block');
        el.style.position = 'absolute';
        const blockObj = {
            element: el,
            lane: laneIndex,
            isPos: false
        };
        blocks.push(blockObj);
        runBlock(blockObj);
        document.body.appendChild(blockObj.element);
    });
}

function initBlocks() {
    blocks.forEach(b => {
        if (b.element.parentNode) {
            b.element.parentNode.removeChild(b.element);
        }
    });
    blocks = [];
    addBlocks([2, 3, 4]);
}

const totalPoints = 5;
let currentPoint = Math.floor(totalPoints / 2);

player.style.transition = 'left 0.15s ease-out';

function update() {
    if (work) {
        const wx = window.innerWidth;
        const segmentWidth = wx / totalPoints;
        
        x = (currentPoint * segmentWidth) + (segmentWidth / 2) - (playerWidth / 2);
        player.style.left = x + 'px';
    }
}

function moveLeft() {
    currentPoint = (currentPoint - 1 + totalPoints) % totalPoints;
    update();
}

function moveRight() {
    currentPoint = (currentPoint + 1) % totalPoints;
    update();
}

window.addEventListener('resize', update);

document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyA') moveLeft();
    if (event.code === 'KeyD') moveRight();
});

document.addEventListener('pointerdown', (event) => {
    if (!work || event.target.closest('.btn')) return;
    
    if (event.clientX < window.innerWidth / 2) {
        moveLeft();
    } else {
        moveRight();
    }
});

function runBlock(blockObj) {
    const laneWidth = window.innerWidth / totalLanes;
    const randomX = (blockObj.lane * laneWidth) + (Math.random() * (laneWidth - 50));
    
    blockObj.element.style.left = `${randomX}px`;
    blockObj.element.style.top = '0px';
    blockObj.isPos = Math.random() < 0.3;
    
    if (blockObj.isPos) {
        blockObj.element.classList.add('pos');
    } else {
        blockObj.element.classList.remove('pos');
    }
}

function phBlocks() {
    blocks.forEach(blockObj => {
        const currentY = blockObj.element.offsetTop;
        blockObj.element.style.top = (currentY + 20) + 'px';
        if (blockObj.element.offsetTop > window.innerHeight * 0.7) {
            runBlock(blockObj);
        }
    });
}

function speedUp() {
    if (speedIntervalTime > 50) {
        speedIntervalTime -= 10;
        clearInterval(physics);
        physics = setInterval(phBlocks, speedIntervalTime);
    }
}

function startGameLoops() {
    clearInterval(physics);
    clearInterval(speedInterval);
    clearInterval(checkTimer);

    speedInterval = setInterval(speedUp, 5000);
    physics = setInterval(phBlocks, speedIntervalTime);
    
    checkTimer = setInterval(() => {
        const pRect = player.getBoundingClientRect();
        
        blocks.forEach(blockObj => {
            const bRect = blockObj.element.getBoundingClientRect();
            if (
                pRect.left < bRect.right &&
                pRect.right > bRect.left &&
                pRect.top < bRect.bottom &&
                pRect.bottom > bRect.top
            ) {
                blockObj.element.classList.remove('pos');
                handlePoints(blockObj);
            }
        });
    }, 50);
}

function start() {
    work = true;
    pointsCount = 0;
    hearts = 3;
    currentStage = 0;
    // del btn start
    const startBtn = document.querySelector('.start');
    startBtn.style.display = 'none';
    initBlocks();
    update();
    startGameLoops();
}

function checkProgression() {
    if (pointsCount >= 1000 && currentStage === 0) {
        currentStage = 1;
        addBlocks([1, 5]);
    } else if (pointsCount >= 3000 && currentStage === 1) {
        currentStage = 2;
        addBlocks([0, 6]);
    }
}

function handlePoints(blockObj) {
    if (blockObj.isPos) {
        pointsCount += 100;
        document.querySelector('.scored').textContent = `Points: ${pointsCount}`;
        checkProgression();
    } else {
        hearts -= 1;
        document.querySelector('.hearts').textContent = `Hearts: ${hearts}`;
        checkEnd();
    }
    runBlock(blockObj);
}

function checkEnd() {
    if (hearts <= 0) {
        clearInterval(checkTimer);
        clearInterval(physics);
        clearInterval(speedInterval);
        work = false;
        alert('Гру закінчено! Ваш рахунок: ' + pointsCount);
    }
}

function resetGame() {
    pointsCount = 0;
    hearts = 3;
    currentStage = 0;
    speedIntervalTime = 500;
    initBlocks();
    if (work) {
        startGameLoops();
    }
}
