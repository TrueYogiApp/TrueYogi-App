
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meditation-canvas');
  const ctx = canvas.getContext('2d');
  // const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // DNA helix parameters
  const dnaNodes = 30;
  const dnaSegments = 20;
  const dnaRadius = 120;
  const nodeRadius = 4;
  let dnaRotation = 0;
  let showDNA = true;
  let transitionProgress = 0;
  const transitionDuration = 648000; // frames for DNA to stay visible

  // Gentle drifting stars
  const stars = Array.from({ length: isMobile() ? 18 : 33 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    speed: (Math.random() * 0.05) + 0.02
  }));

  // Aurora-like waves data
  let t = 0;
  let frameCount = 0;

  // NEW: Neurons and biophotons data
  const neurons = Array.from({ length: isMobile() ? 7 : 13 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    connections: [],
    lastFired: Math.random() * 1000, // Stagger initial firing
    firing: 0,
    radius: Math.random() * 3 + 2
  }));

  // Create connections between neurons
  neurons.forEach((neuron, i) => {
    // Connect to 2-4 other neurons
    const numConnections = Math.floor(Math.random() * 3) + 2;
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = Math.floor(Math.random() * neurons.length);
      if (targetIndex !== i) {
        neuron.connections.push(targetIndex);
      }
    }
  });

  // Biophotons (subtle light particles)
  const biophotons = Array.from({ length: isMobile() ? 12 : 25 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.8 + 0.3,
    angle: Math.random() * Math.PI * 2,
    life: Math.random() * 100,
    maxLife: 300 + Math.random() * 200
  }));

function getUnlockedChakraIndex(currentDay) {
  if (currentDay >= 41) return 6; // Crown
  if (currentDay >= 36) return 5; // Third Eye
  if (currentDay >= 29) return 4; // Throat
  if (currentDay >= 22) return 3; // Heart
  if (currentDay >= 15) return 2; // Solar Plexus
  if (currentDay >= 8)  return 1; // Sacral
  return 0; // Root
}

// Draw 7 chakra petals from bottom to top
const chakraColors = [
    {hue: 360, name: "Root"},      // Red (bottom)
    {hue: 30, name: "Sacral"},     // Orange
    {hue: 60, name: "Solar"},      // Yellow
    {hue: 120, name: "Heart"},     // Green
    {hue: 210, name: "Throat"},    // Blue
    {hue: 270, name: "Third Eye"}, // Indigo
    {hue: 300, name: "Crown"}      // Violet (top)
];

// ===== CHAKRA TOOLTIP CODE =====

	// Show tooltip - CENTERED
function showChakraTooltip(chakraIndex, x, y) {
    const tooltip = document.getElementById('chakra-tooltip');
    if (!tooltip) return;
    
    const i = chakraIndex; // Short alias
	const t = window.t || ((key) => key); 
    
    // Get translated values using your t() function
    const name = t(`chakra.${i}.name`);
    const sanskrit = t(`chakra.${i}.sanskrit`);
    const color = t(`chakra.${i}.color`);
    const meaning = t(`chakra.${i}.meaning`);
	const petals = t(`chakra.${i}.petals`); 
	const mantra = t(`chakra.${i}.mantra`); 
	const frequency = t(`chakra.${i}.frequency`); 
	const gland = t(`chakra.${i}.gland`);
    const affirmation = t(`chakra.${i}.affirmation`);
    const element = t(`chakra.${i}.element`);
    const benefits = t(`chakra.${i}.benefits`);
	const balanced = t(`chakra.${i}.balanced`);
	const unbalanced = t(`chakra.${i}.unbalanced`);
	const lesson = t(`chakra.${i}.lesson`);           // NEW
	const question = t(`chakra.${i}.question`);       // NEW
	const practice = t(`chakra.${i}.practice`);       // NEW
    
    // Fill in the tooltip
    document.getElementById('chakra-tooltip-title').textContent = name;
    document.getElementById('chakra-tooltip-sanskrit').textContent = `${sanskrit} • ${color} • ${petals} ${t('chakra.label.petals')}`;
    
    // Update labels
    document.getElementById('label-meaning').textContent = t('chakra.label.meaning') + ':';
 	document.getElementById('label-mantra').textContent = t('chakra.label.mantra') + ':'; 
	document.getElementById('label-frequency').textContent = t('chakra.label.frequency') + ':'; 
	document.getElementById('label-gland').textContent = t('chakra.label.gland') + ':'; 
    document.getElementById('label-affirmation').textContent = t('chakra.label.affirmation') + ':';
    document.getElementById('label-element').textContent = t('chakra.label.element') + ':';
    document.getElementById('label-benefits').textContent = t('chakra.label.benefits') + ':';
	document.getElementById('label-balanced').textContent = t('chakra.label.balanced') + ':';
	document.getElementById('label-unbalanced').textContent = t('chakra.label.unbalanced') + ':';
	document.getElementById('label-lesson').textContent = t('chakra.label.lesson') + ':';        // NEW
	document.getElementById('label-question').textContent = t('chakra.label.question') + ':';    // NEW
	document.getElementById('label-practice').textContent = t('chakra.label.practice') + ':';    // NEW
    
    // Update values
    document.getElementById('chakra-meaning').textContent = meaning;
 	document.getElementById('chakra-mantra').textContent = mantra;
	document.getElementById('chakra-frequency').textContent = frequency;
	document.getElementById('chakra-gland').textContent = gland;
    document.getElementById('chakra-affirmation').textContent = `"${affirmation}"`;
    document.getElementById('chakra-element').textContent = element;
    document.getElementById('chakra-benefits').textContent = benefits;
	document.getElementById('chakra-balanced').textContent = balanced;
	document.getElementById('chakra-unbalanced').textContent = unbalanced;
	document.getElementById('chakra-lesson').textContent = lesson;          // NEW
	document.getElementById('chakra-question').textContent = `"${question}"`; // NEW (with quotes)
	document.getElementById('chakra-practice').textContent = practice;      // NEW
    document.getElementById('chakra-status').textContent = t('chakra.status.unlocked');
    
    // Center on screen
    const tooltipWidth = 300;
    const tooltipHeight = 580;  // Increased for new content
    let left = (window.innerWidth - tooltipWidth) / 2;
    let top = (window.innerHeight - tooltipHeight) / 2;
    
    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
}


	// Hide tooltip
