const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [],
	connections = [],
	starCount = 120,
	maxConnections = 10,
	w, h;

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function initStars() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
	stars = [];
	for (let i = 0; i < starCount; i++) {
		stars.push({
			x: random(0, w),
			y: random(0, h),
			radius: random(0.5, 1.7),
			vx: random(-0.3, 0.3),
			vy: random(-0.3, 0.3),
			alpha: random(0.3, 1),
			flicker: random(0.002, 0.006),
			fertile: Math.random() < 0.35
		});
	}
}

function initConnections() {
	connections = [];
	for (let i = 0; i < starCount; i++) {
		for (let j = i + 1; j < starCount; j++) {
			if (!stars[i].fertile || !stars[j].fertile) continue;
			if (connections.length >= maxConnections) break;
			let dx = stars[i].x - stars[j].x,
				dy = stars[i].y - stars[j].y;
			let dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 140) {
				connections.push({
					i,
					j,
					alpha: 0,
					targetAlpha: 0.6,
					timer: random(100, 300),
					active: Math.random() < 0.2,
					fading: false
				});
			}
		}
	}
}

function drawConnections() {
	connections.forEach((c) => {
		const s1 = stars[c.i],
			s2 = stars[c.j];
		let dx = s1.x - s2.x,
			dy = s1.y - s2.y,
			dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 140 && !c.fading) c.fading = true;
		c.timer--;
		if (c.timer <= 0) {
			c.active = !c.active;
			c.timer = random(100, 400);
		}
		if (c.fading) c.alpha -= 0.02;
		else if (c.active && c.alpha < c.targetAlpha) c.alpha += 0.01;
		else if (!c.active && c.alpha > 0) c.alpha -= 0.01;
		c.alpha = Math.max(0, Math.min(c.targetAlpha, c.alpha));
		if (c.alpha > 0) {
			ctx.beginPath();
			ctx.moveTo(s1.x, s1.y);
			ctx.lineTo(s2.x, s2.y);
			ctx.strokeStyle = `rgba(255,255,255,${c.alpha})`;
			ctx.lineWidth = 0.4;
			ctx.stroke();
		}
	});
	connections = connections.filter(c => c.alpha > 0);
	while (connections.length < maxConnections) {
		let i = Math.floor(Math.random() * starCount),
			j = Math.floor(Math.random() * starCount);
		if (i === j) continue;
		if (!stars[i].fertile || !stars[j].fertile) continue;
		let dx = stars[i].x - stars[j].x,
			dy = stars[i].y - stars[j].y;
		if (Math.sqrt(dx * dx + dy * dy) < 140 && !connections.some(c => (c.i === i && c.j === j) || (c.i === j && c.j === i))) {
			connections.push({
				i,
				j,
				alpha: 0,
				targetAlpha: 0.6,
				timer: random(100, 300),
				active: Math.random() < 0.2,
				fading: false
			});
		}
	}
}

function drawStars() {
	stars.forEach(star => {
		star.alpha += (Math.random() > 0.5 ? 1 : -1) * star.flicker;
		star.alpha = Math.max(0.3, Math.min(1, star.alpha));
		star.x += star.vx;
		star.y += star.vy;
		if (star.x < 0 || star.x > w) star.vx *= -1;
		if (star.y < 0 || star.y > h) star.vy *= -1;
		ctx.beginPath();
		ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
		ctx.fill();
	});
}

function draw() {
	ctx.fillStyle = "#0b0c1a";
	ctx.fillRect(0, 0, w, h);
	drawStars();
	drawConnections();
	requestAnimationFrame(draw);
}
window.addEventListener('resize', () => {
	initStars();
	initConnections();
});
initStars();
initConnections();
draw();
