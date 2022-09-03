/**  @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 500);
const CANVAS_HEIGHT = (canvas.height = 800);

const totalRavens = 20;
let ravens = [];
class Raven {
  constructor() {
    this.width = Math.random() * 75 + 25;
    this.height = this.width / 2;
    this.x = canvas.width;
    this.y = Math.random() * canvas.height - this.height;
    this.dx = Math.random() * (5 - 2.5) + 2.5;
    this.notIndisplay = false;
  }

  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.x -= this.dx;
    if (this.x < 0 - this.width) {
      this.notIndisplay = true;
    }
    this.draw();
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
      ravens = ravens.filter(raven => !raven.notIndisplay)
    }
  });
  console.log(ravens);
};
animate();
