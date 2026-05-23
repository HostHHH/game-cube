const desktopContainer = document.getElementById('desktop-container');
const mobileContainer = document.getElementById('mobile-container');
const mediaQuery = window.matchMedia('(max-width: 768px)');

let desktopInitialized = false;
let mobileInitialized = false;
let gameActive = false;

let d_work = false;
let d_speedIntervalTime = 200;
let d_totalLanes = 7;
let d_blocks = [];
let d_pointsCount = 0;
let d_hearts = 3;
let d_currentStage = 0;
let d_speedInterval;
let d_physics;
let d_checkTimer;
let d_currentPoint = 2;
const d_totalPoints = 5;

let m_work = false;
let m_speedIntervalTime = 200;
let m_totalLanes = 7;
let m_blocks = [];
let m_pointsCount = 0;
let m_hearts = 3;
let m_currentStage = 0;
let m_speedInterval;
let m_physics;
let m_checkTimer;
let m_currentPoint = 2;
const m_totalPoints = 5;

function haltAllGames() {
    d_work = false;
    clearInterval(d_physics);
    clearInterval(d_speedInterval);
    clearInterval(d_checkTimer);
    
    m_work = false;
    clearInterval(m_physics);
    clearInterval(m_speedInterval);
    clearInterval(m_checkTimer);
    
    document.getElementById('desktop-start-btn').style.display = 'block';
    document.getElementById('mobile-start-btn').style.display = 'block';
    gameActive = false;
}

function initDesktopVersion() {
    if (desktopInitialized) return;
    desktopInitialized = true;

    const player = document.querySelector('.desktop-player');
    const startBtn = document.getElementById('desktop-start-btn');
    const scoreEl = document.getElementById('desktop-score');
    const heartsEl = document.getElementById('desktop-hearts');
    const playerWidth = 100;
    
    let x = Math.trunc((window.innerWidth - playerWidth) / 2);
    player.style.transition = 'left 0.15s ease-out';

    function update(isTeleport = false) {
        if (d_work) {
            const wx = window.innerWidth;
            const segmentWidth = wx / d_totalPoints;
            x = (d_currentPoint * segmentWidth) + (segmentWidth / 2) - (playerWidth / 2);
            
            if (isTeleport === true) {
                player.style.transition = 'none';
                player.style.left = x + 'px';
                player.offsetHeight; 
                player.style.transition = 'left 0.15s ease-out';
            } else {
                player.style.left = x + 'px';
            }
        }
    }

    function moveLeft() {
        if (!d_work) return;
        const isTeleport = d_currentPoint === 0;
        d_currentPoint = (d_currentPoint - 1 + d_totalPoints) % d_totalPoints;
        update(isTeleport);
    }

    function moveRight() {
        if (!d_work) return;
        const isTeleport = d_currentPoint === d_totalPoints - 1;
        d_currentPoint = (d_currentPoint + 1) % d_totalPoints;
        update(isTeleport);
    }

    function runBlock(blockObj) {
        const laneWidth = window.innerWidth / d_totalLanes;
        const randomX = (blockObj.lane * laneWidth) + (Math.random() * (laneWidth - 50));
        blockObj.element.style.left = `${randomX}px`;
        blockObj.element.style.top = '0px';
        blockObj.isPos = Math.random() < 0.3;
        if (blockObj.isPos) {
            blockObj.element.classList.add('desktop-pos');
        } else {
            blockObj.element.classList.remove('desktop-pos');
        }
    }

    function addBlocks(lanesArray) {
        lanesArray.forEach(laneIndex => {
            const el = document.createElement('div');
            el.classList.add('desktop-block');
            el.style.position = 'absolute';
            const blockObj = {
                element: el,
                lane: laneIndex,
                isPos: false
            };
            d_blocks.push(blockObj);
            runBlock(blockObj);
            desktopContainer.appendChild(blockObj.element);
        });
    }

    function initBlocks() {
        d_blocks.forEach(b => {
            if (b.element.parentNode) {
                b.element.parentNode.removeChild(b.element);
            }
        });
        d_blocks = [];
        addBlocks([2, 3, 4]);
    }

    function phBlocks() {
        if (!d_work) return;
        d_blocks.forEach(blockObj => {
            const currentY = blockObj.element.offsetTop;
            blockObj.element.style.top = (currentY + 20) + 'px';
            if (blockObj.element.offsetTop > window.innerHeight * 0.7) {
                runBlock(blockObj);
            }
        });
    }

    function speedUp() {
        if (d_speedIntervalTime > 50) {
            d_speedIntervalTime -= 5;
            clearInterval(d_physics);
            d_physics = setInterval(phBlocks, d_speedIntervalTime);
        }
    }

    function checkProgression() {
        if (d_pointsCount >= 1000 && d_currentStage === 0) {
            d_currentStage = 1;
            addBlocks([1, 5]);
        } else if (d_pointsCount >= 3000 && d_currentStage === 1) {
            d_currentStage = 2;
            addBlocks([0, 6]);
        }
    }

    function checkEnd() {
        if (d_hearts <= 0) {
            haltAllGames();
            alert('Гру закінчено! Ваш рахунок: ' + d_pointsCount);
        }
    }

    function handlePoints(blockObj) {
        if (blockObj.isPos) {
            d_pointsCount += 100;
            scoreEl.textContent = `Points: ${d_pointsCount}`;
            checkProgression();
        } else {
            d_hearts -= 1;
            heartsEl.textContent = `Hearts: ${d_hearts}`;
            checkEnd();
        }
        runBlock(blockObj);
    }

    function startGameLoops() {
        clearInterval(d_physics);
        clearInterval(d_speedInterval);
        clearInterval(d_checkTimer);

        d_speedInterval = setInterval(speedUp, 5000);
        d_physics = setInterval(phBlocks, d_speedIntervalTime);
        
        d_checkTimer = setInterval(() => {
            if (!d_work) return;
            const pRect = player.getBoundingClientRect();
            d_blocks.forEach(blockObj => {
                const bRect = blockObj.element.getBoundingClientRect();
                if (
                    pRect.left < bRect.right &&
                    pRect.right > bRect.left &&
                    pRect.top < bRect.bottom &&
                    pRect.bottom > bRect.top
                ) {
                    blockObj.element.classList.remove('desktop-pos');
                    handlePoints(blockObj);
                }
            });
        }, 50);
    }

    startBtn.addEventListener('click', () => {
        gameActive = true;
        d_work = true;
        d_pointsCount = 0;
        d_hearts = 3;
        d_currentStage = 0;
        d_speedIntervalTime = 200;
        scoreEl.textContent = `Points: 0`;
        heartsEl.textContent = `Hearts: 3`;
        startBtn.style.display = 'none';
        initBlocks();
        update();
        startGameLoops();
    });

    window.addEventListener('resize', () => {
        if (!mediaQuery.matches) update(true);
    });

    document.addEventListener('keydown', (event) => {
        if (!mediaQuery.matches) {
            if (event.code === 'KeyA') moveLeft();
            if (event.code === 'KeyD') moveRight();
        }
    });

    document.addEventListener('pointerdown', (event) => {
        if (mediaQuery.matches || !d_work || event.target.closest('.desktop-btn')) return;
        if (event.clientX < window.innerWidth / 2) {
            moveLeft();
        } else {
            moveRight();
        }
    });
}

