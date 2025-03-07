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
const GRID_SIZE = 50;
const MOVE_SPEED = GRID_SIZE;
// Drastically reduced car speeds to make the game much easier
const CAR_SPEEDS = [0.8, 1.0, 0.7, 0.9];
// Reduced turtle and lily pad speeds significantly
const TURTLE_SPEEDS = [0.6, 0.7, 0.5, 0.8]; // Reduced from previous values
const GOAL_COUNT = 5;
const CARS_PER_LANE = [1, 2, 1]; // Number of cars per lane
const TURTLES_PER_LANE = 1; // One turtle per lane
const LILY_PADS_PER_LANE = 1; // One lily pad per lane

// Adjusted dimensions for turtles and lily pads
const TURTLE_WIDTH = 60;
const TURTLE_HEIGHT = 30;
const LILY_PAD_WIDTH = 40;
const LILY_PAD_HEIGHT = 30;

// Initialize game
function init() {
  // Set up game area with zones
  createGameZones();
  
  // Event listeners
  document.addEventListener('keydown', handleKeyDown);
  gameArea.addEventListener('touchstart', handleTouchStart);
  gameArea.addEventListener('touchmove', handleTouchMove);
  gameArea.addEventListener('touchend', handleTouchEnd);
  
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
  const gameWidth = gameArea.offsetWidth;
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
  if (animationFrame) cancelAnimationFrame(animationFrame);
  gameLoop();
  
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

// Reset frog to starting position
function resetFrogPosition() {
  const gameWidth = gameArea.offsetWidth;
  const gameHeight = gameArea.offsetHeight;
  
  frog.x = Math.floor(gameWidth / 2) - (frog.width / 2);
  frog.y = gameHeight - frog.height - 10;
  frog.direction = 'up'; // Reset direction to up
  
  updateFrogPosition();
}

// Update frog position and rotation on screen
function updateFrogPosition() {
  frogElement.style.left = `${frog.x}px`;
  frogElement.style.top = `${frog.y}px`;
  
  // Apply rotation based on direction
  switch (frog.direction) {
    case 'up':
      frogElement.style.transform = 'rotate(0deg)';
      break;
    case 'right':
      frogElement.style.transform = 'rotate(90deg)';
      break;
    case 'down':
      frogElement.style.transform = 'rotate(180deg)';
      break;
    case 'left':
      frogElement.style.transform = 'rotate(-90deg)';
      break;
  }
}

// Create cars and turtles
function createCarsAndTurtles() {
  const gameWidth = gameArea.offsetWidth;
  const gameHeight = gameArea.offsetHeight;
  
  // Define the road zone (60% to 90% of game height)
  const roadZoneTop = gameHeight * 0.6;
  const roadZoneHeight = gameHeight * 0.3; // 30% of game height
  
  // Create cars in the road lanes
  for (let i = 0; i < CARS_PER_LANE.length; i++) {
    // Calculate lane position within the road zone
    const laneY = roadZoneTop + (i * (roadZoneHeight / 4));
    const direction = i % 2 === 0 ? 1 : -1;
    const speed = CAR_SPEEDS[i] * direction;
    
    // Create the specified number of cars for this lane
    for (let j = 0; j < CARS_PER_LANE[i]; j++) {
      // Space cars evenly across the lane
      const spacing = gameWidth / CARS_PER_LANE[i];
      let startX;
      
      if (direction === 1) {
        // For cars moving right, start from left of screen with spacing
        startX = -100 - (j * spacing);
      } else {
        // For cars moving left, start from right of screen with spacing
        startX = gameWidth + 100 + (j * spacing);
      }
      
      createCar(
        startX,
        laneY,
        40 + Math.floor(Math.random() * 40),
        30,
        speed
      );
    }
  }
  
  // Create turtles and lily pads in the river lanes (4 lanes in the river zone - 10% to 50% of game height)
  for (let i = 0; i < 4; i++) {
    const laneY = gameHeight * 0.1 + (i * GRID_SIZE);
    const direction = i % 2 === 0 ? 1 : -1;
    const speed = TURTLE_SPEEDS[i] * direction;
    
    // Create turtles with even spacing
    for (let j = 0; j < TURTLES_PER_LANE; j++) {
      const turtleSpacing = gameWidth / TURTLES_PER_LANE;
      let turtleStartX;
      
      if (direction === 1) {
        turtleStartX = -150 - (j * turtleSpacing);
      } else {
        turtleStartX = gameWidth + 150 + (j * turtleSpacing);
      }
      
      createTurtle(
        turtleStartX,
        laneY,
        TURTLE_WIDTH,
        TURTLE_HEIGHT,
        speed
      );
    }
    
    // Create lily pads with even spacing, but offset from turtles to ensure they don't overlap
    for (let j = 0; j < LILY_PADS_PER_LANE; j++) {
      const lilyPadSpacing = gameWidth / LILY_PADS_PER_LANE;
      let lilyPadStartX;
      
      if (direction === 1) {
        // Offset lily pads from turtles by half the game width to ensure they're far apart
        lilyPadStartX = -150 - (j * lilyPadSpacing) - (gameWidth / 2);
      } else {
        lilyPadStartX = gameWidth + 150 + (j * lilyPadSpacing) + (gameWidth / 2);
      }
      
      createLilyPad(
        lilyPadStartX,
        laneY,
        LILY_PAD_WIDTH,
        LILY_PAD_HEIGHT,
        speed
      );
    }
  }
}

// Create a car
function createCar(x, y, width, height, speed) {
  const car = document.createElement('div');
  car.className = 'car';
  car.style.width = `${width}px`;
  car.style.height = `${height}px`;
  car.style.left = `${x}px`;
  car.style.top = `${y}px`;
  
  // Flip the car if it's moving left
  if (speed < 0) {
    car.style.transform = 'scaleX(-1)';
  }
  
  gameArea.appendChild(car);
  
  cars.push({
    element: car,
    x: x,
    y: y,
    width: width,
    height: height,
    speed: speed
  });
}

// Create a turtle
function createTurtle(x, y, width, height, speed) {
  const turtle = document.createElement('div');
  turtle.className = 'log'; // Keep the class as 'log' for compatibility
  turtle.style.width = `${width}px`;
  turtle.style.height = `${height}px`;
  turtle.style.left = `${x}px`;
  turtle.style.top = `${y}px`;
  
  // Flip the turtle if it's moving right
  if (speed > 0) {
    turtle.style.transform = 'scaleX(-1)';
  }
  
  gameArea.appendChild(turtle);
  
  turtles.push({
    element: turtle,
    x: x,
    y: y,
    width: width,
    height: height,
    speed: speed
  });
}

// Create a lily pad
function createLilyPad(x, y, width, height, speed) {
  const lilyPad = document.createElement('div');
  lilyPad.className = 'lily-pad';
  lilyPad.style.width = `${width}px`;
  lilyPad.style.height = `${height}px`;
  lilyPad.style.left = `${x}px`;
  lilyPad.style.top = `${y}px`;
  
  gameArea.appendChild(lilyPad);
  
  lilyPads.push({
    element: lilyPad,
    x: x,
    y: y,
    width: width,
    height: height,
    speed: speed
  });
}

// Game loop
function gameLoop() {
  if (!gameOver && !levelComplete) {
    updateCars();
    updateTurtles();
    updateLilyPads();
    checkCollisions();
    checkWin();
    animationFrame = requestAnimationFrame(gameLoop);
  }
}

// Update car positions
function updateCars() {
  const gameWidth = gameArea.offsetWidth;
  
  cars.forEach(car => {
    car.x += car.speed;
    car.element.style.left = `${car.x}px`;
    
    // Loop cars around when they go off-screen
    if (car.speed > 0 && car.x > gameWidth) {
      car.x = -car.width;
    } else if (car.speed < 0 && car.x + car.width < 0) {
      car.x = gameWidth;
    }
  });
}

// Update turtle positions
function updateTurtles() {
  const gameWidth = gameArea.offsetWidth;
  
  turtles.forEach(turtle => {
    turtle.x += turtle.speed;
    turtle.element.style.left = `${turtle.x}px`;
    
    // Loop turtles around when they go off-screen
    if (turtle.speed > 0 && turtle.x > gameWidth) {
      turtle.x = -turtle.width;
    } else if (turtle.speed < 0 && turtle.x + turtle.width < 0) {
      turtle.x = gameWidth;
    }
  });
}

// Update lily pad positions
function updateLilyPads() {
  const gameWidth = gameArea.offsetWidth;
  
  lilyPads.forEach(lilyPad => {
    lilyPad.x += lilyPad.speed;
    lilyPad.element.style.left = `${lilyPad.x}px`;
    
    // Loop lily pads around when they go off-screen
    if (lilyPad.speed > 0 && lilyPad.x > gameWidth) {
      lilyPad.x = -lilyPad.width;
    } else if (lilyPad.speed < 0 && lilyPad.x + lilyPad.width < 0) {
      lilyPad.x = gameWidth;
    }
  });
  
  // If frog is in river, check if it's on a turtle or lily pad
  if (isFrogInRiver()) {
    const onTurtle = turtles.find(turtle => isColliding(frog, turtle));
    const onLilyPad = lilyPads.find(lilyPad => isColliding(frog, lilyPad));
    
    if (onTurtle) {
      frog.x += onTurtle.speed;
      updateFrogPosition();
    } else if (onLilyPad) {
      frog.x += onLilyPad.speed;
      updateFrogPosition();
    } else {
      // Frog is in water but not on a turtle or lily pad
      frogDies();
    }
  }
}

// Check if frog is in the river zone
function isFrogInRiver() {
  const gameHeight = gameArea.offsetHeight;
  // Only consider the frog in the river if its center point is in the river zone
  const frogCenterY = frog.y + (frog.height / 2);
  return frogCenterY >= gameHeight * 0.1 && frogCenterY < gameHeight * 0.5;
}

// Check collisions
function checkCollisions() {
  const gameWidth = gameArea.offsetWidth;
  const gameHeight = gameArea.offsetHeight;
  
  // Check if frog is out of bounds
  if (frog.x < 0 || frog.x + frog.width > gameWidth || frog.y < 0 || frog.y + frog.height > gameHeight) {
    frogDies();
    return;
  }
  
  // Check car collisions
  for (const car of cars) {
    if (isColliding(frog, car)) {
      frogDies();
      return;
    }
  }
}

// Check if frog has reached a goal
function checkWin() {
  const gameHeight = gameArea.offsetHeight;
  
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
  gameLoop();
}

// Frog dies
function frogDies() {
  lives--;
  livesElement.textContent = lives;
  
  if (lives <= 0) {
    endGame();
  } else {
    resetFrogPosition();
  }
}

// End the game
function endGame() {
  gameOver = true;
  gameStarted = false;
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  gameOverScreen.classList.remove('hidden');
}

// Move frog
function moveFrog(direction) {
  if (!gameStarted || gameOver || levelComplete) return;
  
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
      frog.y += MOVE_SPEED;
      break;
    case 'left':
      frog.x -= MOVE_SPEED;
      break;
    case 'right':
      frog.x += MOVE_SPEED;
      break;
  }
  
  // Update the visual position
  updateFrogPosition();
  
  // Check if the frog is now in the transition area between river and goal
  const gameHeight = gameArea.offsetHeight;
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
      updateFrogPosition();
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
  if (!gameStarted || gameOver || levelComplete) return;
  
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

// Initialize the game when the page loads
window.addEventListener('load', init);