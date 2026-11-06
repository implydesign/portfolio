// Game elements
const gameArea = document.getElementById('game-area');
const frogElement = document.getElementById('frog');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const levelCompleteScreen = document.getElementById('level-complete');

// Game state
let gameStarted = false;
let gameOver = false;
let levelComplete = false;
let score = 0;
let lives = 3;
let frog = { 
  x: 0, 
  y: 0, 
  width: 40, 
  height: 40,
  direction: 'up' // Default direction is up
};
let cars = [];
let turtles = []; 
let lilyPads = []; 
let goals = [];
let filledGoals = 0;
let animationFrame;
let touchStartX = 0;
let touchStartY = 0;
let levelNumber = 1;

// Game constants
// The play field is a fixed 500x500 grid of 10x10 rows/columns of 50px.
// CSS scales it to fit the screen, so these numbers are the same on every device.
const FIELD_W = 500;
const FIELD_H = 500;
const GRID_SIZE = 50;
const MOVE_SPEED = GRID_SIZE;

// Rows (top to bottom): 0 goals, 1-4 river, 5 safe, 6-8 road, 9 start
const RIVER_FIRST_ROW = 1;
const ROAD_FIRST_ROW = 6;
const START_ROW = 9;

// Speeds are in pixels per second so the game runs the same on 60Hz and 120Hz screens
const CAR_SPEEDS = [48, 60, 42, 54];
const TURTLE_SPEEDS = [36, 42, 30, 48];
const GOAL_COUNT = 5;
const CARS_PER_LANE = [1, 2, 1]; // Number of cars per lane
const TURTLES_PER_LANE = 1; // One turtle per lane
const LILY_PADS_PER_LANE = 1; // One lily pad per lane

// Sprite sizes keep each sprite's aspect ratio (cars come in three sizes)
const CAR_SIZES = [[45, 27], [49, 30], [60, 36]];
const TURTLE_WIDTH = 54;
const TURTLE_HEIGHT = 38;
const LILY_PAD_WIDTH = 40;
const LILY_PAD_HEIGHT = 33;

const MIN_GAP = FIELD_W * 0.02; // Smallest gap between neighbours in a lane (2% of the field = 10px)
const HITBOX_INSET = 4; // The frog's car hit box is 4px smaller on every side (forgiving near misses)
const RESPAWN_BLINK_S = 0.6; // Blink time after a death, during which cars can't hurt the frog
const HOP_MS = 90; // Hop animation length
const MAX_FRAME_SECONDS = 0.05; // Longest time step the game simulates in one frame

// Top y of an object of the given height centered inside a row
function centerInRow(row, height) {
  return row * GRID_SIZE + (GRID_SIZE - height) / 2;
}

let lastFrameTime = 0;
let gameTime = 0; // Seconds of simulated play
let invulnerableUntil = 0;
let paused = false;
let drawnFrog = { x: 0, y: 0 };

// Initialize game
function init() {
  // Set up game area with zones
  createGameZones();
  
  // Event listeners
  document.addEventListener('keydown', handleKeyDown);
  gameArea.addEventListener('touchstart', handleTouchStart);
  gameArea.addEventListener('touchmove', handleTouchMove);
  gameArea.addEventListener('touchend', handleTouchEnd);
  initActionButtons();
  initDpad();
  initFit();
  
  // Show start screen
  startScreen.classList.remove('hidden');
}

// Create game zones
function createGameZones() {
  // Create goal zone
  const goalZone = document.createElement('div');
  goalZone.className = 'goal-zone';
  gameArea.appendChild(goalZone);
  
  // Create river zone
  const riverZone = document.createElement('div');
  riverZone.className = 'river-zone';
  gameArea.appendChild(riverZone);
  
  // Create safe zone
  const safeZone = document.createElement('div');
  safeZone.className = 'safe-zone';
  gameArea.appendChild(safeZone);
  
  // Create road zone
  const roadZone = document.createElement('div');
  roadZone.className = 'road-zone';
  gameArea.appendChild(roadZone);
  
  // Create start zone
  const startZone = document.createElement('div');
  startZone.className = 'start-zone';
  gameArea.appendChild(startZone);
  
  // Create goals
  createGoals();
}

