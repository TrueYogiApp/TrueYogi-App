

// run when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particles-canvas')
  const ctx = canvas.getContext('2d')
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  const particles = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3
  }))

  // Load planet images
  const neptune = new Image()
  const pluto = new Image()
  const galaxy = new Image()
  const saturn = new Image()
  const portal = new Image()
  const bgalaxy = new Image()

  // 🆕 Load nebula image
  const nebula = new Image()
  nebula.src = 'assets/nebula.webp'
  
  // 🧠 Use relative paths correctly
  neptune.src = 'assets/neptune.png'
  pluto.src = 'assets/pluto.png'
  galaxy.src = 'assets/galaxy.png'
  saturn.src = 'assets/saturn.png'
  portal.src = 'assets/portal.png'
  bgalaxy.src = 'assets/bgalaxy.png'

  // 🆕 Nebula display variables
  let showNebula = false
  let nebulaTimer = 0
  let nebulaScheduled = false
  const NEBULA_DURATION = 60000 // 60 seconds
  const NEBULA_INTERVAL = 180000 // 3 minutes
  
  const planets = [
    { img: neptune, orbit: 100, size: 40, angle: Math.random(), speed: 0.0001, get cx() { return canvas.width * 0.2 }, get cy() { return canvas.height * 0.3 } },
    { img: galaxy, orbit: 220, size: 36, angle: Math.random(), speed: 0.0001, get cx() { return canvas.width * 0.3 }, get cy() { return canvas.height * 0.6 } },
    { img: saturn, orbit: 220, size: 36, angle: Math.random(), speed: 0.00003, get cx() { return canvas.width * 0.9 }, get cy() { return canvas.height * 0.4 } },
    { img: portal, orbit: 220, size: 19, angle: Math.random(), speed: 0.0001, get cx() { return canvas.width * 0.7 }, get cy() { return canvas.height * 0.5 } },
    { img: bgalaxy, orbit: 100, size: 22, angle: Math.random(), speed: 0.0002, get cx() { return canvas.width * 0.8 }, get cy() { return canvas.height * 0.15 } },
  ];
  
  // Spaceship class - BEAUTIFUL look!
  class Spaceship {
    constructor() {
      this.size = Math.random() * 12 + 12; // Slightly larger for visibility
      this.direction = Math.random() < 0.5 ? 1 : -1;
      this.x = this.direction > 0 ? -this.size : canvas.width + this.size;
      this.y = Math.random() * (canvas.height - 60) + 30;
      this.speed = Math.random() * 2.5 + 1.2;
      this.color = `hsl(${Math.random() * 360}, 78%, 58%)`;
      this.wingAngle = 0;
      this.wingDirection = 0.05;
      this.engineParticles = [];
      this.type = Math.random() < 0.7 ? 'normal' : 'warp';
      this.warpCooldown = 0;
      this.visible = true;
    }
    
    update() {
	    if (this.pauseUntil > Date.now()) {
      // Do nothing (pause)
      return;
    }
	
      if (this.type === 'warp') {
        const progress = this.direction > 0 
          ? this.x / canvas.width
          : 1 - (this.x / canvas.width);

        if (this.visible && progress > 0.3 && progress < 0.4) {
          this.visible = false;
          this.warpCooldown = 30;
        }

        if (!this.visible) {
          this.warpCooldown--;
          if (this.warpCooldown <= 0) {
            this.visible = true;
            if (this.direction > 0) {
              this.x = canvas.width * (0.6 + Math.random() * 0.1);
            } else {
              this.x = canvas.width * (0.3 - Math.random() * 0.1);
            }
          }
          return;
        }
      }

      this.x += this.speed * this.direction;
      this.wingAngle += this.wingDirection;

      if (this.wingAngle > 0.5 || this.wingAngle < -0.5) {
        this.wingDirection *= -1;
      }

// Add engine particles occasionally
    // Add engine particles at the BACK
    if (Math.random() < 0.3) {
      this.engineParticles.push({
        offsetX: -this.size/2, // always the rear
        offsetY: 0,
        size: Math.random() * 2 + 1,
        life: 20
      });
    }
    for (let i = this.engineParticles.length - 1; i >= 0; i--) {
      this.engineParticles[i].offsetX -= this.speed * 0.8; // always go further back (independent of direction/scale)
      this.engineParticles[i].life--;
      if (this.engineParticles[i].life <= 0) {
        this.engineParticles.splice(i, 1);
      }
    }

      // Reset if off screen
      if (
        ((this.direction > 0 && this.x > canvas.width + this.size) || 
         (this.direction < 0 && this.x < -this.size))
      ) {
        this.x = this.direction > 0 ? -this.size : canvas.width + this.size;
        this.y = Math.random() * (canvas.height - 60) + 30;
		this.pauseUntil = Date.now() + 10000; // Mothership pause for 10 seconds
      }
    }
    
    draw(ctx) {
      if (this.type === 'warp' && !this.visible) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.direction < 0) ctx.scale(-1, 1);

      // --- BEAUTIFUL SHAPE SECTION ---
	  
	  // Draw engine particles
    // Draw engine particles at the rear
    for (const particle of this.engineParticles) {
      ctx.save();
      ctx.globalAlpha = particle.life / 20;
      ctx.beginPath();
      ctx.arc(particle.offsetX, particle.offsetY, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'warp'
        ? '#7df9ff'
        : (this.type === 'fast' ? '#ff5555' : '#fde68a');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

      // Soft aura glow for warp ships
      if (this.type === 'warp') {
        ctx.globalAlpha = 0.5;
        const auraGrad = ctx.createRadialGradient(0, 0, this.size*0.4, 0, 0, this.size*1.1);
        auraGrad.addColorStop(0, '#7df9ffcc');
        auraGrad.addColorStop(0.5, '#7df9ff44');
        auraGrad.addColorStop(1, 'rgba(125,249,255,0)');
        ctx.beginPath();
        ctx.arc(0, 0, this.size*1.1, 0, Math.PI*2);
        ctx.fillStyle = auraGrad;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw engine glow (universal)
      ctx.save();
      ctx.globalAlpha = 0.36;
      ctx.beginPath();
      ctx.arc(-this.size/2, 0, this.size/3.5, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'warp' ? '#7df9ff' : '#ff5555';
      ctx.shadowColor = this.type === 'warp' ? '#7df9ff' : '#ff5555';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();

      // Ship body: metallic gradient
      let bodyGrad = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
      bodyGrad.addColorStop(0, '#101010');
      bodyGrad.addColorStop(0.3, this.type === 'warp' ? '#7df9ff' : this.color);
      bodyGrad.addColorStop(0.8, '#fff');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size/2, this.size/3, 0, 0, Math.PI * 2);
      ctx.shadowColor = this.type === 'warp' ? '#7df9ff' : this.color;
      ctx.shadowBlur = 5;
      ctx.fill();

      // Cockpit: glass dome
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(this.size/6, 0, this.size/5, this.size/7, 0, 0, Math.PI*2);
      let cockpitGrad = ctx.createRadialGradient(this.size/6, 0, this.size/20, this.size/6, 0, this.size/5);
      cockpitGrad.addColorStop(0, '#fff');
      cockpitGrad.addColorStop(1, this.type === 'warp' ? '#7df9ff' : '#7df9ff66');
      ctx.fillStyle = cockpitGrad;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.restore();

      // Windows/lights
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.size/8, -this.size/8, this.size/14, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // --- Wings: Beautiful shapes ---
      if (this.type === 'warp') {
        // Curved glowing "energy" wings
        ctx.save();
        ctx.shadowColor = '#7df9ff';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#7df9ff';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-this.size/4, 0);
        ctx.quadraticCurveTo(-this.size/2, -this.size/2 * Math.sin(this.wingAngle), 0, -this.size/2);
        ctx.moveTo(-this.size/4, 0);
        ctx.quadraticCurveTo(-this.size/2, this.size/2 * Math.sin(this.wingAngle), 0, this.size/2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Sleek swept wings with metallic gradient
        let wingGrad = ctx.createLinearGradient(-this.size/2, 0, 0, 0);
        wingGrad.addColorStop(0, '#888');
        wingGrad.addColorStop(1, '#fff');
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(-this.size/4, 0);
        ctx.lineTo(-this.size/2, -this.size/2 * Math.sin(this.wingAngle));
        ctx.lineTo(-this.size/2, this.size/2 * Math.sin(this.wingAngle));
        ctx.closePath();
        ctx.fill();
      }

      // Fins: small triangles
      ctx.save();
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.moveTo(-this.size/2, -this.size/7);
      ctx.lineTo(-this.size/2 - 8, 0);
      ctx.lineTo(-this.size/2, this.size/7);
      ctx.closePath();
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
  }
  
  class Mothership extends Spaceship {
  constructor() {
    super();
    this.size = 50;
    this.speed = 0.2 + Math.random() * 0.2; // Slow speed
    this.color = "#fde68a";
    this.type = "mothership";
    this.x = Math.random() < 0.5 ? -this.size : window.innerWidth + this.size;
    this.y = window.innerHeight * 0.55;
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.engineParticles = [];
    this.wingAngle = 0;
    this.wingDirection = 0.03;
	this.pauseUntil = 0;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.direction < 0) ctx.scale(-1, 1);

    // Glowing aura
    ctx.globalAlpha = 0.55;
    let auraGrad = ctx.createRadialGradient(0, 0, this.size * 0.6, 0, 0, this.size * 1.4);
    auraGrad.addColorStop(0, "#fde68a");
    auraGrad.addColorStop(0.7, "#fde68a22");
    auraGrad.addColorStop(1, "rgba(253, 230, 138, 0)");
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    ctx.globalAlpha = 1;

    // Main body (ellipse, gold gradient)
    let bodyGrad = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
    bodyGrad.addColorStop(0, "#f59e0b");
    bodyGrad.addColorStop(0.6, "#fde68a");
    bodyGrad.addColorStop(1, "#fffbe6");
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size/1.1, this.size/2.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = "#fde68a";
    ctx.shadowBlur = 18;
    ctx.fill();

    // Dome (lotus or OM symbol in gold)
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(this.size/5, -this.size/4, this.size/4, this.size/8, 0, 0, Math.PI*2);
    ctx.fillStyle = "#fffbe6";
    ctx.shadowColor = "#fde68a";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

// Multi-color inner halo (ellipse)
ctx.save();
ctx.globalAlpha = 0.33;
const haloGrad = ctx.createRadialGradient(
  this.size/5, -this.size/8, this.size/6,
  this.size/5, -this.size/8, this.size/2
);
haloGrad.addColorStop(0, "#fffbe6");
haloGrad.addColorStop(0.4, "#fde68a");
haloGrad.addColorStop(0.7, "#60a5fa"); // blue
haloGrad.addColorStop(0.9, "#f472b6"); // pink
haloGrad.addColorStop(1, "#fde68a00");
ctx.beginPath();
ctx.ellipse(this.size/5, -this.size/8, this.size/2, this.size/5, 0, 0, Math.PI*2);
ctx.strokeStyle = haloGrad;
ctx.lineWidth = 7;
ctx.shadowColor = "#fde68a";
ctx.shadowBlur = 14;
ctx.stroke();
ctx.restore();

// Inside Mothership.draw(ctx) after main body:
ctx.save();
// Inner cockpit glow (ellipse)
ctx.globalAlpha = 0.85;
ctx.beginPath();
ctx.ellipse(this.size/5, -this.size/8, this.size/5, this.size/9, 0, 0, Math.PI*2);
let cockpitGrad = ctx.createRadialGradient(
  this.size/5, -this.size/8, this.size/16,
  this.size/5, -this.size/8, this.size/5
);
cockpitGrad.addColorStop(0, "#fffbe6");
cockpitGrad.addColorStop(0.8, "#fde68a");
cockpitGrad.addColorStop(1, "rgba(253,230,138,0.3)");
ctx.fillStyle = cockpitGrad;
ctx.shadowColor = "#fde68a";
ctx.shadowBlur = 15;
ctx.fill();
ctx.restore();

// Optional: Soft halo ring inside
ctx.save();
ctx.globalAlpha = 0.19;
ctx.beginPath();
ctx.ellipse(this.size/5, -this.size/8, this.size/3.1, this.size/7, 0, 0, Math.PI*2);
ctx.strokeStyle = "#fde68a";
ctx.lineWidth = 2.7;
ctx.shadowColor = "#fde68a";
ctx.shadowBlur = 6;
ctx.stroke();
ctx.restore();

// 2. Animated “Leader Beacons” Orbiting Dots
const time = Date.now() * 0.001;
for (let i = 0; i < 3; i++) {
  const angle = time + i * (Math.PI * 2 / 3);
  const rx = this.size * 0.7 * Math.cos(angle);
  const ry = this.size * 0.33 * Math.sin(angle);
  const dotRadius = Math.max(2, this.size * 0.05);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(rx, ry, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = ["#fbbf24", "#60a5fa", "#f472b6"][i];
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();
}

// 3. Pulsing Core
const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
ctx.save();
ctx.globalAlpha = 0.18 + 0.16 * pulse;
ctx.beginPath();
ctx.arc(this.size/5, -this.size/8, this.size/8 * pulse, 0, Math.PI*2);
ctx.fillStyle = "#fbbf24";
ctx.shadowColor = "#fde68a";
ctx.shadowBlur = 10;
ctx.fill();
ctx.restore();

// 4. Starburst Rays
ctx.save();
ctx.globalAlpha = 0.13;
const timee = Date.now() * 0.0003; // Slow rotation
const rayCount = 12;              // More rays!
const rayLength = this.size * 1.5;  // Longer rays
for (let i = 0; i < rayCount; i++) {
  const angle = i * (Math.PI * 2 / rayCount) + timee;
  ctx.beginPath();
  ctx.moveTo(this.size/5, -this.size/8);
  ctx.lineTo(
    this.size/5 + Math.cos(angle) * rayLength,
    -this.size/8 + Math.sin(angle) * rayLength
  );
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#fde68a";
  ctx.stroke();
}
ctx.restore();

    // Engine glow (bigger and gold)
    ctx.save();
    ctx.globalAlpha = 0.47;
    ctx.beginPath();
    ctx.arc(-this.size/2, 0, this.size/3.1, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#fde68a";
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.restore();

    // Wings - double arched, glowing
    ctx.save();
    ctx.shadowColor = "#fde68a";
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-this.size/4, 0);
    ctx.quadraticCurveTo(-this.size/1.2, -this.size/2 * Math.sin(this.wingAngle), 0, -this.size/1.3);
    ctx.moveTo(-this.size/4, 0);
    ctx.quadraticCurveTo(-this.size/1.2, this.size/2 * Math.sin(this.wingAngle), 0, this.size/1.3);
    ctx.stroke();
    ctx.restore();

    // Fins: big triangles
    ctx.save();
    ctx.fillStyle = "#fbbf24";
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(-this.size/2, -this.size/6);
    ctx.lineTo(-this.size/2 - 14, 0);
    ctx.lineTo(-this.size/2, this.size/6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

  // Spaceships - 3 regular (first is fast, red), 2 warp
  const spaceships = [];
  for (let i = 0; i < 3; i++) {
    const ship = new Spaceship();
    if (i === 0) {
      ship.speed = Math.random() * 4 + 3;
      ship.type = 'fast';
      ship.color = '#ff5555';
    } else {
      ship.type = 'normal';
    }
    spaceships.push(ship);
  }

  for (let i = 0; i < 2; i++) {
    const ship = new Spaceship();
    ship.type = 'warp';
    spaceships.push(ship);
  }
  
    // --- Add the Mothership ---
const mothership = new Mothership();
spaceships.push(mothership);

  // Wait for all images to load before starting animation
  const images = [neptune, pluto, galaxy, saturn, portal, bgalaxy, nebula];
  let imagesLoaded = 0;
  function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === images.length) {
      animate();
    }
  }
  images.forEach(img => {
    if (img.complete) {
      checkAllImagesLoaded();
    } else {
      img.onload = checkAllImagesLoaded;
      img.onerror = checkAllImagesLoaded;
    }
  });

// 🆕 Function to handle nebula display timing
function updateNebulaTiming() {
  if (screensaverActive) {
    // First appearance after screensaver has been active for 30 seconds
    if (!showNebula && !nebulaScheduled) {
      // Check if screensaver has been active for at least 30 seconds
      const screensaverActiveTime = Date.now() - (window.screensaverStartTime || Date.now());
      if (screensaverActiveTime > 30000) {
        showNebula = true;
        nebulaTimer = Date.now();
        nebulaScheduled = false;
		document.body.classList.add('nebula-active');
      }
    } else if (showNebula) {
      // Check if nebula display duration is over (10 seconds)
      if (Date.now() - nebulaTimer > NEBULA_DURATION) {
        showNebula = false;
        // Schedule next appearance in 5 minutes
        nebulaScheduled = true;
		document.body.classList.remove('nebula-active');
        setTimeout(() => {
          if (screensaverActive) {
            showNebula = true;
            nebulaTimer = Date.now();
            nebulaScheduled = false;
			document.body.classList.add('nebula-active');
          }
        }, NEBULA_INTERVAL);
      }
    }
  }
}

  // 🆕 Override showScreensaver to track start time
  const originalShowScreensaver = window.showScreensaver;
  window.showScreensaver = function() {
    if (originalShowScreensaver) originalShowScreensaver();
    window.screensaverStartTime = Date.now();
    // Reset nebula state when screensaver starts
    showNebula = false;
	nebulaScheduled = false;
	document.body.classList.remove('nebula-active');
  };

  // 🆕 Override hideScreensaver to reset nebula state
  const originalHideScreensaver = window.hideScreensaver;
  window.hideScreensaver = function() {
    if (originalHideScreensaver) originalHideScreensaver();
    showNebula = false;
	document.body.classList.remove('nebula-active');
  };
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🆕 Update nebula timing
    updateNebulaTiming();

    // 🆕 Draw nebula first (as background) if visible
    if (showNebula && nebula.complete && nebula.naturalWidth > 0) {
      // Draw nebula full screen
      ctx.drawImage(nebula, 0, 0, canvas.width, canvas.height);
    }


    // ✨ Update and draw particles
    ctx.fillStyle = '#fde68a';
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 🪐 Draw orbiting planets
    for (const planet of planets) {
      planet.angle += planet.speed;
      const px = planet.cx + planet.orbit * Math.cos(planet.angle);
      const py = planet.cy + planet.orbit * Math.sin(planet.angle);
      if (planet.img && planet.img.complete && planet.img.naturalWidth > 0) {
        ctx.drawImage(
          planet.img,
          px - planet.size / 2,
          py - planet.size / 2,
          planet.size,
          planet.size
        );
      }
    }
    
    // 🚀 Update and draw spaceships
    for (const ship of spaceships) {
      ship.update();
      ship.draw(ctx);
    }

    requestAnimationFrame(animate);
  }
  // Animation will start after all images are loaded
})


