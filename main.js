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
const explosion = new Image();
explosion.src = "./resources/boom.png";

let gameLost = false;
let score = 0;
let ravens = [];
let explosions = [];
let previousTimestamp = 0;
let timeToNextRaven = 0;
let trails = [];
let globalSpeed = 0.005;
let gameSpeed = 15;

let backgroundMusic = new Audio();
backgroundMusic.src = './resources/background.mp3';
backgroundMusic.play();

class Trail {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = Math.random() + this.size / 10;
    this.maxRadius = Math.random() * 20 + 30;
    this.markedForDeletion = false;
    this.color = color;
    this.opacity = 1;
    this.dx = Math.random() * 1 + 0.5;
    // this.color = 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.opacity + ')';
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.x += this.dx;
    this.radius += 0.5;
    if (this.radius > this.maxRadius) this.markedForDeletion = true;
  }
}

class Raven {
  constructor() {
    this.raven = new Image();
    this.raven.src = "./resources/spritesheet.png";
    this.rows = 4;
    this.cols = 1;
    this.spriteWidth = this.raven.width / this.rows;
    this.spriteHeight = this.raven.height / this.cols;
    this.sizeModifier = Math.random() * (0.65 - 0.25) + 0.25;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height * 1.5);
    this.dx = Math.random() * (5 - 2.5) + 2.5 + globalSpeed;
    this.dy = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 100 + 50;
    this.frame = 0;
    this.red = Math.floor(Math.random() * 255);
    this.green = Math.floor(Math.random() * 255);
    this.blue = Math.floor(Math.random() * 255);
    this.color = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    this.hasTrail = Math.random() < 0.3;
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

      if (this.hasTrail) {

        trails.push(
          new Trail(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width,
            this.color
          ),
          new Trail(
            this.x + this.width / 2 + 5,
            this.y + this.height / 2 + 5,
            this.width,
            this.color
          ),
          new Trail(
            this.x + this.width / 2 - 5,
            this.y + this.height / 2 - 5,
            this.width,
            this.color
          )
        );
      }
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
      gameLost = true;
      this.markedForDeletion = true;
    }
  }
}

class Explosion {
  constructor(x, y, sizeModifier) {
    this.spriteSheet = explosion;
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
      explosions.push(
        new Explosion(
          raven.x + raven.width / 2,
          raven.y + raven.height / 2,
          raven.sizeModifier
        )
      );
    }
  });
});
let layers = [];
class Layer {
  constructor(imageUrl, speedModifier) {
    this.imageUrl = imageUrl;
    this.image = new Image();
    this.image.src = this.imageUrl;
    this.speedModifier = speedModifier;
    this.speed = gameSpeed * this.speedModifier;
    this.width = 2400;
    this.x = 0;
    this.y = 0;
  }
  draw() {
    ctx.drawImage(this.image, this.x, 0);
    ctx.drawImage(this.image, this.x + this.width, 0);
  }
  update() {
    this.speed = gameSpeed * this.speedModifier;
    if (this.x < -this.width) this.x = 0;
    else this.x -= this.speed;
    // this.x = gameFrame * this.speed % this.width
    this.draw();
  }
}

// const layer_1 = new Layer("./resources/layers/1.png", 0.2);
// const layer_2 = new Layer("./resources/layers/2.png", 0.4);
// const layer_3 = new Layer("./resources/layers/3.png", 0.6);
// const layer_4 = new Layer("./resources/layers/4.png", 0.8);

// layers.push(layer_1, layer_2, layer_3, layer_4);


const animate = (timestamp) => {

  let deltaTime = timestamp - previousTimestamp;
  previousTimestamp = timestamp;
  timeToNextRaven += deltaTime;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore();

  [...explosions, ...trails, ...ravens].forEach((object) =>
    object.update(deltaTime)
  );
  ravens = ravens.filter((object) => !object.markedForDeletion);
  trails = trails.filter((object) => !object.markedForDeletion);
  [...layers, ...explosions, ...trails, ...ravens].forEach((object) => object.draw());
  ravens.sort((r1, r2) => r2 - r1);

  if (timeToNextRaven > 1000) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }
  globalSpeed += 0.005;
  // console.log(trails);
  if(!gameLost)   requestAnimationFrame(animate);
  else {
    ctx.font = "40px Helvetica ";
    ctx.fillStyle = "black";
    ctx.fillText(`Game Over! Your Score was ${score}, Reload Window to Restart The Game `, ctx.canvas.width/2 - 550 -5 , ctx.canvas.height/2 -5);
    ctx.fillStyle = "black";
    ctx.fillText(`Game Over! Your Score was ${score}, Reload Window to Restart The Game `, ctx.canvas.width/2 + 5 - 550, ctx.canvas.height/2 + 5);
 
    ctx.fillStyle = "white";
    ctx.fillText(`Game Over! Your Score was ${score}, Reload Window to Restart The Game `, ctx.canvas.width/2 - 550, ctx.canvas.height/2 );
    
  }
};
animate(0);