// Create goal spots
function createGoals() {
  const gameWidth = FIELD_W;
  const goalWidth = 40;
  const spacing = (gameWidth - (GOAL_COUNT * goalWidth)) / (GOAL_COUNT + 1);
  
  for (let i = 0; i < GOAL_COUNT; i++) {
    const goal = document.createElement('div');
    goal.className = 'goal';
    goal.style.left = `${spacing + i * (goalWidth + spacing)}px`;
    gameArea.appendChild(goal);
    
    goals.push({
      element: goal,
      x: spacing + i * (goalWidth + spacing),
      width: goalWidth,
      filled: false
    });
  }
}

// Start the game
function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  levelCompleteScreen.classList.add('hidden');
  gameStarted = true;
  gameOver = false;
  levelComplete = false;
  score = 0;
  lives = 3;
  filledGoals = 0;
  levelNumber = 1;
  gameTime = 0;
  invulnerableUntil = 0;
  paused = false;
  document.getElementById('pause-overlay').classList.remove('show');
  updateActionButtons();
  scoreElement.textContent = '0';
  livesElement.textContent = '3';
  
  // Reset goals
  goals.forEach(goal => {
    goal.filled = false;
    goal.element.classList.remove('filled');
  });
  
  // Clear existing game objects
  clearGameObjects();
  
  // Position frog at starting position
  resetFrogPosition();
  
  // Start game loop
  startLoop();
  
  // Start generating cars and turtles
  createCarsAndTurtles();
}

// Clear all game objects
function clearGameObjects() {
  // Remove any existing cars, turtles, and lily pads from the DOM
  document.querySelectorAll('.car, .log, .lily-pad').forEach(el => el.remove());
  
  // Clear the arrays
  cars = [];
  turtles = [];
  lilyPads = [];
}

// ----- Sound (on by default; made with the Web Audio API, no audio files) -----
let audioCtx = null;
let soundOn = true;

// Browsers only start audio after a tap or key press, so it is created on the first one
function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AudioContextClass) audioCtx = new AudioContextClass();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(freq, delay, duration, type, volume, endFreq) {
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function playSound(name) {
  if (!soundOn || !audioCtx) return;
  if (name === 'hop') tone(380, 0, 0.07, 'square', 0.04, 620);
  if (name === 'die') tone(240, 0, 0.3, 'sawtooth', 0.05, 60);
  if (name === 'goal') [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.12, 'square', 0.04));
}

// A button
function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) {
    ensureAudio();
    playSound('hop');
  }
  updateActionButtons();
}

// ----- Pause (B button) -----
function pauseGame() {
  if (!gameStarted || gameOver || levelComplete || paused) return;
  paused = true;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (frogElement.getAnimations) frogElement.getAnimations().forEach(a => a.pause());
  document.getElementById('pause-overlay').classList.add('show');
  updateActionButtons();
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  if (frogElement.getAnimations) frogElement.getAnimations().forEach(a => a.play());
  document.getElementById('pause-overlay').classList.remove('show');
  updateActionButtons();
  startLoop();
}

// B button: starts the game (start screen), plays again (game over) or continues
// (mission accomplished), otherwise pauses / resumes. Same actions as the Space bar.
function togglePause() {
  if (gameOver) {
    startGame();
    return;
  }
  if (levelComplete) {
    continueToNextLevel();
    return;
  }
  if (!gameStarted) {
    startGame();
    return;
  }
  if (paused) resumeGame(); else pauseGame();
}

