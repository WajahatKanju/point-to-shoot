/**  @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 500);
const CANVAS_HEIGHT = (canvas.height = 800);
const position = canvas.getBoundingClientRect();

let score = 0;

const mousePosition = {
  x: undefined,
  y: undefined,
}

window.addEventListener('mousemove', e => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
})


let ravens = [];

let previousTimestamp = 0; 
let timeToNextRaven = 0;


class Raven {
  constructor() {
    this.raven = new Image();
    this.raven.src = './resources/raven.png';
    this.rows = 6;
    this.cols = 1;
    this.spriteWidth = this.raven.width/this.rows;
    this.spriteHeight = this.raven.height/this.cols;
    this.sizeModifier = Math.random() * (0.65 - 0.25) + 0.25;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height * 1.5);
    this.dx = Math.random() * (5 - 2.5) + 2.5;
    this.dy = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.timeSinceFlap =0;
    this.flapInterval = Math.random() * 100 + 50;
    this.frame = 0;
  }

  draw() {
    ctx.strokeRect(this.x, this.y, this.width, this.height)
    ctx.drawImage(this.raven, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
  }
  update(deltaTime) {
    this.draw();
    this.timeSinceFlap += deltaTime;
    console.log(deltaTime);
    if(this.timeSinceFlap > this.flapInterval){
      this.timeSinceFlap = 0;
      if(this.frame+1 > this.rows-1){
        this.frame=0
      }
      else this.frame++;
    }
    if(this.y + this.dy < 0 || this.y > canvas.height - this.height){
      this.dy =  -this.dy;
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
  ctx.font = '30px Impact';
  ctx.fillStyle = 'black';
  let scoreX = 5;
  let scoreY = 30;
  ctx.fillText(`Score: ${score}`, scoreX, scoreY);
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, scoreX + 5, scoreY + 5);
}

const animate = (timestamp) => {
  requestAnimationFrame(animate);
  
  let deltaTime = timestamp - previousTimestamp;
  previousTimestamp = timestamp;
  timeToNextRaven += deltaTime;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore();
  ravens.forEach((raven) => {
    raven.update(deltaTime);
    if (raven.x < 0 - raven.width) {
      ravens = ravens.filter(raven => !raven.markedForDeletion);
    }
  });
  if(timeToNextRaven > 200){
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }
  
};
animate(0);