function hideTooltip() {
    const tooltip = document.getElementById('chakra-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Auto-hide tooltip when session ends
let __lastSessionActive = typeof sessionActive !== 'undefined' ? sessionActive : false;

setInterval(() => {
    const currentSessionActive = typeof sessionActive !== 'undefined' ? sessionActive : false;
    
    if (__lastSessionActive && !currentSessionActive) {
        hideTooltip();
    }
    
    __lastSessionActive = currentSessionActive;
}, 500);

 
// Click handler using document click
document.addEventListener('click', function(e) {
    // ONLY show tooltip during active meditation session
    if (typeof sessionActive === "undefined" || !sessionActive) {
        return;
    }
    if (typeof currentMode === "undefined" || currentMode !== "yogi") {
        return;
    }
    
    // IGNORE clicks on UI elements (avatar, buttons, etc.)
    if (e.target.closest('.avatar-container') ||
        e.target.closest('#logo-sacred') ||
        e.target.closest('button') ||
        e.target.closest('#timer-section') ||
        e.target.closest('#mode-selection') ||
        e.target.closest('#chakra-tooltip') ||
        e.target.closest('#proof-of-stillness-heading') ||
        e.target.closest('#proof-of-stillness-subtitle') ||
        e.target.closest('#yogi-quote')) {
        return; // Let the UI element handle the click
    }
    
    const canvas = document.getElementById('meditation-canvas');
    if (!canvas) return;
    
    // Also check the canvas isn't hidden
    if (canvas.classList.contains('hidden')) {
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if click is inside canvas
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        hideTooltip();
        return;
    }
    
    // Convert to canvas coordinates
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;
    const centerX = canvas.width / 2;
    const bottomOffset = 80;
    const topOffset = 80;
    const availableHeight = canvas.height - bottomOffset - topOffset;
    
    // Check each unlocked chakra
    for (let chakra = 0; chakra <= unlockedChakra; chakra++) {
        const chakraY = canvas.height - bottomOffset - (availableHeight * (chakra / 6));
        const chakraSize = 25 + chakra * 4;
        const distance = Math.hypot(mouseX - centerX, mouseY - chakraY);
        
        if (distance < chakraSize + 25) {
            showChakraTooltip(chakra, e.clientX, e.clientY);
            return;
        }
    }
    
    hideTooltip();
});
	

// Get user's current challenge day - try multiple sources
let currentDay = 1;

// First try localStorage (where the real data is)
try {
    const storedData = localStorage.getItem('yogiChallenge');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.currentDay) {
            currentDay = parsedData.currentDay;
            //console.log('Found currentDay in localStorage:', currentDay);
        }
    }
} catch(e) {
    console.warn('Error reading from localStorage:', e);
}

// Fallback to challengeData if localStorage didn't work
if (currentDay === 1 && challengeData && challengeData.currentDay) {
    currentDay = challengeData.currentDay;
    //console.log('Found currentDay in challengeData:', currentDay);
}

//console.log('Final currentDay used:', currentDay);

const unlockedChakra = getUnlockedChakraIndex(currentDay);
const chakraPetalCounts = [4, 6, 10, 12, 16, 2, 32]; // Petal counts for chakras

  // NEW: Draw neurons and connections
