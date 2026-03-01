const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Элементы интерфейса
const scoreSpan = document.getElementById('scoreValue');
const movesSpan = document.getElementById('movesValue');
const restartBtn = document.getElementById('restartButton');

// Параметры игры
let lilies = [];
let frog = { 
    x: 200, y: 200, 
    r: 18, 
    targetX: 200, targetY: 200, 
    isJumping: false, 
    jumpProgress: 1,
    startX: 0,
    startY: 0
};
let score = 0;
let moves = 0;

// Создание кувшинок
function initLilies(count = 12) {
    lilies = [];
    for (let i = 0; i < count; i++) {
        let overlap = true;
        let attempts = 0;
        let newLily;
        
        while (overlap && attempts < 2000) {
            newLily = {
                x: 60 + Math.random() * (canvas.width - 120),
                y: 60 + Math.random() * (canvas.height - 120),
                r: 20 + Math.floor(Math.random() * 15)
            };
            
            overlap = lilies.some(l => 
                Math.hypot(l.x - newLily.x, l.y - newLily.y) < l.r + newLily.r + 10
            );
            attempts++;
        }
        lilies.push(newLily);
    }
}

// Ставим жабу на случайную кувшинку
function placeFrogRandomly() {
    if (lilies.length > 0) {
        const randomIndex = Math.floor(Math.random() * lilies.length);
        frog.x = lilies[randomIndex].x;
        frog.y = lilies[randomIndex].y;
        frog.targetX = frog.x;
        frog.targetY = frog.y;
    }
}

// Перезапуск
function restartGame() {
    initLilies(12);
    placeFrogRandomly();
    score = 0;
    moves = 0;
    frog.isJumping = false;
    frog.jumpProgress = 1;
    updateScore();
    draw();
}

// Обновление счёта
function updateScore() {
    scoreSpan.textContent = score;
    movesSpan.textContent = moves;
}

// Прыжок на кувшинку
function jumpToLily(index) {
    if (index < 0 || index >= lilies.length) return false;
    if (frog.isJumping) return false;
    
    const target = lilies[index];
    
    const distance = Math.hypot(target.x - frog.x, target.y - frog.y);
    if (distance < 5) return false;
    
    frog.startX = frog.x;
    frog.startY = frog.y;
    frog.targetX = target.x;
    frog.targetY = target.y;
    frog.isJumping = true;
    frog.jumpProgress = 0;
    
    moves++;
    score += Math.floor(distance / 20) + 1;
    updateScore();
    return true;
}

// Анимация прыжка
function updateJump() {
    if (!frog.isJumping) return;
    
    frog.jumpProgress += 0.04;
    
    if (frog.jumpProgress >= 1) {
        frog.jumpProgress = 1;
        frog.isJumping = false;
        frog.x = frog.targetX;
        frog.y = frog.targetY;
    } else {
        const t = frog.jumpProgress;
        const jumpHeight = 35;
        
        const baseX = frog.startX * (1 - t) + frog.targetX * t;
        const baseY = frog.startY * (1 - t) + frog.targetY * t;
        const arc = jumpHeight * Math.sin(t * Math.PI);
        
        frog.x = baseX;
        frog.y = baseY - arc;
    }
}

