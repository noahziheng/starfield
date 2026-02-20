// 星空画布设置
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

// 设备检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
const isLowPerfDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

// 性能配置
const config = {
    starCount: isLowPerfDevice ? 200 : 500,
    nebulaCount: isLowPerfDevice ? 3 : 5,
    maxShootingStars: isLowPerfDevice ? 2 : 3,
    shootingStarProbability: isLowPerfDevice ? 0.003 : 0.005,
    useSimpleGlow: isLowPerfDevice
};

// 设置画布尺寸（使用设备像素比优化高清屏）
let dpr = Math.min(window.devicePixelRatio || 1, isLowPerfDevice ? 1 : 2);
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
}
resizeCanvas();

// 防抖处理 resize 事件
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        dpr = Math.min(window.devicePixelRatio || 1, isLowPerfDevice ? 1 : 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
        resizeCanvas();
    }, 150);
});

// 鼠标位置追踪
let mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
};

// 获取逻辑画布尺寸（不含 DPR 缩放）
function getCanvasWidth() {
    return window.innerWidth;
}
function getCanvasHeight() {
    return window.innerHeight;
}

// 星星类
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        // 随机位置（相对于中心的偏移）
        this.baseX = (Math.random() - 0.5) * getCanvasWidth() * 2;
        this.baseY = (Math.random() - 0.5) * getCanvasHeight() * 2;
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
        const canvasW = getCanvasWidth();
        const canvasH = getCanvasHeight();
        
        // 根据深度计算视差效果
        const parallaxFactor = 1 - this.z / 1000;
        
        // 计算屏幕位置
        this.x = canvasW / 2 + this.baseX + offsetX * parallaxFactor * 0.5;
        this.y = canvasH / 2 + this.baseY + offsetY * parallaxFactor * 0.5;
        
        // 闪烁效果
        this.twinklePhase += this.twinkleSpeed;
        this.currentBrightness = this.brightness * (0.7 + 0.3 * Math.sin(this.twinklePhase));
        
        // 如果星星移出屏幕，重置位置
        if (this.x < -100 || this.x > canvasW + 100 ||
            this.y < -100 || this.y > canvasH + 100) {
            this.reset();
        }
    }

    draw() {
        const alpha = this.currentBrightness * (1 - this.z / 1200);
        const size = this.size * (1 - this.z / 1500);
        
        if (config.useSimpleGlow) {
            // 移动端简化渲染 - 不使用渐变
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.colorHue}, 60%, 80%, ${alpha * 0.5})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.colorHue}, 20%, 100%, ${alpha})`;
            ctx.fill();
        } else {
            // 桌面端完整渲染 - 使用渐变光晕
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
}

// 流星类
class ShootingStar {
    constructor() {
        this.reset();
        this.active = false;
    }

    reset() {
        this.x = Math.random() * getCanvasWidth();
        this.y = Math.random() * getCanvasHeight() * 0.5;
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
        
        if (this.opacity <= 0 || this.x > getCanvasWidth() || this.y > getCanvasHeight()) {
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
        this.x = Math.random() * getCanvasWidth();
        this.y = Math.random() * getCanvasHeight();
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
for (let i = 0; i < config.starCount; i++) {
    stars.push(new Star());
}

// 创建星云数组
const nebulae = [];
for (let i = 0; i < config.nebulaCount; i++) {
    nebulae.push(new Nebula());
}

// 创建流星
const shootingStars = [];
for (let i = 0; i < config.maxShootingStars; i++) {
    shootingStars.push(new ShootingStar());
}

// 随机触发流星
function triggerShootingStar() {
    if (Math.random() < config.shootingStarProbability) {
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
    mouse.targetX = e.clientX - getCanvasWidth() / 2;
    mouse.targetY = e.clientY - getCanvasHeight() / 2;
});

// 触摸事件支持
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouse.targetX = touch.clientX - getCanvasWidth() / 2;
    mouse.targetY = touch.clientY - getCanvasHeight() / 2;
}, { passive: false });

// 触摸开始事件
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    mouse.targetX = touch.clientX - getCanvasWidth() / 2;
    mouse.targetY = touch.clientY - getCanvasHeight() / 2;
}, { passive: true });

// 陀螺仪支持（移动设备）
let gyroEnabled = false;
if (isMobile && window.DeviceOrientationEvent) {
    // 检测是否需要请求权限（iOS 13+）
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 需要用户交互后请求权限
        document.addEventListener('touchstart', function requestGyro() {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        enableGyroscope();
                    }
                })
                .catch(console.error);
            document.removeEventListener('touchstart', requestGyro);
        }, { once: true });
    } else {
        // Android 和其他设备直接启用
        enableGyroscope();
    }
}

function enableGyroscope() {
    gyroEnabled = true;
    window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
            // gamma: 左右倾斜 (-90 到 90)
            // beta: 前后倾斜 (-180 到 180)
            const sensitivity = 3;
            mouse.targetX = (e.gamma / 45) * getCanvasWidth() / 2 * sensitivity;
            mouse.targetY = ((e.beta - 45) / 45) * getCanvasHeight() / 2 * sensitivity;
            
            // 限制范围
            mouse.targetX = Math.max(-getCanvasWidth() / 2, Math.min(getCanvasWidth() / 2, mouse.targetX));
            mouse.targetY = Math.max(-getCanvasHeight() / 2, Math.min(getCanvasHeight() / 2, mouse.targetY));
        }
    }, { passive: true });
}

// 更新提示文字
function updateHintText() {
    const hintElement = document.querySelector('.hint-text');
    if (hintElement) {
        if (isMobile) {
            hintElement.textContent = gyroEnabled ? '倾斜设备探索星空' : '触摸滑动探索星空';
        } else {
            hintElement.textContent = '移动鼠标探索星空';
        }
    }
}
// 延迟更新以等待陀螺仪检测
setTimeout(updateHintText, 100);

// 平滑鼠标移动
function smoothMouse() {
    const ease = 0.05;
    mouse.x += (mouse.targetX - mouse.x) * ease;
    mouse.y += (mouse.targetY - mouse.y) * ease;
}

// 动画循环
function animate() {
    const canvasW = getCanvasWidth();
    const canvasH = getCanvasHeight();
    
    // 清除画布
    ctx.fillStyle = 'rgba(10, 10, 26, 0.3)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    
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
ctx.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());

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