// Show the current sound / pause state on the A and B buttons
function updateActionButtons() {
  const buttonA = document.getElementById('btn-a');
  const buttonB = document.getElementById('btn-b');
  buttonA.setAttribute('aria-pressed', String(soundOn));
  buttonA.setAttribute('aria-label', soundOn ? 'Sound on (tap to mute)' : 'Sound off (tap to turn on)');
  // B shows play whenever the game is not running: before the first start, when paused,
  // after game over and after mission accomplished
  const playing = gameStarted && !gameOver && !levelComplete;
  buttonB.classList.toggle('show-play', paused || !playing);
  buttonB.setAttribute('aria-pressed', String(paused));
  buttonB.setAttribute('aria-label', paused ? 'Resume game'
    : gameOver ? 'Play again'
    : levelComplete ? 'Continue'
    : !gameStarted ? 'Start game' : 'Pause game');
}

function initActionButtons() {
  [['btn-a', toggleSound], ['btn-b', togglePause]].forEach(([id, action]) => {
    const button = document.getElementById(id);
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); // no focus, so the Space bar still starts the game
      button.classList.add('pressed');
      if (navigator.vibrate) navigator.vibrate(10);
      action();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
      button.addEventListener(type, () => button.classList.remove('pressed'));
    });
    // Keyboard activation (Enter on a focused button)
    button.addEventListener('click', event => { if (event.detail === 0) action(); });
  });
  ['pointerdown', 'keydown'].forEach(type => {
    document.addEventListener(type, () => { if (soundOn) ensureAudio(); }, { passive: true });
  });
  updateActionButtons();
}

// Reset frog to starting position (bottom row, centered)
function resetFrogPosition() {
  frog.x = Math.floor(FIELD_W / 2) - (frog.width / 2);
  frog.y = centerInRow(START_ROW, frog.height);
  frog.direction = 'up'; // Reset direction to up
  
  updateFrogPosition(false);
}

// Transform that places and rotates the frog
function frogTransform(x, y, direction, scale) {
  const rotation = { up: 0, right: 90, down: 180, left: -90 }[direction];
  return `translate(${Math.round(x)}px, ${Math.round(y)}px) rotate(${rotation}deg) scale(${scale})`;
}

// Draw the frog. With animate=true it slides to the new cell with a small lift.
function updateFrogPosition(animate) {
  const next = frogTransform(frog.x, frog.y, frog.direction, 1);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (animate && frogElement.animate && !reduceMotion) {
    const from = frogElement.style.transform || next;
    const mid = frogTransform((drawnFrog.x + frog.x) / 2, (drawnFrog.y + frog.y) / 2, frog.direction, 1.15);
    frogElement.animate([{ transform: from }, { transform: mid }, { transform: next }],
                        { duration: HOP_MS, easing: 'ease-out' });
  }
  
  frogElement.style.transform = next;
  drawnFrog = { x: frog.x, y: frog.y };
}

// Put one lane's objects on a shared looping track. Every object is spaced evenly
// around the track and wraps by the track length, so the gaps between neighbours
// never change and objects can never overlap (the gap is at least MIN_GAP).
function createLane(row, direction, speed, specs, startMargin) {
  const count = specs.length;
  const widest = Math.max(...specs.map(spec => spec.width));
  const track = Math.max(FIELD_W + widest, count * (widest + MIN_GAP));
  const step = track / count;
  
  specs.forEach((spec, k) => {
    // Start off-screen: the first object just outside the edge, the others behind it
    const x = direction === 1
      ? -spec.width - startMargin - k * step
      : FIELD_W + startMargin + k * step;
    spec.create(x, centerInRow(row, spec.height), spec.width, spec.height, speed, track);
  });
}