function drawNeurons() {
  // Draw connections first (behind neurons)
  neurons.forEach(neuron => {
    if (neuron.firing > 0) {
      neuron.connections.forEach(connIndex => {
        const target = neurons[connIndex];
        // Only draw connection when firing
        const alpha = Math.min(neuron.firing, target.firing) * 0.15;
        if (alpha > 0.01) {
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = `hsla(300, 70%, 80%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Add a subtle glow to active connections
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = `hsla(180, 50%, 90%, ${alpha * 0.3})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    }
  });

  // Draw neurons (with realistic appearance)
  neurons.forEach(neuron => {
    // --- Soma: Irregular oval instead of perfect circle ---
    ctx.save();
    ctx.translate(neuron.x, neuron.y);
    ctx.rotate(Math.random() * Math.PI); // Random rotation for organic feel
    ctx.beginPath();
    ctx.ellipse(
      0, 0,
      neuron.radius * (1.1 + Math.random() * 0.3),
      neuron.radius * (0.7 + Math.random() * 0.25),
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = neuron.firing > 0
      ? `hsla(300, 80%, 90%, ${0.5 + neuron.firing * 0.5})`
      : `hsla(300, 30%, 70%, 0.3)`;
    ctx.shadowColor = neuron.firing > 0 ? '#eab308' : '#fffbe6';
    ctx.shadowBlur = neuron.firing > 0 ? 16 * neuron.firing : 5;
    ctx.fill();
    ctx.restore();

    // --- Dendrites/Axons: Branches radiating out ---
    const branchCount = 3 + Math.floor(Math.random() * 3); // 3–5 branches
    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI * 2 + Math.random() * 0.4;
      const length = neuron.radius * (2.5 + Math.random());
      ctx.beginPath();
      ctx.moveTo(neuron.x, neuron.y);
      ctx.lineTo(
        neuron.x + Math.cos(angle) * length,
        neuron.y + Math.sin(angle) * length
      );
      ctx.strokeStyle = neuron.firing > 0
        ? `hsla(300, 70%, 80%, ${0.23 + neuron.firing * 0.27})`
        : `hsla(300, 20%, 60%, 0.23)`;
      ctx.lineWidth = neuron.firing > 0 ? 1.5 : 1;
      ctx.shadowColor = neuron.firing > 0 ? '#eab308' : '#fffbe6';
      ctx.shadowBlur = neuron.firing > 0 ? 10 * neuron.firing : 2;
      ctx.stroke();
    }

    // --- Optionally: Draw a small core nucleus for the soma ---
    ctx.beginPath();
    ctx.arc(neuron.x, neuron.y, neuron.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = neuron.firing > 0
      ? `hsla(300, 90%, 98%, ${0.8 * neuron.firing})`
      : `hsla(300, 60%, 90%, 0.23)`;
    ctx.shadowBlur = neuron.firing > 0 ? 12 * neuron.firing : 0;
    ctx.fill();
  });
}

  // NEW: Update neurons - make them fire occasionally
  function updateNeurons() {
    neurons.forEach(neuron => {
      neuron.lastFired++;
      
      // Random firing with slightly increased chance during DNA visibility
      const fireChance = showDNA ? 0.002 : 0.0008;
      
      if (neuron.firing > 0) {
        neuron.firing -= 0.05;
        if (neuron.firing < 0) neuron.firing = 0;
      } else if (Math.random() < fireChance) {
        neuron.firing = 1;
        neuron.lastFired = 0;
        
        // Trigger connected neurons with decreasing probability
        neuron.connections.forEach(connIndex => {
          if (Math.random() < 0.6) {
            neurons[connIndex].firing = 0.8;
          }
        });
      }
    });
  }

  // NEW: Draw biophotons (subtle light particles)
  function drawBiophotons() {
    biophotons.forEach(photon => {
      photon.life++;
      
      // Reset photon when it expires
      if (photon.life > photon.maxLife) {
        photon.x = Math.random() * canvas.width;
        photon.y = Math.random() * canvas.height;
        photon.life = 0;
        photon.maxLife = 100 + Math.random() * 200;
        photon.angle = Math.random() * Math.PI * 2;
      }
      
      // Move photon
      photon.x += Math.cos(photon.angle) * photon.speed;
      photon.y += Math.sin(photon.angle) * photon.speed;
      
      // Wrap around edges
      if (photon.x < 0) photon.x = canvas.width;
      if (photon.x > canvas.width) photon.x = 0;
      if (photon.y < 0) photon.y = canvas.height;
      if (photon.y > canvas.height) photon.y = 0;
      
      // Occasionally change direction
      if (Math.random() < 0.01) {
        photon.angle += (Math.random() - 0.5) * 0.5;
      }
      
      // Draw with pulsating effect
      const pulse = 0.5 + 0.5 * Math.sin(photon.life * 0.05);
      const alpha = 0.1 + 0.1 * (photon.life / photon.maxLife) * pulse;
      
      ctx.beginPath();
      ctx.arc(photon.x, photon.y, photon.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(180, 70%, 90%, ${alpha * 0.4})`;
      ctx.fill();
      
      // Add a subtle glow
      ctx.beginPath();
      ctx.arc(photon.x, photon.y, photon.size * pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(180, 50%, 95%, ${alpha * 0.2})`;
      ctx.fill();
    });
  }

  // Draw DNA helix
  function drawDNA() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const showChakraPetals = true;
 
    if (showChakraPetals && typeof currentMode !== "undefined" && currentMode === "yogi") {
      const bottomOffset = 80; // Space for button
      const topOffset = 80;     // Space for top padding
      const availableHeight = canvas.height - bottomOffset - topOffset;

      for (let chakra = 0; chakra <= unlockedChakra; chakra++) {
        // Space chakras evenly between topOffset and bottomOffset
        const chakraY = canvas.height - bottomOffset - (availableHeight * (chakra / 6));
        const chakraSize = 25 + chakra * 4;
        
        // Draw petal shapes instead of circles
        const petalCount = chakraPetalCounts[chakra];
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + dnaRotation;
          const petalLength = chakraSize * 1.3;
          
          ctx.beginPath();
          ctx.moveTo(canvas.width/2, chakraY);
          
          // Create petal shape with Bezier curves
          const cp1x = canvas.width/2 + Math.cos(angle) * petalLength;
          const cp1y = chakraY + Math.sin(angle) * petalLength;
          const cp2x = canvas.width/2 + Math.cos(angle + Math.PI/8) * petalLength * 0.7;
          const cp2y = chakraY + Math.sin(angle + Math.PI/8) * petalLength * 0.7;
          
          ctx.bezierCurveTo(
            cp1x, cp1y,
            cp2x, cp2y,
            canvas.width/2, chakraY
          );
          
          // Chakra colors from bottom to top
          ctx.fillStyle = `hsla(${chakraColors[chakra].hue}, 80%, 60%, 0.4)`;
          ctx.strokeStyle = `hsla(${chakraColors[chakra].hue}, 90%, 70%, 0.8)`;
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }
        
		// Enhanced Third Eye (Ajna) chakra glow
		if (chakra === 5) {
		  ctx.save();
		  
		  // Create pulsing effect for the glow
		  const pulseIntensity = 0.5 + 0.3 * Math.sin(Date.now() * 0.002);
		  const glowSize = 55 + 12 * pulseIntensity; // Increased base size
		  
		  // Inner intense glow - more vibrant
		  ctx.globalAlpha = 0.7 * pulseIntensity;
		  let glowGradient = ctx.createRadialGradient(
			canvas.width/2, chakraY, 0,
			canvas.width/2, chakraY, glowSize
		  );
		  glowGradient.addColorStop(0, `hsla(${chakraColors[5].hue}, 98%, 80%, 1)`);
		  glowGradient.addColorStop(0.5, `hsla(${chakraColors[5].hue}, 90%, 65%, 0.6)`);
		  glowGradient.addColorStop(0.8, `hsla(${chakraColors[5].hue}, 85%, 55%, 0.3)`);
		  glowGradient.addColorStop(1, `hsla(${chakraColors[5].hue}, 80%, 50%, 0)`);
		  
		  ctx.beginPath();
		  ctx.ellipse(canvas.width/2, chakraY, glowSize, glowSize/1.8, 0, 0, Math.PI * 2);
		  ctx.fillStyle = glowGradient;
		  ctx.fill();
		  
		  // Outer subtle glow - expanded
		  ctx.globalAlpha = 0.3;
		  glowGradient = ctx.createRadialGradient(
			canvas.width/2, chakraY, 0,
			canvas.width/2, chakraY, glowSize * 2.2
		  );
		  glowGradient.addColorStop(0, `hsla(${chakraColors[5].hue}, 95%, 70%, 0.4)`);
		  glowGradient.addColorStop(1, `hsla(${chakraColors[5].hue}, 90%, 60%, 0)`);
		  
		  ctx.beginPath();
		  ctx.ellipse(canvas.width/2, chakraY, glowSize * 2.2, glowSize * 1.1, 0, 0, Math.PI * 2);
		  ctx.fillStyle = glowGradient;
		  ctx.fill();
		  
		  // Enhanced glowing particles with varying sizes
				  // Add glowing particles around Third Eye
				  ctx.globalAlpha = 0.7;
				  for (let i = 0; i < 8; i++) {
					const angle = (i / 8) * Math.PI * 2 + dnaRotation;
					const distance = glowSize + 15;
					const particleSize = 2 + pulseIntensity * 1.5;
					
					ctx.beginPath();
					ctx.arc(
					  canvas.width/2 + Math.cos(angle) * distance,
					  chakraY + Math.sin(angle) * distance,
					  particleSize, 0, Math.PI * 2
					);
					ctx.fillStyle = `hsla(${chakraColors[5].hue + i * 10}, 90%, 70%, ${0.8 - i * 0.1})`;
					ctx.fill();
				  }
			
		  // ADDITION: Central core with brighter glow
		  ctx.globalAlpha = 0.9;
		  const coreGradient = ctx.createRadialGradient(
			canvas.width/2, chakraY, 0,
			canvas.width/2, chakraY, glowSize * 0.4
		  );
		  coreGradient.addColorStop(0, `hsla(${chakraColors[5].hue}, 100%, 90%, 1)`);
		  coreGradient.addColorStop(1, `hsla(${chakraColors[5].hue}, 95%, 70%, 0)`);
		  
		  ctx.beginPath();
		  ctx.arc(canvas.width/2, chakraY, glowSize * 0.4, 0, Math.PI * 2);
		  ctx.fillStyle = coreGradient;
		  ctx.fill();
		  
		  ctx.restore();
		}
        
        // After drawing petals for Crown
        if (chakra === 6) {
          ctx.save();
          // Crown's radiant glow: big, soft, violet-white halo
          ctx.globalAlpha = 0.18;
          const glowColor = `hsla(${chakraColors[6].hue}, 90%, 90%, 1)`; // Violet-white
          ctx.beginPath();
          ctx.arc(canvas.width/2, chakraY, chakraSize * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 32;
          ctx.fill();
          ctx.restore();

          // Optional: Layered petals for extra "lotus" effect
          ctx.save();
          ctx.globalAlpha = 0.11;
          ctx.beginPath();
          ctx.arc(canvas.width/2, chakraY, chakraSize * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${chakraColors[6].hue}, 90%, 80%, 1)`;
          ctx.shadowColor = `hsla(${chakraColors[6].hue}, 90%, 80%, 1)`;
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.restore();

          // Central point - bright violet/white
          ctx.beginPath();
          ctx.arc(canvas.width/2, chakraY, 8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${chakraColors[6].hue}, 100%, 95%, 1)`;
          ctx.shadowColor = `#fff`;
          ctx.shadowBlur = 1;
          ctx.fill();
        }

        // Add a central point for each chakra
        ctx.beginPath();
        ctx.arc(canvas.width/2, chakraY, 5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${chakraColors[chakra].hue}, 100%, 70%, 0.9)`;
        ctx.fill();
      }
    }		
    
    // Draw nodes for both strands
    for (let i = 0; i < dnaNodes; i++) {
      const progress = i / dnaNodes;
      const angle = progress * Math.PI * 4 + dnaRotation;
      
      // --- Chakra color mapping ---
      // Map node index from 0 (bottom) to dnaNodes-1 (top) to chakras 0-6
      const chakraPos = (dnaNodes - 1 - i) / (dnaNodes - 1) * (chakraColors.length - 1);
      const lowerIdx = Math.floor(chakraPos);
      const upperIdx = Math.min(lowerIdx + 1, chakraColors.length - 1);
      const frac = chakraPos - lowerIdx;
      const lowerHue = chakraColors[lowerIdx].hue;
      const upperHue = chakraColors[upperIdx].hue;
      const hue = lowerHue + (upperHue - lowerHue) * frac;
      
    // Calculate positions for both strands
    const x1 = centerX + Math.cos(angle) * dnaRadius;
    const y1 = centerY - canvas.height/2 + i * (canvas.height / dnaNodes);
    
    const x2 = centerX + Math.cos(angle + Math.PI) * dnaRadius;
    const y2 = centerY - canvas.height/2 + i * (canvas.height / dnaNodes);
    
    // Draw enhanced connecting lines between the two strands
    if (i % 2 === 0) {
      // Calculate line properties
      const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const lineAngle = Math.atan2(y2 - y1, x2 - x1);
      
      // Create pulsing effect
      const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.005 + i * 0.3);
      
      // Draw main connecting line with gradient
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(lineAngle);
      
      // Main line with gradient
      const gradient = ctx.createLinearGradient(0, 0, lineLength, 0);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${0.8 * pulseIntensity})`);
      gradient.addColorStop(0.3, `hsla(${hue}, 100%, 85%, ${0.9 * pulseIntensity})`);
      gradient.addColorStop(0.5, `hsla(${hue + 20}, 100%, 90%, ${1 * pulseIntensity})`);
      gradient.addColorStop(0.7, `hsla(${hue}, 100%, 85%, ${0.9 * pulseIntensity})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, ${0.8 * pulseIntensity})`);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lineLength, 0);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 * pulseIntensity;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.7)`;
      ctx.stroke();
      
      // Add glow effect underneath
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lineLength, 0);
      ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.3)`;
      ctx.lineWidth = 6 * pulseIntensity;
      ctx.stroke();
      
      ctx.restore();
      
      // Add energy particles along the line (randomly)
      if (Math.random() < 0.3) {
        const particlePos = Math.random();
        const px = x1 + (x2 - x1) * particlePos;
        const py = y1 + (y2 - y1) * particlePos;
        
        ctx.beginPath();
        ctx.arc(px, py, 1.2 * pulseIntensity, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + 30}, 100%, 95%, ${0.9 * pulseIntensity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
        ctx.fill();
      }
    }
	
      // First strand nodes
      drawNode(
        centerX + Math.cos(angle) * dnaRadius,
        centerY - canvas.height/2 + i * (canvas.height / dnaNodes),
        angle,
        hue
      );
      
      // Second strand nodes (opposite side)
      drawNode(
        centerX + Math.cos(angle + Math.PI) * dnaRadius,
        centerY - canvas.height/2 + i * (canvas.height / dnaNodes),
        angle + Math.PI,
        hue
      );
    }
  }
  
  // Draw a single node of the DNA
  function drawNode(x, y, angle, hue) {
    // Create gradient based on chakra hue
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 2);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.3)`);
    
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add glow effect
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius * 3, 0, Math.PI * 2);
    const glowGradient = ctx.createRadialGradient(x, y, nodeRadius, x, y, nodeRadius * 3);
    glowGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.5)`);
    glowGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
    ctx.fillStyle = glowGradient;
    ctx.fill();
  }


