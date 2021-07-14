{
  const h = 150, w = 300, size = h * w, scale = 4, riverFlowLevel = 120;
  const rng = (n) => ~~(Math.sin(++seed) ** 2 * 1e9 % n);
  //const rng = (n) => ~~(Math.random() * n);
  const ctx = C.getContext("2d");

  let seed = 1;

  let elevation: number[];
  let river: number[];
  let humidity: number[];

  let directions = 6;
  let biomes = true;

  let generate = () => {

    let d = [-1, 1, -w, w, -1 + w, +1 - w].slice(0, directions);

    let p = -1;
    let r = -1
    river = new Array(size).fill(0);
    elevation = river.map((v, i) => Math.cos(i / size / 2) * 10 - 23);
    let flow;

    for (let t = size * 9; --t; t) {

      p = (p + size) % size + d[rng(directions)];
      elevation[p] = (elevation[p] + d.map(v => elevation[p + v] || 0).reduce((a, b) => a + b, 0) / directions) / 2 + (t / size - 2) / 2 /* + (i<size/3?3:1)*/;

      if (!(elevation[r] > -5)) {
        r = rng(size);
        flow = 0;
      }
      let srt = d.sort((a, b) => elevation[a + r] - elevation[b + r]);
      let next = r + srt[0];
      let dh = elevation[r] - elevation[next];
      if (t < size / 4)
        river[r] += flow * 7/* / (t / size + 0.5)*/;
      if (dh > 0 && next != undefined) {
        let d = dh / 4;
        elevation[r] -= d;
        elevation[next] += d;
        flow += dh;
        /*elev[next] += flow*0.5;
        flow *= 0.5;*/
        r = next;
      } else {
        r = -1;
      }
    }

    humidity = elevation.map((h, i) => h < 0 ? 10 : river[i] / riverFlowLevel);

    for (let t = size * 25; --t; t) {
      //let at = rng(size);
      let at = t % size;
      if (elevation[at] > -1) {
        let dir = rng(Math.cos(at / size * 6) * 9) + d[rng(directions)] * 2;
        humidity[at + dir] += humidity[at] * 10 / (30 + elevation[at]);
        humidity[at + dir] = (humidity[at + dir] * 4 + d.map(v => humidity[at + dir + v] || 0).reduce((a, b) => a + b, 0)) / (4 + directions);
      }
    }
  }

  let render = () => {
    C.width = w * scale;
    C.height = h * scale;

    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 2e3, 1e3)
    ctx.lineWidth = 0.2;

    elevation.forEach((v, i) => {
      v = ~~v;
      let heat = Math.sin(i / size * 3.14);
      let foliage = humidity[i] - heat * 9;
      ctx.fillStyle =
        river[i] > riverFlowLevel && v >= 0 ? '#578' :
          (v >= 0 && v < 22 && biomes) ?
            heat * 25 < v ? "#cce" : foliage > 6 ? "#040" : foliage < -2 ? "#a86" : "#560"
            :
            `rgba(${v < 0 ? "0,40,60," + (0.6 - v / 30) : "60,40,0," + (v / 70 + 0.6)})`
      //let h = v<0?-((-v)**2/30):v**1.5/5;
      ctx.fillRect((i % w * scale + ~~(directions == 6 ? ~~(i / w) * scale / 2 : 0)) % (w * scale), ~~(i / w) * scale, scale, scale)
      
      /*ctx.beginPath();
      ctx.rect((i % w * scale + ~~(directions == 6 ? ~~(i / w) * scale / 2 : 0)) % (w * scale), ~~(i / w) * scale - h, scale, scale*5);
      ctx.stroke();*/
    });
  }

  generate();
  render();

  window.onkeypress = e => {
    if (e.key == 1) {
      biomes = !biomes;
      render();
    } else if (e.key == 2) {
      directions = 10 - directions;
      generate();
      render();
    } else {
      seed = e.which;
      generate();
      render();
    }
  }
}

//ctx.fillRect((i % w * scale + ~~(directions == 6 ? ~~(i / w) * scale / 2 : 0)) % (w * scale), ~~(i / w) * scale - v, scale, 0.5);