// Create cars and turtles
function createCarsAndTurtles() {
  // Cars: one lane per road row, each car centered in its row
  for (let i = 0; i < CARS_PER_LANE.length; i++) {
    const direction = i % 2 === 0 ? 1 : -1;
    const specs = [];
    for (let j = 0; j < CARS_PER_LANE[i]; j++) {
      // Pick one of the car sizes (same art, scaled evenly)
      const [width, height] = CAR_SIZES[Math.floor(Math.random() * CAR_SIZES.length)];
      specs.push({ width, height, create: createCar });
    }
    createLane(ROAD_FIRST_ROW + i, direction, CAR_SPEEDS[i] * direction, specs, 100);
  }
  
  // Turtles and lily pads share each river lane
  for (let i = 0; i < 4; i++) {
    const direction = i % 2 === 0 ? 1 : -1;
    const specs = [];
    for (let j = 0; j < TURTLES_PER_LANE; j++) {
      specs.push({ width: TURTLE_WIDTH, height: TURTLE_HEIGHT, create: createTurtle });
    }
    for (let j = 0; j < LILY_PADS_PER_LANE; j++) {
      specs.push({ width: LILY_PAD_WIDTH, height: LILY_PAD_HEIGHT, create: createLilyPad });
    }
    createLane(RIVER_FIRST_ROW + i, direction, TURTLE_SPEEDS[i] * direction, specs, 150);
  }
}

// Draw a moving object (cars, turtles and lily pads) with a transform
function placeObject(obj) {
  obj.element.style.transform = `translate(${Math.round(obj.x)}px, ${Math.round(obj.y)}px)` +
    (obj.flip ? ' scaleX(-1)' : '');
}

// Create a moving object and add it to the field
function createObject(className, list, x, y, width, height, speed, flip, track) {
  const element = document.createElement('div');
  element.className = className;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  gameArea.appendChild(element);
  
  const obj = { element, x, y, width, height, speed, flip, track };
  placeObject(obj);
  list.push(obj);
}

// Create a car (flipped if it moves left)
function createCar(x, y, width, height, speed, track) {
  createObject('car', cars, x, y, width, height, speed, speed < 0, track);
}

// Create a turtle (class stays 'log' for compatibility; flipped if it moves right)
function createTurtle(x, y, width, height, speed, track) {
  createObject('log', turtles, x, y, width, height, speed, speed > 0, track);
}

// Create a lily pad
function createLilyPad(x, y, width, height, speed, track) {
  createObject('lily-pad', lilyPads, x, y, width, height, speed, false, track);
}

// Start (or restart) the game loop
function startLoop() {
  lastFrameTime = 0;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(gameLoop);
}

// Game loop: everything moves by speed x elapsed time, so the game plays
// the same on 60Hz, 120Hz and 144Hz screens
function gameLoop(now) {
  if (gameOver || levelComplete) return;
  
  const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, MAX_FRAME_SECONDS) : 0;
  lastFrameTime = now;
  gameTime += dt;
  
  updateCars(dt);
  updateTurtles(dt);
  updateLilyPads(dt);
  checkCollisions();
  checkWin();
  animationFrame = requestAnimationFrame(gameLoop);
}

// Move an object; when it leaves the field it jumps back along its lane's track
function moveObject(obj, dt) {
  obj.x += obj.speed * dt;
  if (obj.speed > 0 && obj.x > FIELD_W) {
    obj.x -= obj.track;
  } else if (obj.speed < 0 && obj.x + obj.width < 0) {
    obj.x += obj.track;
  }
  placeObject(obj);
}

// Update car positions
function updateCars(dt) {
  cars.forEach(car => moveObject(car, dt));
}

// Update turtle positions
function updateTurtles(dt) {
  turtles.forEach(turtle => moveObject(turtle, dt));
}

// Update lily pad positions, then carry the frog if it rides a turtle or lily pad
function updateLilyPads(dt) {
  lilyPads.forEach(lilyPad => moveObject(lilyPad, dt));
  
  if (isFrogInRiver()) {
    const onTurtle = turtles.find(turtle => isColliding(frog, turtle));
    const onLilyPad = lilyPads.find(lilyPad => isColliding(frog, lilyPad));
    
    if (onTurtle) {
      frog.x += onTurtle.speed * dt;
      updateFrogPosition(false);
    } else if (onLilyPad) {
      frog.x += onLilyPad.speed * dt;
      updateFrogPosition(false);
    } else {
      // Frog is in water but not on a turtle or lily pad
      frogDies();
    }
  }
}