// Draw Cosmic energy as flowing particles moving upward
function drawCosmicEnergy() {
  const centerX = canvas.width / 2;
  const waveWidth = 35; // Width of the energy flow
  const particleCount = isMobile() ? 150 : 333; // Number of particles
  const riseSpeed = 1.8; // Speed of upward movement
  
  ctx.save();
  
  // Create and update particles
  if (!window.cosmicParticles) {
    // Initialize particles if they don't exist
    window.cosmicParticles = [];
    for (let i = 0; i < particleCount; i++) {
      window.cosmicParticles.push({
        x: centerX + (Math.random() - 0.5) * waveWidth,
        y: Math.random() * canvas.height * 0.2,
        size: Math.random() * 2 + 1,
        speed: Math.random() * riseSpeed + riseSpeed * 0.5,
        hue: Math.random() * 60 + 50, // Golden to yellow
        life: Math.random() * 100,
        oscillation: Math.random() * Math.PI * 2
      });
    }
  }
  
  // Update and draw particles
  window.cosmicParticles.forEach(particle => {
    // Move particle upward
    particle.y += particle.speed;
    particle.life += 0.1;
    particle.oscillation -= 0.05;
    
    // Reset particle if it goes off the top
    if (particle.y > canvas.height + 10) {
      particle.y = -10;
      particle.x = centerX + (Math.random() - 0.5) * waveWidth;
      particle.hue = 50 + Math.random() * 20; // Reset to golden color
      particle.size = Math.random() * 2 + 1;
    }
    
    // Oscillate slightly side to side
    particle.x = centerX + Math.sin(particle.oscillation) * waveWidth/2;
    
    // Color transition as particle rises (golden → violet → light blue)
    const heightRatio = particle.y / canvas.height;
	const hueRange = 360 - 280;
if (heightRatio < 0.15) {
    particle.hue = 280; // Violet - Crown (top)
} else if (heightRatio < 0.25) {
    particle.hue = 270; // Indigo - Third Eye
} else if (heightRatio < 0.35) {
    particle.hue = 210; // Blue - Throat
} else if (heightRatio < 0.5) {
    particle.hue = 120; // Green - Heart
} else if (heightRatio < 0.65) {
    particle.hue = 60;  // Yellow - Solar Plexus
} else if (heightRatio < 0.8) {
    particle.hue = 30;  // Orange - Sacral
} else {
    particle.hue = 0;   // Red - Root (bottom)
}
    
    // Draw the particle
    const pulse = 0.7 + 0.3 * Math.sin(particle.life * 0.1);
    const alpha = 0.7 + 0.3 * Math.sin(particle.life * 0.05);
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
    
    // Create gradient fill for each particle
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    );
    gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 80%, ${alpha})`);
    gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${particle.hue}, 100%, 70%, 0.7)`;
    ctx.fill();
    
    // Add a tiny sparkle trail
    if (Math.random() < 0.3) {
      ctx.beginPath();
      ctx.arc(
        particle.x + (Math.random() - 0.5) * 3,
        particle.y + (Math.random() - 0.5) * 3,
        particle.size * 0.5,
        0, Math.PI * 2
      );
      ctx.fillStyle = `hsla(${particle.hue + 20}, 100%, 90%, 0.4)`;
      ctx.fill();
    }
  });
  
  ctx.restore();
}