function initMobileVersion() {
    if (mobileInitialized) return;
    mobileInitialized = true;

    const player = document.querySelector('.mobile-player');
    const startBtn = document.getElementById('mobile-start-btn');
    const scoreEl = document.getElementById('mobile-score');
    const heartsEl = document.getElementById('mobile-hearts');
    const btnUp = document.getElementById('mobile-up-btn');
    const btnDown = document.getElementById('mobile-down-btn');
    
    m_currentPoint = Math.floor(m_totalPoints / 2);
    player.style.transition = 'top 0.15s ease-out';

    function update(isTeleport = false) {
        if (m_work) {
            const wy = document.documentElement.clientHeight;
            const segmentHeight = wy / m_totalPoints;
            const currentHeight = player.offsetHeight;
            
            let newY = (m_currentPoint * segmentHeight) + (segmentHeight / 2) - (currentHeight / 2);
            
            if (newY < 0) {
                newY = 0;
            }
            if (newY + currentHeight > wy) {
                newY = wy - currentHeight;
            }
            
            if (isTeleport) {
                player.style.transition = 'none';
                player.style.top = newY + 'px';
                player.getBoundingClientRect(); 
                player.style.transition = 'top 0.15s ease-out';
            } else {
                player.style.transition = 'top 0.15s ease-out';
                player.style.top = newY + 'px';
            }
        }
    }

    function moveLeft() {
        if (!m_work) return;
        const isTeleport = m_currentPoint === 0;
        m_currentPoint = (m_currentPoint - 1 + m_totalPoints) % m_totalPoints;
        update(isTeleport);
    }

    function moveRight() {
        if (!m_work) return;
        const isTeleport = m_currentPoint === m_totalPoints - 1;
        m_currentPoint = (m_currentPoint + 1) % m_totalPoints;
        update(isTeleport);
    }

    function runBlock(blockObj) {
        const wy = document.documentElement.clientHeight;
        const laneHeight = wy / m_totalLanes;
        const randomY = (blockObj.lane * laneHeight) + (Math.random() * (laneHeight - 50));
        
        blockObj.element.style.top = `${randomY}px`;
        blockObj.element.style.left = '0px';
        blockObj.isPos = Math.random() < 0.3;
        
        if (blockObj.isPos) {
            blockObj.element.classList.add('mobile-pos');
        } else {
            blockObj.element.classList.remove('mobile-pos');
        }
    }

    function addBlocks(lanesArray) {
        lanesArray.forEach(laneIndex => {
            const el = document.createElement('div');
            el.classList.add('mobile-block');
            el.style.position = 'absolute';
            const blockObj = {
                element: el,
                lane: laneIndex,
                isPos: false
            };
            m_blocks.push(blockObj);
            runBlock(blockObj);
            mobileContainer.appendChild(blockObj.element);
        });
    }

    function initBlocks() {
        m_blocks.forEach(b => {
            if (b.element.parentNode) {
                b.element.parentNode.removeChild(b.element);
            }
        });
        m_blocks = [];
        addBlocks([2, 3, 4]);
    }

    function phBlocks() {
        if (!m_work) return;
        m_blocks.forEach(blockObj => {
            const currentX = blockObj.element.offsetLeft;
            blockObj.element.style.left = (currentX + 20) + 'px';
            if (blockObj.element.offsetLeft > window.innerWidth * 0.7) {
                runBlock(blockObj);
            }
        });
    }

    function speedUp() {
        if (m_speedIntervalTime > 50) {
            m_speedIntervalTime -= 5;
            clearInterval(m_physics);
            m_physics = setInterval(phBlocks, m_speedIntervalTime);
        }
    }

    function checkProgression() {
        if (m_pointsCount >= 1000 && m_currentStage === 0) {
            m_currentStage = 1;
            addBlocks([1, 5]);
        } else if (m_pointsCount >= 3000 && m_currentStage === 1) {
            m_currentStage = 2;
            addBlocks([0, 6]);
        }
    }

    function checkEnd() {
        if (m_hearts <= 0) {
            haltAllGames();
            alert('Гру закінчено! Ваш рахунок: ' + m_pointsCount);
        }
    }

    function handlePoints(blockObj) {
        if (blockObj.isPos) {
            m_pointsCount += 100;
            scoreEl.textContent = `Points: ${m_pointsCount}`;
            checkProgression();
        } else {
            m_hearts -= 1;
            heartsEl.textContent = `Hearts: ${m_hearts}`;
            checkEnd();
        }
        runBlock(blockObj);
    }

    function startGameLoops() {
        clearInterval(m_physics);
        clearInterval(m_speedInterval);
        clearInterval(m_checkTimer);

        m_speedInterval = setInterval(speedUp, 5000);
        m_physics = setInterval(phBlocks, m_speedIntervalTime);
        
        m_checkTimer = setInterval(() => {
            if (!m_work) return;
            const pRect = player.getBoundingClientRect();
            m_blocks.forEach(blockObj => {
                const bRect = blockObj.element.getBoundingClientRect();
                if (
                    pRect.left < bRect.right &&
                    pRect.right > bRect.left &&
                    pRect.top < bRect.bottom &&
                    pRect.bottom > bRect.top
                ) {
                    blockObj.element.classList.remove('mobile-pos');
                    handlePoints(blockObj);
                }
            });
        }, 50);
    }

    btnUp.addEventListener('click', moveLeft);
    btnDown.addEventListener('click', moveRight);

    startBtn.addEventListener('click', () => {
        gameActive = true;
        m_work = true;
        m_pointsCount = 0;
        m_hearts = 3;
        m_currentStage = 0;
        m_speedIntervalTime = 200;
        scoreEl.textContent = `Points: 0`;
        heartsEl.textContent = `Hearts: 3`;
        startBtn.style.display = 'none';
        initBlocks();
        update();
        startGameLoops();
    });

    window.addEventListener('resize', () => {
        if (mediaQuery.matches) update(true);
    });
}

function handleDeviceChange(e) {
    if (gameActive) {
        haltAllGames();
    }
    
    if (e.matches) {
        desktopContainer.classList.remove('active');
        mobileContainer.classList.add('active');
        initMobileVersion();
    } else {
        mobileContainer.classList.remove('active');
        desktopContainer.classList.add('active');
        initDesktopVersion();
    }
}

mediaQuery.addEventListener('change', handleDeviceChange);
handleDeviceChange(mediaQuery);