// Check if frog is in the river zone
function isFrogInRiver() {
  const gameHeight = FIELD_H;
  // Only consider the frog in the river if its center point is in the river zone
  const frogCenterY = frog.y + (frog.height / 2);
  return frogCenterY >= gameHeight * 0.1 && frogCenterY < gameHeight * 0.5;
}

// Check collisions
function checkCollisions() {
  const gameWidth = FIELD_W;
  const gameHeight = FIELD_H;
  
  // Check if frog is out of bounds
  if (frog.x < 0 || frog.x + frog.width > gameWidth || frog.y < 0 || frog.y + frog.height > gameHeight) {
    frogDies();
    return;
  }
  
  // Check car collisions with a slightly smaller frog hit box (not while blinking after a death)
  if (gameTime < invulnerableUntil) return;
  const hitBox = {
    x: frog.x + HITBOX_INSET,
    y: frog.y + HITBOX_INSET,
    width: frog.width - 2 * HITBOX_INSET,
    height: frog.height - 2 * HITBOX_INSET
  };
  for (const car of cars) {
    if (isColliding(hitBox, car)) {
      frogDies();
      return;
    }
  }
}

// Check if frog has reached a goal
function checkWin() {
  const gameHeight = FIELD_H;
  
  // Check if frog is in the goal zone - use center point of frog for more accurate detection
  const frogCenterY = frog.y + (frog.height / 2);
  
  if (frogCenterY <= gameHeight * 0.1) {
    // Check if frog has reached an unfilled goal
    let reachedGoal = false;
    
    for (const goal of goals) {
      if (!goal.filled && 
          frog.x < goal.x + goal.width &&
          frog.x + frog.width > goal.x) {
        
        // Mark goal as filled
        goal.filled = true;
        goal.element.classList.add('filled');
        filledGoals++;
        
        // Add score
        score += 50;
        scoreElement.textContent = score;
        
        // Reset frog position
        resetFrogPosition();
        playSound('goal');
        
        // Check if all goals are filled
        if (filledGoals === GOAL_COUNT) {
          levelComplete = true;
          showLevelComplete();
        }
        
        reachedGoal = true;
        break;
      }
    }
    
    // If frog is in goal zone but not on a goal, it dies
    if (!reachedGoal) {
      frogDies();
    }
  }
}

// Show level complete screen
function showLevelComplete() {
  // Ensure game state is properly set
  levelComplete = true;
  updateActionButtons();
  
  // Add bonus points
  score += 1000;
  scoreElement.textContent = score;
  
  // Stop the game loop
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  // Show level complete screen with a slight delay to ensure it's visible
  setTimeout(() => {
    levelCompleteScreen.classList.remove('hidden');
  }, 100);
}

// Continue to next level
function continueToNextLevel() {
  levelComplete = false;
  updateActionButtons();
  levelCompleteScreen.classList.add('hidden');
  levelNumber++;
  
  // Reset goals and frog
  goals.forEach(goal => {
    goal.filled = false;
    goal.element.classList.remove('filled');
  });
  filledGoals = 0;
  
  // Reset frog position
  resetFrogPosition();
  
  // Clear existing game objects and create new ones
  clearGameObjects();
  createCarsAndTurtles();
  
  // Restart game loop
  startLoop();
}

// Frog dies
function frogDies() {
  lives--;
  livesElement.textContent = lives;
  
  if (lives <= 0) {
    endGame();
  } else {
    resetFrogPosition();
    playSound('die');
    // Blink, and cars can't hurt the frog for a moment
    invulnerableUntil = gameTime + RESPAWN_BLINK_S;
    if (frogElement.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frogElement.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }],
                          { duration: RESPAWN_BLINK_S * 1000 / 4, iterations: 4 });
    }
  }
}

// End the game
function endGame() {
  gameOver = true;
  gameStarted = false;
  updateActionButtons();
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  gameOverScreen.classList.remove('hidden');
}