// Draw shining silver fluid energy rising from root chakra
function drawSilverEnergy() {
  const centerX = canvas.width / 2;
  const waveWidth = 25;
  // Dynamically set particle count based on unlocked chakra
  const baseCount = isMobile() ? 13 : 20;
  const particleCount = baseCount * (unlockedChakra + 1);

  // Get the current unlocked chakra Y position
  const bottomOffset = 80;
  const topOffset = 80;
  const availableHeight = canvas.height - bottomOffset - topOffset;
  const targetChakraY = canvas.height - bottomOffset - (availableHeight * (unlockedChakra / 6));

  ctx.save();

  // Dynamically add or remove particles
  if (!window.silverParticles) {
    window.silverParticles = [];
  }
  // Add particles if needed
  while (window.silverParticles.length < particleCount) {
    window.silverParticles.push({
      x: centerX + (Math.random() - 0.5) * waveWidth,
      y: canvas.height - Math.random() * 100,
      size: Math.random() * 1.5 + 1.2,
      speed: Math.random() * 1.2 + 0.9,
      life: Math.random() * 100,
      oscillation: Math.random() * Math.PI * 2,
      amplitude: Math.random() * waveWidth / 2.2
    });
  }
  // Remove particles if needed
  while (window.silverParticles.length > particleCount) {
    window.silverParticles.pop();
  }

  window.silverParticles.forEach(particle => {
    // Move particle upward
    particle.y -= particle.speed;
    particle.life += 0.13;
    particle.oscillation += 0.04;

    // If particle reaches the current chakra Y, reset to bottom
    if (particle.y < targetChakraY) {
      particle.y = canvas.height + 12;
      particle.x = centerX + (Math.random() - 0.5) * waveWidth;
      particle.size = Math.random() * 1.7 + 1.2;
    }

    // Sway side to side
    particle.x = centerX + Math.sin(particle.oscillation) * particle.amplitude;

    const pulse = 0.8 + 0.4 * Math.sin(particle.life * 0.08);
    const alpha = 0.85 + 0.15 * Math.sin(particle.life * 0.07);

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);

    const grad = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * pulse * 2
    );
    grad.addColorStop(0, `hsla(0, 0%, 100%, 0.97)`);
    grad.addColorStop(0.45, `hsla(200, 15%, 92%, 0.85)`);
    grad.addColorStop(1, `hsla(200, 17%, 80%, 0.0)`);

    ctx.fillStyle = grad;
    ctx.shadowBlur = 22;
    ctx.shadowColor = `hsla(0, 0%, 95%, 0.9)`;
    ctx.globalAlpha = alpha;
    ctx.fill();

    if (Math.random() < 0.3) {
      ctx.beginPath();
      ctx.arc(
        particle.x + (Math.random() - 0.5) * 2.5,
        particle.y + (Math.random() - 0.5) * 2.5,
        particle.size * 0.65,
        0, Math.PI * 2
      );
      ctx.fillStyle = `hsla(0, 0%, 100%, 0.93)`;
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 7;
      ctx.shadowColor = "#fff";
      ctx.fill();
      ctx.globalAlpha = alpha;
    }
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

// Add to your DNA drawing function near the crown chakra section
function drawLotusFlower() {
  const centerX = canvas.width / 2;
  const crownY = canvas.height - 80 - ((canvas.height - 160) * (6 / 6));
  
  ctx.save();
  
  // Lotus petals (two layers)
  for (let layer = 0; layer < 2; layer++) {
    const petals = layer === 0 ? 8 : 16;
    const size = layer === 0 ? 40 : 30;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + dnaRotation * 0.5;
      const petalLength = size * (1.2 + 0.3 * Math.sin(dnaRotation));
      
      ctx.beginPath();
      ctx.ellipse(
        centerX + Math.cos(angle) * (size * 0.7),
        crownY + Math.sin(angle) * (size * 0.7),
        petalLength,
        size * 0.5,
        angle,
        0,
        Math.PI * 2
      );
      
      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(angle) * (size * 0.7 - petalLength),
        crownY + Math.sin(angle) * (size * 0.7),
        centerX + Math.cos(angle) * (size * 0.7 + petalLength),
        crownY + Math.sin(angle) * (size * 0.7)
      );
      
      gradient.addColorStop(0, `hsla(300, 40%, 90%, 0.7)`);
      gradient.addColorStop(1, `hsla(300, 60%, 80%, 0.3)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
  
  // Lotus center
  ctx.beginPath();
  ctx.arc(centerX, crownY, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'hsla(60, 80%, 70%, 0.8)';
  ctx.fill();
  
  ctx.restore();
}

function drawTwelveStrandDNA(ctx, centerX, centerY, dnaRadius, dnaNodes, rotation, currentDay) {
  // Chakra hues from violet (top) to red (bottom)
  const chakraColors = [
    {hue: 300}, // Violet - Crown
    {hue: 270}, // Indigo - Third Eye
    {hue: 210}, // Blue - Throat
    {hue: 120}, // Green - Heart
    {hue: 60},  // Yellow - Solar
    {hue: 30},  // Orange - Sacral
    {hue: 360}, // Red - Root
  ];
  // Map day to unlocked strands (up to 10)
let unlockedStrands = 0;
if (challengeData.currentDay >= 40) unlockedStrands = 10;
else if (challengeData.currentDay >= 31) unlockedStrands = 8;
else if (challengeData.currentDay >= 23) unlockedStrands = 6;
else if (challengeData.currentDay >= 15) unlockedStrands = 4;
else if (challengeData.currentDay >= 8) unlockedStrands = 2;

  const totalStrands = unlockedStrands; // Do not count the main big 2-strands

  if (totalStrands === 0) return; // Nothing to draw if not unlocked

  // For color mapping, spread chakra hues over the unlocked strands
  for (let i = 0; i < dnaNodes; i++) {
    // --- Calculate vertical chakra color ---
    const chakraFrac = i / (dnaNodes - 1);
    const colorIdx = Math.floor(chakraFrac * (chakraColors.length - 1));
    const nextIdx = Math.min(colorIdx + 1, chakraColors.length - 1);
    const frac = chakraFrac * (chakraColors.length - 1) - colorIdx;
    const hue = chakraColors[colorIdx].hue + (chakraColors[nextIdx].hue - chakraColors[colorIdx].hue) * frac;

    const baseAngle = (i / dnaNodes) * Math.PI * 4 + rotation;

    for (let s = 0; s < unlockedStrands; s++) {
      const strandAngle = baseAngle + (s * Math.PI * 2 / unlockedStrands);
      const x = centerX + Math.cos(strandAngle) * dnaRadius;
      const y = centerY - ctx.canvas.height/2 + i * (ctx.canvas.height / dnaNodes);

      // Draw node with the **vertical chakra color**
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2); // Adjust node size as needed
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.8)`;
      ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.5)`;
      ctx.shadowBlur = 8;
      ctx.fill();

      // Connect to next strand for "base pair" look
      if (s < unlockedStrands - 1) {
        const nextAngle = baseAngle + ((s + 1) * Math.PI * 2 / unlockedStrands);
        const x2 = centerX + Math.cos(nextAngle) * dnaRadius;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.22)`;
        ctx.lineWidth = 1.1;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.2)`;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always increment rotation ONCE per frame
    dnaRotation += 0.015;
    
    // Draw DNA at the beginning of the session
    if (showDNA) {
      drawDNA();
      frameCount++;
      
      // Keep DNA visible for transitionDuration frames
      if (frameCount > transitionDuration) {
        showDNA = false;
      }
    }

  // ADD THIS LINE - Draw kundalini energy
    if (typeof currentMode !== "undefined" && currentMode === "yogi") {
	drawCosmicEnergy();
	drawSilverEnergy();
	drawTwelveStrandDNA(ctx, canvas.width/2, canvas.height/2, 90, 30, dnaRotation, challengeData.currentDay);
    // drawLotusFlower();
	}
  
    // NEW: Update and draw neurons and biophotons
    updateNeurons();
    drawNeurons();
    drawBiophotons();

    // 🌌 Draw aurora waves
for (let i = 0; i < 3; i++) {
  ctx.save();
  ctx.shadowColor = `hsla(${180 + i * 40}, 80%, 80%, 0.55)`;
  ctx.shadowBlur = 28;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);

  for (let x = 0; x < canvas.width; x++) {
    const y = Math.sin(x * 0.005 + t + i) * 20 + 
              Math.sin(x * 0.002 + t * 0.5) * 15 +
              canvas.height / 2;
    ctx.lineTo(x, y);
  }

  const gradient = ctx.createLinearGradient(0, canvas.height / 2 - 50, 0, canvas.height / 2 + 50);
  gradient.addColorStop(0, `hsla(${180 + i * 40}, 80%, 60%, 0.19)`);
  gradient.addColorStop(1, `hsla(${200 + i * 40}, 80%, 70%, 0.19)`);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

    // ✨ Draw gentle drifting stars
    ctx.fillStyle = '#fff';
    for (const s of stars) {
      s.x -= s.speed;
      if (s.x < 0) s.x = canvas.width;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    t += 0.002;
    requestAnimationFrame(animate);
  }

  // Function to start session background
  window.startMeditationBackground = function() {
    canvas.classList.remove('hidden');
    // Reset DNA animation for new session
    showDNA = true;
    frameCount = 0;
    animate();
  };

  // Function to hide session background
  window.stopMeditationBackground = function() {
    canvas.classList.add('hidden');
  };
});
