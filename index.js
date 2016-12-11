
// Create a new Map2. The constructor takes in an iterable of data values in
// the form of [[k1, k2, v], [k1, k2, v], ...].
function Map2(data) {
  this.map = new Map;
  this.size = 0;
  if (data) {
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      this.set(d[0], d[1], d[2]);
    }
  }
}

// Get k1, k2. Returns value or undefined.
Map2.prototype.get = function(k1, k2) {
  var inner;
  if ((inner = this.map.get(k1))) {
    return inner.get(k2);
  }
};

// Does the map have k1, k2. Returns true / false.
Map2.prototype.has = function(k1, k2) {
  var inner = this.map.get(k1);
  return inner ? inner.has(k2) : false;
};

// Set (k1, k2) -> v. Chainable - returns the set.
Map2.prototype.set = function(k1, k2, v) {
  var inner = this.map.get(k1);
  if (!inner) {
    inner = new Map;
    this.map.set(k1, inner);
  }
  this.size -= inner.size;
  inner.set(k2, v);
  this.size += inner.size;
  return this;
};

// Deletes the value for (k1, k2). Returns true if an element was removed,
// false otherwise.
Map2.prototype.delete = function(k1, k2) {
  var inner = this.map.get(k1);
  if (inner) {
    var deleted = inner.delete(k2);
    if (deleted) {
      this.size--;
    }
    return deleted;
  } else {
    return false;
  }
};

// Remove all items in the map.
Map2.prototype.clear = function() {
  this.map.clear();
  this.size = 0;
};


// Iterates through all values in the set via the passed function. Note the
// order of arguments - your function is called with (v, k1, k2). This is to
// match the semantics of Map.forEach which passes (v, k).
Map2.prototype.forEach = function(fn) {
  this.map.forEach(function(inner, k1) {
    inner.forEach(function(v, k2) {
      fn(v, k1, k2);
    });
  });
};

Map2.prototype.inspect = function() {
  this.forEach((v, a, b) => {
    console.log(v, a, b)
  })
}


const canvas = document.getElementsByTagName('canvas')[0]
canvas.width = canvas.clientWidth * devicePixelRatio
canvas.height = canvas.clientHeight * devicePixelRatio

const ctx = canvas.getContext('2d')

ctx.scale(devicePixelRatio, devicePixelRatio)

const color = {
  hut: 'blue',
  road: 'black',
  cheese: 'yellow',
  worker: 'brown',
  combiner: 'orange',
}

const grid = new Map2
const boxes = new Map2
const trees = new Map2
const workers = []

const TILE_SIZE = 32 // px

function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  grid.forEach((v, x, y) => {
    ctx.fillStyle = color[v.type]
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  })
  trees.forEach((v, x, y) => {
    ctx.fillStyle = color[v] || 'red'
    ctx.beginPath()
    ctx.arc(x*TILE_SIZE + TILE_SIZE / 2, y*TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2 - 3, 0, Math.PI * 2)
    ctx.fill()
  })
  boxes.forEach((v, x, y) => {
    ctx.fillStyle = color[v]
    ctx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4)
  })
  workers.forEach(({x, y}) => {
    ctx.fillStyle = color['worker']
    ctx.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8)
  })
}

const resources = ["shoes", "shoe horns", "heels", "wedge heel", "sandals", "slippers", "thongs", "platform shoes", "stilettos", "athletic shoes", "cleats", "booties", "combat boots", "galoshes", "waterproof boots", "riding boots", "Roman sandals",  "high heels", "tap shoes", "loafers", "mukluk", "moccasins", "sneakers", "work boots", "running shoes", "tennis shoes"]

const sample = (arr => arr[(Math.random() * arr.length)|0])