// Move frog one hop. Hops that would leave the field stop at the edge.
function moveFrog(direction) {
  if (!gameStarted || gameOver || levelComplete || paused) return;
  
  // Store previous position in case we need to revert
  const prevX = frog.x;
  const prevY = frog.y;
  
  // Update frog direction
  frog.direction = direction;
  
  switch (direction) {
    case 'up':
      frog.y -= MOVE_SPEED;
      break;
    case 'down':
      frog.y = Math.min(frog.y + MOVE_SPEED, centerInRow(START_ROW, frog.height));
      break;
    case 'left':
      frog.x = Math.max(frog.x - MOVE_SPEED, 0);
      break;
    case 'right':
      frog.x = Math.min(frog.x + MOVE_SPEED, FIELD_W - frog.width);
      break;
  }
  
  // Update the visual position (slide only if the frog actually moved)
  const moved = frog.x !== prevX || frog.y !== prevY;
  updateFrogPosition(moved);
  if (moved) playSound('hop');
  
  // Check if the frog is now in the transition area between river and goal
  const gameHeight = FIELD_H;
  const frogCenterY = frog.y + (frog.height / 2);
  
  // If the frog is moving from river to goal zone, ensure it's on a turtle or lily pad
  if (direction === 'up' && 
      prevY >= gameHeight * 0.1 && 
      frogCenterY <= gameHeight * 0.1) {
    
    // Check if the frog was on a turtle or lily pad in the previous position
    const wasOnTurtle = turtles.some(turtle => 
      prevX < turtle.x + turtle.width &&
      prevX + frog.width > turtle.x &&
      prevY < turtle.y + turtle.height &&
      prevY + frog.height > turtle.y
    );
    
    const wasOnLilyPad = lilyPads.some(lilyPad => 
      prevX < lilyPad.x + lilyPad.width &&
      prevX + frog.width > lilyPad.x &&
      prevY < lilyPad.y + lilyPad.height &&
      prevY + frog.height > lilyPad.y
    );
    
    // If the frog wasn't on a turtle or lily pad, revert the move and kill the frog
    if (!wasOnTurtle && !wasOnLilyPad) {
      frog.x = prevX;
      frog.y = prevY;
      frogDies();
      return;
    }
  }
  
  // Add points for moving forward
  if (direction === 'up') {
    score += 10;
    scoreElement.textContent = score;
  }
}

// Utility function to check collision between two objects
function isColliding(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Event handlers
function handleKeyDown(event) {
  // One key press = one hop: ignore the repeats a held key sends
  if (event.repeat) {
    if (event.code.startsWith('Arrow')) event.preventDefault();
    return;
  }
  
  if (event.code === 'KeyM') {
    toggleSound();
    return;
  }
  
  if (event.code === 'KeyP' || event.code === 'Escape') {
    togglePause();
    return;
  }
  
  if (!gameStarted && !gameOver && !levelComplete && event.code === 'Space') {
    startGame();
    return;
  }
  
  if (gameOver && event.code === 'Space') {
    startGame();
    return;
  }
  
  if (levelComplete && event.code === 'Space') {
    continueToNextLevel();
    return;
  }
  
  if (gameStarted && !gameOver && !levelComplete) {
    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        moveFrog('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFrog('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFrog('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFrog('right');
        break;
    }
  }
}

// Touch event handlers for mobile
function handleTouchStart(event) {
  // A tap that starts, retries or continues the game must not count as a swipe
  touchStartX = null;
  touchStartY = null;
  
  if (!gameStarted && !gameOver && !levelComplete) {
    startGame();
    return;
  }
  
  if (gameOver) {
    startGame();
    return;
  }
  
  if (levelComplete) {
    continueToNextLevel();
    return;
  }
  
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();
}

function handleTouchEnd(event) {
  if (!gameStarted || gameOver || levelComplete || touchStartX === null) return;
  
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Determine swipe direction based on which axis had the larger movement
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 50) {
      moveFrog('right');
    } else if (diffX < -50) {
      moveFrog('left');
    }
  } else {
    // Vertical swipe
    if (diffY > 50) {
      moveFrog('down');
    } else if (diffY < -50) {
      moveFrog('up');
    }
  }
}

