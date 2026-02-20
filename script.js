// 星空画布设置
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 鼠标位置追踪
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2
};

// 星星类
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        // 随机位置（相对于中心的偏移）
        this.baseX = (Math.random() - 0.5) * canvas.width * 2;
        this.baseY = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.random() * 1000; // 深度
        
        // 星星属性
        this.size = Math.random() * 2 + 0.5;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        
        // 颜色变化
        this.colorHue = Math.random() * 60 + 200; // 蓝色到紫色范围
    }

    update(offsetX, offsetY) {
        // 根据深度计算视差效果
        const parallaxFactor = 1 - this.z / 1000;
        
        // 计算屏幕位置
        this.x = canvas.width / 2 + this.baseX + offsetX * parallaxFactor * 0.5;
        this.y = canvas.height / 2 + this.baseY + offsetY * parallaxFactor * 0.5;
        
        // 闪烁效果
        this.twinklePhase += this.twinkleSpeed;
        this.currentBrightness = this.brightness * (0.7 + 0.3 * Math.sin(this.twinklePhase));
        
        // 如果星星移出屏幕，重置位置
        if (this.x < -100 || this.x > canvas.width + 100 ||
            this.y < -100 || this.y > canvas.height + 100) {
            this.reset();
        }
    }

    draw() {
        const alpha = this.currentBrightness * (1 - this.z / 1200);
        const size = this.size * (1 - this.z / 1500);
        
        // 绘制星星光晕
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, size * 3
        );
        gradient.addColorStop(0, `hsla(${this.colorHue}, 80%, 90%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${this.colorHue}, 60%, 70%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.colorHue}, 40%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制星星核心
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.colorHue}, 20%, 100%, ${alpha})`;
        ctx.fill();
    }
}

// 流星类
class ShootingStar {
    constructor() {
        this.reset();
        this.active = false;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 100 + 50;
        this.speed = Math.random() * 15 + 10;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.opacity = 1;
        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.02;
        
        if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        
        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);
        
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 流星头部光点
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

// 星云类
class Nebula {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 200 + 100;
        this.hue = Math.random() * 60 + 200;
        this.opacity = Math.random() * 0.1 + 0.05;
        this.parallaxFactor = Math.random() * 0.3 + 0.1;
    }

    update(offsetX, offsetY) {
        this.displayX = this.x + offsetX * this.parallaxFactor;
        this.displayY = this.y + offsetY * this.parallaxFactor;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.displayX, this.displayY, 0,
            this.displayX, this.displayY, this.radius
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, ${this.opacity})`);
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 60%, 40%, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 50%, 30%, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// 创建星星数组
const stars = [];
const starCount = 500;
for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
}

// 创建星云数组
const nebulae = [];
const nebulaCount = 5;
for (let i = 0; i < nebulaCount; i++) {
    nebulae.push(new Nebula());
}

// 创建流星
const shootingStars = [];
const maxShootingStars = 3;
for (let i = 0; i < maxShootingStars; i++) {
    shootingStars.push(new ShootingStar());
}

// 随机触发流星
function triggerShootingStar() {
    if (Math.random() < 0.005) { // 0.5% 概率每帧
        for (let star of shootingStars) {
            if (!star.active) {
                star.reset();
                break;
            }
        }
    }
}

// 鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX - canvas.width / 2;
    mouse.targetY = e.clientY - canvas.height / 2;
});

// 触摸事件支持
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.targetX = touch.clientX - canvas.width / 2;
    mouse.targetY = touch.clientY - canvas.height / 2;
});

// 平滑鼠标移动
function smoothMouse() {
    const ease = 0.05;
    mouse.x += (mouse.targetX - mouse.x) * ease;
    mouse.y += (mouse.targetY - mouse.y) * ease;
}

// 动画循环
function animate() {
    // 清除画布
    ctx.fillStyle = 'rgba(10, 10, 26, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 平滑鼠标移动
    smoothMouse();
    
    // 绘制星云
    for (let nebula of nebulae) {
        nebula.update(mouse.x, mouse.y);
        nebula.draw();
    }
    
    // 更新和绘制星星
    for (let star of stars) {
        star.update(mouse.x, mouse.y);
        star.draw();
    }
    
    // 触发和绘制流星
    triggerShootingStar();
    for (let shootingStar of shootingStars) {
        shootingStar.update();
        shootingStar.draw();
    }
    
    requestAnimationFrame(animate);
}

// 初始化背景
ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 开始动画
animate();

// 淡出提示文字
setTimeout(() => {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }
}, 5000);
