/**  @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = innerWidth);
const CANVAS_HEIGHT = (canvas.height = innerHeight);
const COLLISION_CANVAS_WIDTH = (collisionCanvas.width = innerWidth);
const COLLISION_CANVAS_HEIGHT = (collisionCanvas.height = innerHeight);
const position = canvas.getBoundingClientRect();

let score = 0;

const mousePosition = {
  x: undefined,
  y: undefined,
};

let ravens = [];
window.addEventListener("click", (e) => {
  const imageData = collisionCtx.getImageData(e.clientX, e.clientY, 1, 1);
  console.log(imageData.data[0].toString(16));
  ravens.forEach((raven) => {
    if (
      imageData.data[0] === raven.red &&
      imageData.data[1] === raven.green &&
      imageData.data[2] === raven.blue
    ) {
      raven.markedForDeletion = true;
    }
  });
});

let previousTimestamp = 0;
let timeToNextRaven = 0;

class Raven {
  constructor(red, green, blue) {
    this.raven = new Image();
    this.raven.src = "./resources/raven.png";
    this.rows = 6;
    this.cols = 1;
    this.spriteWidth = this.raven.width / this.rows;
    this.spriteHeight = this.raven.height / this.cols;
    this.sizeModifier = Math.random() * (0.65 - 0.25) + 0.25;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height * 1.5);
    this.dx = Math.random() * (5 - 2.5) + 2.5;
    this.dy = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 100 + 50;
    this.frame = 0;
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  draw() {
    collisionCtx.fillStyle = `#${(this.red).toString(16)}${(this.green).toString(16)}${(this.blue).toString(16)}ff`;
    ctx.drawImage(
      this.raven,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);

  }
  update(deltaTime) {
    this.timeSinceFlap += deltaTime;
    if (this.timeSinceFlap > this.flapInterval) {
      this.timeSinceFlap = 0;
      if (this.frame + 1 > this.rows - 1) {
        this.frame = 0;
      } else this.frame++;
    }
    if (this.y + this.dy < 0 || this.y > canvas.height - this.height) {
      this.dy = -this.dy;
    }
    this.y += this.dy;
    this.x -= this.dx;
    if (this.x < 0 - this.width) {
      this.markedForDeletion = true;
    }
  }
}

// for (let i = 0; i < totalRavens; i++) {
//   ravens.push(new Raven());
// }

const drawScore = () => {
  ctx.font = "30px Impact";
  ctx.fillStyle = "black";
  let scoreX = 5;
  let scoreY = 30;
  ctx.fillText(`Score: ${score}`, scoreX, scoreY);
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, scoreX + 5, scoreY + 5);
};

const animate = (timestamp) => {
  requestAnimationFrame(animate);

  let deltaTime = timestamp - previousTimestamp;
  previousTimestamp = timestamp;
  timeToNextRaven += deltaTime;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore();
  ravens.forEach((raven) => {
    raven.draw();
    raven.update(deltaTime);
    // if (raven.x < 0 - raven.width) {
      ravens = ravens.filter((raven) => !raven.markedForDeletion);
    // }
    // ravens.sort((a, b) => b.height - a.height);
  });
  if (timeToNextRaven > 1000) {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);
    ravens.push(new Raven(red, green, blue));
    timeToNextRaven = 0;
  }
};
animate(0);
