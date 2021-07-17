{
  const h = 150, w = 300, size = h * w, riverFlowLevel = 120;
  const rng = (n) => ~~(Math.sin(++seed) ** 2 * 1e9 % n);
  const ctx = C.getContext("2d");
  let seed = 7, scale = 4, threed = false, gradual = false;
  let elevation;
  let river;
  let humidity;
  let numberOfNeighbors = 6;
  let biomes = true;
  let render;
  let generate = async () => {
    humidity = null;
    let d = [-1, 1, -w, w, w - 1, 1 - w, w + 1, -w - 1].slice(0, numberOfNeighbors);
    let p = -1;
    let r = -1;
    let flow;
    river = new Array(size).fill(0);
    elevation = new Array(size).fill(-14);
    for (let t = size * 10; --t; t) {
      p = (p + size) % size + d[rng(numberOfNeighbors)];
      elevation[p] = (t / size - 1) / 3 + (elevation[p] + d.map((v) => elevation[p + v] || 0).reduce((a, b) => a + b, 0) / numberOfNeighbors) / 2;
      if (!(elevation[r] > -5)) {
        r = rng(size);
        flow = 0;
      }
      let next = r + d.sort((a, b) => elevation[a + r] - elevation[b + r])[0];
      let dh = elevation[r] - elevation[next];
      if (t < size / 4)
        river[r] += flow * 7;
      if (dh > 0) {
        let d2 = dh / 4;
        elevation[r] -= d2;
        elevation[next] += d2;
        flow += dh;
        r = next;
      } else {
        r = -1;
      }
      if (gradual && t % 2e4 == 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        render();
      }
    }
    humidity = elevation.map((h2, i) => h2 < 0 ? 10 : river[i] / riverFlowLevel);
    for (let t = size * 25; --t; t) {
      let at = t % size;
      if (elevation[at] > -1) {
        let dir = rng(Math.cos(at / size * 6) * 9) + d[rng(numberOfNeighbors)] * 2;
        humidity[at + dir] += humidity[at] * 10 / (30 + elevation[at]);
        humidity[at + dir] = (humidity[at + dir] * 4 + d.map((v) => humidity[at + dir + v] || 0).reduce((a, b) => a + b, 0)) / (4 + numberOfNeighbors);
      }
    }
    render();
  };
  render = (left = 0, top = 0) => {
    C.width = w * scale;
    C.height = h * scale;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 2e3, 1e3);
    if (threed)
      ctx.strokeStyle = `rgba(0,0,0,0.3)`;
    elevation.forEach((v, i) => {
      let heat = Math.sin(i / size * 3.14) - v / 30;
      let foliage = (humidity ? humidity[i] : 0) - heat * 9;
      ctx.fillStyle = river[i] > riverFlowLevel && v >= 0 ? "#578" : v >= 0 && v < 22 && biomes && humidity ? heat < 0 ? "#cce" : foliage > 6 ? "#040" : foliage < 0 ? "#a86" : "#560" : `rgba(${v < 0 ? "0,40,60," + (0.7 - v / 30) : "60,40,0," + (v / 70 + 0.6)})`;
      ctx.beginPath();
      ctx.rect(left + (i % w * scale + ~~(numberOfNeighbors == 6 ? ~~(i / w) * scale / 2 : 0)) % (w * scale), top + ~~(i / w) * scale - (threed ? v : 0), scale, scale * (threed ? 5 : 1));
      ctx.fill();
      if (threed)
        ctx.stroke();
    });
  };
  window.onkeypress = (e) => {
    switch (Number(e.key)) {
      case 1:
        numberOfNeighbors = 10 - numberOfNeighbors;
        generate();
        break;
      case 2:
        biomes = !biomes;
        render();
        break;
      case 3:
        threed = !threed;
        render();
        break;
      case 4:
        gradual = !gradual;
        generate();
        break;
      default:
        seed = e.which;
        generate();
    }
  };
  const generateSeveral = () => {
    C.height = C.width = 2e3;
    scale = 1;
    for (let i = 0; i < 12; i++) {
      seed = i;
      generate();
      render(i % 3 * 310, ~~(i / 3) * 160);
    }
  };
  generate();
}