// Game Boy D-pad buttons (visible on touch devices only)
function initDpad() {
  const dpad = document.querySelector('.dpad');
  if (!dpad) return;
  const release = () => dpad.removeAttribute('data-pressed');
  dpad.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('pointerdown', event => {
      event.preventDefault();
      dpad.dataset.pressed = btn.dataset.dir;
      if (navigator.vibrate) navigator.vibrate(10);
      moveFrog(btn.dataset.dir);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => btn.addEventListener(type, release));
  });
}

// Scale the fixed-size game and the controls (D-pad + A/B buttons) so everything
// fits the visible screen with no scrolling. The game scales first; the controls
// keep their normal size and only shrink if there is really no room.
function fitToScreen() {
  const app = document.getElementById('app');
  const scaler = document.getElementById('game-scaler');
  const container = scaler.firstElementChild;
  const controls = app.querySelector('.controls');
  const inner = controls.firstElementChild;
  
  const gameW = container.offsetWidth;
  const gameH = container.offsetHeight;
  const ctrlW = inner.offsetWidth;
  const ctrlH = inner.offsetHeight;
  
  // Keep clear of notches and rounded corners (body padding uses the safe-area insets)
  const vv = window.visualViewport;
  const body = getComputedStyle(document.body);
  const padX = parseFloat(body.paddingLeft) + parseFloat(body.paddingRight);
  const padY = parseFloat(body.paddingTop) + parseFloat(body.paddingBottom);
  const availW = (vv ? vv.width : window.innerWidth) - padX - 32;
  const availH = (vv ? vv.height : window.innerHeight) - padY - 32;
  const gap = parseFloat(getComputedStyle(app).gap) || 0;
  
  let ctrlScale, gameScale, side = false;
  if (getComputedStyle(app).flexDirection === 'row') {
    // Landscape on touch devices: controls to the right of the game
    ctrlScale = Math.min(1, availH / ctrlH);
    gameScale = Math.min(1, availH / gameH, (availW - gap - ctrlW * ctrlScale) / gameW);
  } else {
    ctrlScale = Math.min(1, availW / ctrlW);
    // Controls below the game
    gameScale = Math.min(1, availW / gameW, (availH - gap - ctrlH * ctrlScale) / gameH);
    // Desktop: controls to the right of the game while the game stays centred in the window
    // (room is kept on both sides). Used whenever it gives the game at least as much size.
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      const sideGap = 24;
      const sideScale = Math.min(1, availH / gameH, (availW - 2 * (sideGap + ctrlW)) / gameW);
      if (sideScale >= gameScale - 0.001) {
        side = true;
        gameScale = sideScale;
        ctrlScale = 1;
      }
    }
  }
  app.classList.toggle('controls-side', side);
  gameScale = Math.max(gameScale, 0.1);
  
  scaler.style.width = `${gameW * gameScale}px`;
  scaler.style.height = `${gameH * gameScale}px`;
  container.style.transform = `scale(${gameScale})`;
  controls.style.width = `${ctrlW * ctrlScale}px`;
  controls.style.height = `${ctrlH * ctrlScale}px`;
  inner.style.transform = `scale(${ctrlScale})`;
}

function initFit() {
  fitToScreen();
  window.addEventListener('resize', fitToScreen);
  window.addEventListener('load', fitToScreen);
  window.addEventListener('orientationchange', () => setTimeout(fitToScreen, 200));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitToScreen);
  if (document.fonts) document.fonts.ready.then(fitToScreen);
  // Don't simulate the time the page spent in the background
  document.addEventListener('visibilitychange', () => {
    lastFrameTime = 0;
    if (document.hidden) pauseGame(); // don't come back to a dead frog
  });
}

// Initialize the game when the page loads
window.addEventListener('load', init);
