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
const image = new Image();
image.src = './resources/boom.png';

let score = 0;
let ravens = [];
let explosions = [];
let previousTimestamp = 0;
let timeToNextRaven = 0;

class Raven {
  constructor() {
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
    this.red = Math.floor(Math.random() * 255);
    this.green = Math.floor(Math.random() * 255);
    this.blue = Math.floor(Math.random() * 255);
    this.color = 'rgb(' + this.red + ',' + this.green + ',' + this.blue+')';
  }

  draw() {
    collisionCtx.save();
    collisionCtx.fillStyle = this.color;
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

    collisionCtx.restore();
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


class Explosion {
  constructor(x, y, sizeModifier) {
    this.spriteSheet = image;
    // this.spriteSheet = new Image();
    // this.spriteSheet.src = "./resources/boom.png";
    this.explosion = new Audio();
    this.explosion.src = "./resources/explosion.wav";
    this.rows = 5;
    this.cols = 1;
    this.spriteWidth = this.spriteSheet.width / this.rows;
    this.spriteHeight = this.spriteSheet.height / this.cols;
    this.width = this.spriteWidth * sizeModifier;
    this.height = this.spriteHeight * sizeModifier;
    this.frame = 0;
    this.speed = 13;
    this.turn = 0;
    this.x = x;
    this.y = y;
    this.angle = Math.random() * 6.24;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(
      this.spriteSheet,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      0 - this.width / 2,
      0 - this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }

  update() {
    this.turn++;
    if (this.frame === 0) this.explosion.play();
    if (this.turn % this.speed === 0) {
      this.frame++;
    }
    if (this.frame > this.cols) {
      explosions.splice(this, 1);
    }
    this.draw();
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


window.addEventListener("click", (e) => {
  const imageData = collisionCtx.getImageData(e.clientX, e.clientY, 1, 1);
  ravens.forEach((raven) => {
    if (
      imageData.data[0] === raven.red &&
      imageData.data[1] === raven.green &&
      imageData.data[2] === raven.blue
    ) {
      // let before = ravens.length;
      score++;
      raven.markedForDeletion = true;
      explosions.push(new Explosion(raven.x + raven.width/2, raven.y + raven.height/2, raven.sizeModifier))
    }
  });
});


const animate = (timestamp) => {
  requestAnimationFrame(animate);

  let deltaTime = timestamp - previousTimestamp;
  previousTimestamp = timestamp;
  timeToNextRaven += deltaTime;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore();
  ravens = ravens.filter(object => !object.markedForDeletion);
  [...ravens, ...explosions].forEach(object => object.update(deltaTime));
  [...ravens, ...explosions].forEach(object => object.draw());
  ravens.sort((r1, r2) => r2 - r1);
  if (timeToNextRaven > 1000) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }
  console.log(explosions)
};
animate(0);
