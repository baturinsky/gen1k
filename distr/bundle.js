{
  const h = 150, w = 300, size = h * w, riverFlowLevel = 120;
  const rng = (n) => ~~(Math.sin(++seed) ** 2 * 1e9 % n);
  const ctx = C.getContext("2d");
  let seed = 2, scale = 4;
  let elevation;
  let river;
  let humidity;
  let numberOfNeighbors = 6;
  let biomes = true;
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
      if (dh > 0 && next != void 0) {
        let d2 = dh / 4;
        elevation[r] -= d2;
        elevation[next] += d2;
        flow += dh;
        r = next;
      } else {
        r = -1;
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
  let render = (left = 0, top = 0) => {
    C.width = w * scale;
    C.height = h * scale;
    elevation.forEach((v, i) => {
      let heat = Math.sin(i / size * 3.14) - v / 30;
      let foliage = humidity[i] - heat * 9;
      ctx.fillStyle = river[i] > riverFlowLevel && v >= 0 ? "#578" : v >= 0 && v < 22 && biomes && humidity ? heat < 0 ? "#cce" : foliage > 6 ? "#040" : foliage < 0 ? "#a86" : "#560" : `rgba(${v < 0 ? "0,40,60," + (0.7 - v / 30) : "60,40,0," + (v / 70 + 0.6)})`;
      ctx.fillRect(left + (i % w * scale + ~~(numberOfNeighbors == 6 ? ~~(i / w) * scale / 2 : 0)) % (w * scale), top + ~~(i / w) * scale, scale, scale);
    });
  };
  generate();
  window.onkeypress = (e) => {
    if (e.key == 1) {
      biomes = !biomes;
      render();
    } else if (e.key == 2) {
      numberOfNeighbors = 14 - numberOfNeighbors;
      generate();
    } else {
      seed = e.which;
      generate();
    }
  };
}