// Поиск кувшинки под мышкой
function getLilyUnderMouse(mouseX, mouseY) {
    for (let i = 0; i < lilies.length; i++) {
        const lily = lilies[i];
        const dist = Math.hypot(mouseX - lily.x, mouseY - lily.y);
        if (dist <= lily.r + 5) {
            return i;
        }
    }
    return -1;
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Вода
    const waterGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    waterGrad.addColorStop(0, 'rgba(190, 225, 250, 0.6)');
    waterGrad.addColorStop(0.5, 'rgba(150, 200, 240, 0.7)');
    waterGrad.addColorStop(1, 'rgba(120, 180, 230, 0.8)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рябь
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(100 + i * 120, 50 + i * 70, 40, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Кувшинки
    for (let lily of lilies) {
        ctx.save();
        
        ctx.shadowColor = 'rgba(0, 50, 30, 0.2)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        ctx.beginPath();
        ctx.arc(lily.x, lily.y, lily.r, 0, 2 * Math.PI);
        
        const lilyGrad = ctx.createRadialGradient(
            lily.x - 5, lily.y - 5, 5,
            lily.x, lily.y, lily.r + 5
        );
        lilyGrad.addColorStop(0, 'rgba(240, 255, 220, 0.9)');
        lilyGrad.addColorStop(0.7, 'rgba(180, 230, 160, 0.6)');
        lilyGrad.addColorStop(1, 'rgba(140, 200, 120, 0.4)');
        
        ctx.fillStyle = lilyGrad;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.arc(lily.x, lily.y, lily.r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(lily.x - 4, lily.y - 4, lily.r - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(lily.x - 3, lily.y - 5, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lily.x - 5, lily.y - 7, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        ctx.restore();
    }
    
    // === ЖАБА ИЗ ПЕРВОГО ВАРИАНТА (ПРОСТАЯ И МИЛАЯ) ===
    ctx.save();
    
    // Тень
    ctx.shadowColor = 'rgba(0, 40, 20, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Тело (простой зеленый круг)
    ctx.beginPath();
    ctx.arc(frog.x, frog.y, frog.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#3e9c5b';
    ctx.fill();
    
    // Глаза (белки)
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(frog.x - 6, frog.y - 6, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(frog.x + 6, frog.y - 6, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#1a3a1a';
    ctx.beginPath();
    ctx.arc(frog.x - 7, frog.y - 7, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(frog.x + 5, frog.y - 7, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Блики в глазах
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(frog.x - 8, frog.y - 9, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(frog.x + 4, frog.y - 9, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Ротик
    ctx.beginPath();
    ctx.strokeStyle = '#2b422b';
    ctx.lineWidth = 1.5;
    ctx.arc(frog.x, frog.y + 2, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.restore();
}

// Клик по кувшинке
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const lilyIndex = getLilyUnderMouse(mouseX, mouseY);
    if (lilyIndex !== -1) {
        jumpToLily(lilyIndex);
    }
});

// Управление стрелками
window.addEventListener('keydown', (e) => {
    if (!e.key.startsWith('Arrow')) return;
    e.preventDefault();
    
    if (frog.isJumping) return;
    
    let currentIndex = -1;
    for (let i = 0; i < lilies.length; i++) {
        if (Math.hypot(frog.x - lilies[i].x, frog.y - lilies[i].y) < 10) {
            currentIndex = i;
            break;
        }
    }
    
    if (currentIndex === -1) return;
    
    let dx = 0, dy = 0;
    switch(e.key) {
        case 'ArrowUp': dy = -1; break;
        case 'ArrowDown': dy = 1; break;
        case 'ArrowLeft': dx = -1; break;
        case 'ArrowRight': dx = 1; break;
    }
    
    let bestIndex = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < lilies.length; i++) {
        if (i === currentIndex) continue;
        
        const vecX = lilies[i].x - lilies[currentIndex].x;
        const vecY = lilies[i].y - lilies[currentIndex].y;
        const dot = vecX * dx + vecY * dy;
        
        if (dot > 0) {
            const distance = Math.hypot(vecX, vecY);
            const score = dot / (distance + 1);
            
            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }
    }
    
    if (bestIndex !== -1) {
        jumpToLily(bestIndex);
    } else {
        let closestIndex = -1;
        let minDist = Infinity;
        
        for (let i = 0; i < lilies.length; i++) {
            if (i === currentIndex) continue;
            
            const dist = Math.hypot(
                lilies[i].x - lilies[currentIndex].x,
                lilies[i].y - lilies[currentIndex].y
            );
            
            if (dist < minDist) {
                minDist = dist;
                closestIndex = i;
            }
        }
        
        if (closestIndex !== -1) {
            jumpToLily(closestIndex);
        }
    }
});

// Кнопка рестарта
restartBtn.addEventListener('click', restartGame);

// Анимация
function animate() {
    updateJump();
    draw();
    requestAnimationFrame(animate);
}

// Старт
restartGame();
animate();