function genTech() {
  const availableResources = resources.slice()
  const randResource = () => {
    const n = (Math.random() * availableResources.length)|0
    const r = availableResources[n]
    availableResources[n] = availableResources[availableResources.length - 1]
    availableResources.length--
    return r
  }

  const primitives = Array(3).fill(0).map(randResource)

  const composites = new Map2

  const pool = primitives.slice()
  for (let i = 0; i < 3; i++) {
    let a, b
    do {
      [a, b] = [sample(pool), sample(pool)].sort()
    } while (composites.has(a, b))
    
    const result = randResource()
    pool.push(result)
    composites.set(a, b, result)
  }

  return [primitives, composites]
}

const [primitives, composites] = genTech()
for (let i = 0; i < 20; i++) {
  const p = sample(primitives)
  const x = (Math.random() * 20)|0 + 1
  const y = (Math.random() * 20)|0 + 1
  trees.set(x, y, p)
}





let brush = 'hut'

function paint(e) {
  const tx = Math.floor(e.clientX / TILE_SIZE)
  const ty = Math.floor(e.clientY / TILE_SIZE)

  if (brush === 'hut') {
    grid.set(tx, ty, {type: 'hut', hasWorker: true})
  } else if (brush === 'combiner') {
    grid.set(tx, ty, {type: 'combiner', item: null})
  } else if (brush === 'cheese') {
    trees.set(tx, ty, brush)
  } else if (brush === 'road') {
    grid.set(tx, ty, {type: 'road'})
  }
}

canvas.addEventListener('click', e => {
  paint(e)
})
canvas.addEventListener('mousemove', e => {
  if (e.buttons) paint(e)
})

window.addEventListener('keydown', e => {
  brush = ({
    'Digit1': 'hut',
    'Digit2': 'cheese',
    'Digit3': 'road',
    'KeyR': 'road',
    'KeyC': 'combiner',
  })[e.code]

  if (e.code === 'Space') {
    sleepyTime()
  }
})



function frame() {
  draw()
  requestAnimationFrame(frame)
}
frame()

const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function getType(x, y) {
  const tile = grid.get(x, y)
  return tile && tile.type
}

function advance() {
  const maybeCombinerEat = (v, x, y) => {
    if (getType(x, y) === 'combiner') {
      const combiner = grid.get(x, y)
      if (combiner.item) {
        const [a, b] = [combiner.item, v].sort()
        combiner.item = null
        const result = composites.has(a, b) ? composites.get(a, b) : 'junk'
        boxes.set(x, y, result)
      } else {
        boxes.delete(x, y)
        combiner.item = v
      }
    }
  }
  const canPushTo = (x, y) => {
    const t = getType(x, y)
    return t === 'road' || t === 'combiner'
  }
  workers.forEach(w => {
    const {x, y, dir:{x:dx, y:dy}} = w
    const isPushing = boxes.get(x+dx, y+dy)
    const behind = grid.get(x+dx*2, y+dy*2)
    if (isPushing ?
          canPushTo(x+dx*2, y+dy*2) && !boxes.has(x+dx*2, y+dy*2)
        : canPushTo(x+dx, y+dy)) {
      if (isPushing) {
        const box = boxes.get(x+dx, y+dy)
        boxes.set(x+dx*2, y+dy*2, box)
        boxes.delete(x+dx, y+dy)
        maybeCombinerEat(box, x+dx*2, y+dy*2)
      }
      w.x += dx; w.y += dy;
    }
  })
  grid.forEach((v, x, y) => {
    if (v.type === 'hut') {
      directions.forEach(([dx, dy]) => {
        if (!v.hasWorker) return;
        let rx = x+dx, ry = y+dy;
        while (getType(rx, ry) === 'road') {
          if (boxes.has(rx, ry)) {
            if (getType(rx+dx, ry+dy) === 'road') {
              // Go out.
              v.hasWorker = false;
              workers.push({x, y, dir:{x:dx, y:dy}})
            }
            break;
          }
          rx += dx; ry += dy;
        }
      })
    }
  })
}

function sleepyTime() {
  grid.forEach((v, x, y) => {
    if (v.type === 'hut') {
      v.hasWorker = true
    }
  })

  boxes.clear()

  trees.forEach((v, x, y) => {
    boxes.set(x, y, v)
  })

  workers.length = 0
}

setInterval(advance, 500)
