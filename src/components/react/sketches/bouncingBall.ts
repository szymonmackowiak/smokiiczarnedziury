export default function sketch(p: any) {
  let x = 100, y = 100, vx = 2, vy = 1.5;
  p.setup = () => {
    p.createCanvas(400, 200);
    x = p.width / 2;
    y = p.height / 2;
  };
  p.draw = () => {
    p.background(240);
    p.fill(60, 120, 220);
    p.noStroke();
    p.ellipse(x, y, 40, 40);
    x += vx; y += vy;
    if (x < 20 || x > p.width - 20) vx *= -1;
    if (y < 20 || y > p.height - 20) vy *= -1;
  };
}