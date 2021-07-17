let width = 200, height = 200, size = width * height, scale = 4;
C.width = width * scale;
C.height = height * scale;
let R = (n = 1) => n * Math.random();

let gen = () => {
  let d = 0;
  let g = [];
  for (let i = 0; i < size; i++) {
    d = d*0.9 + (R() - 0.5)*0.2;
    g[i] = ((
      + g[i - 1] / 2.3
      + g[i - width + 1] / 2.1
    ) || 0) + d + (R() - 0.5);
  }
  return g;
}

let ctx = C.getContext("2d");
let g = gen();
for (let i = 0; i < size; i++) {
  ctx.fillStyle = `rgba(0,0,0,${g[i]})`;
  ctx.fillRect((i + ~~(i / width) / 2) % width * scale, ~~(i / width) * scale, scale, scale)
}
