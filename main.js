/**  @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 500);
const CANVAS_HEIGHT = (canvas.height = 800);


const totalRavens = 20;
let ravens = [];
class Raven {
  constructor() {
    this.raven = new Image();
    this.raven.src = './resources/raven.png';
    this.rows = 6;
    this.cols = 1;
    this.spriteWidth = this.raven.width/this.rows;
    this.spriteHeight = this.raven.height/this.cols;
    this.sizeModifier = Math.random() * (0.75 - 0.25) + 0.25;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height * 1.5);
    this.dx = Math.random() * (5 - 2.5) + 2.5;
    this.markedForDeletion = false;

    this.frame = 0;
  }

  draw() {
    ctx.drawImage(this.raven, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
  }
  update() {
    this.draw();
    if(this.frame+1 > this.rows-1){
      this.frame=0
    }
    else this.frame++;
    this.x -= this.dx;
    if (this.x < 0 - this.width) {
      this.markedForDeletion = true;
    }
    console.log(`Frame = ${this.frame}`)
  }
}

for (let i = 0; i < totalRavens; i++) {
  ravens.push(new Raven());
}

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ravens.forEach((raven, i) => {
    raven.update();
    if (raven.x < 0 - raven.width) {
      ravens = ravens.filter(raven => !raven.markedForDeletion)
    }
  });
};
animate();
