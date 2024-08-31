var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const SERVER_PORT = 6970;
const PLAYER_SIZE = 0.5;
const PLAYER_SPEED = 2;
const PLAYER_RADIUS = 0.5;
const BOMB_LIFETIME = 2;
const BOMB_THROW_VELOCITY = 5;
const BOMB_GRAVITY = 10;
const BOMB_DAMP = 0.8;
const BOMB_SCALE = 0.25;
class RGBA {
  constructor(r, g, b, a) {
    __publicField(this, "r");
    __publicField(this, "g");
    __publicField(this, "b");
    __publicField(this, "a");
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  toStyle() {
    return `rgba(${Math.floor(this.r * 255)}, ${Math.floor(this.g * 255)}, ${Math.floor(this.b * 255)}, ${this.a})`;
  }
}
class Vector2 {
  constructor(x = 0, y = 0) {
    __publicField(this, "x");
    __publicField(this, "y");
    this.x = x;
    this.y = y;
  }
  setPolar(angle, len = 1) {
    this.x = Math.cos(angle) * len;
    this.y = Math.sin(angle) * len;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  copy(that) {
    this.x = that.x;
    this.y = that.y;
    return this;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    return this;
  }
  add(that) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }
  sub(that) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }
  div(that) {
    this.x /= that.x;
    this.y /= that.y;
    return this;
  }
  mul(that) {
    this.x *= that.x;
    this.y *= that.y;
    return this;
  }
  sqrLength() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.sqrLength());
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  scale(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }
  norm() {
    const l = this.length();
    return l === 0 ? this : this.scale(1 / l);
  }
  rot90() {
    const oldX = this.x;
    this.x = -this.y;
    this.y = oldX;
    return this;
  }
  sqrDistanceTo(that) {
    const dx = that.x - this.x;
    const dy = that.y - this.y;
    return dx * dx + dy * dy;
  }
  distanceTo(that) {
    return Math.sqrt(this.sqrDistanceTo(that));
  }
  lerp(that, t) {
    this.x += (that.x - this.x) * t;
    this.y += (that.y - this.y) * t;
    return this;
  }
  dot(that) {
    return this.x * that.x + this.y * that.y;
  }
  map(f) {
    this.x = f(this.x);
    this.y = f(this.y);
    return this;
  }
}
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    this.x = x;
    this.y = y;
    this.z = z;
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  clone2() {
    return new Vector2(this.x, this.y);
  }
  copy(that) {
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;
    return this;
  }
  copy2(that, z) {
    this.x = that.x;
    this.y = that.y;
    this.z = z;
    return this;
  }
  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  }
  add(that) {
    this.x += that.x;
    this.y += that.y;
    this.z += that.z;
    return this;
  }
  sub(that) {
    this.x -= that.x;
    this.y -= that.y;
    this.z -= that.z;
    return this;
  }
  div(that) {
    this.x /= that.x;
    this.y /= that.y;
    this.z /= that.z;
    return this;
  }
  mul(that) {
    this.x *= that.x;
    this.y *= that.y;
    this.z *= that.z;
    return this;
  }
  sqrLength() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.sqrLength());
  }
  scale(value) {
    this.x *= value;
    this.y *= value;
    this.z *= value;
    return this;
  }
  norm() {
    const l = this.length();
    return l === 0 ? this : this.scale(1 / l);
  }
  sqrDistanceTo(that) {
    const dx = that.x - this.x;
    const dy = that.y - this.y;
    const dz = that.z - this.z;
    return dx * dx + dy * dy + dz * dz;
  }
  distanceTo(that) {
    return Math.sqrt(this.sqrDistanceTo(that));
  }
  lerp(that, t) {
    this.x += (that.x - this.x) * t;
    this.y += (that.y - this.y) * t;
    this.z += (that.z - this.z) * t;
    return this;
  }
  dot(that) {
    return this.x * that.x + this.y * that.y + this.z * that.z;
  }
  map(f) {
    this.x = f(this.x);
    this.y = f(this.y);
    this.z = f(this.z);
    return this;
  }
}
var Moving = /* @__PURE__ */ ((Moving2) => {
  Moving2[Moving2["MovingForward"] = 0] = "MovingForward";
  Moving2[Moving2["MovingBackward"] = 1] = "MovingBackward";
  Moving2[Moving2["TurningLeft"] = 2] = "TurningLeft";
  Moving2[Moving2["TurningRight"] = 3] = "TurningRight";
  Moving2[Moving2["Count"] = 4] = "Count";
  return Moving2;
})(Moving || {});
var MessageKind = /* @__PURE__ */ ((MessageKind2) => {
  MessageKind2[MessageKind2["Hello"] = 0] = "Hello";
  MessageKind2[MessageKind2["PlayerJoined"] = 1] = "PlayerJoined";
  MessageKind2[MessageKind2["PlayerLeft"] = 2] = "PlayerLeft";
  MessageKind2[MessageKind2["PlayerMoving"] = 3] = "PlayerMoving";
  MessageKind2[MessageKind2["AmmaMoving"] = 4] = "AmmaMoving";
  MessageKind2[MessageKind2["AmmaThrowing"] = 5] = "AmmaThrowing";
  MessageKind2[MessageKind2["Ping"] = 6] = "Ping";
  MessageKind2[MessageKind2["Pong"] = 7] = "Pong";
  MessageKind2[MessageKind2["ItemSpawned"] = 8] = "ItemSpawned";
  MessageKind2[MessageKind2["ItemCollected"] = 9] = "ItemCollected";
  MessageKind2[MessageKind2["BombSpawned"] = 10] = "BombSpawned";
  MessageKind2[MessageKind2["BombExploded"] = 11] = "BombExploded";
  return MessageKind2;
})(MessageKind || {});
const UINT8_SIZE = 1;
const UINT32_SIZE = 4;
const FLOAT32_SIZE = 4;
function allocUint8Field(allocator) {
  const offset = allocator.size;
  const size = UINT8_SIZE;
  allocator.size += size;
  return {
    offset,
    size,
    read: (view) => view.getUint8(offset),
    write: (view, value) => view.setUint8(offset, value)
  };
}
function allocUint32Field(allocator) {
  const offset = allocator.size;
  const size = UINT32_SIZE;
  allocator.size += size;
  return {
    offset,
    size,
    read: (view) => view.getUint32(offset, true),
    write: (view, value) => view.setUint32(offset, value, true)
  };
}
function allocFloat32Field(allocator) {
  const offset = allocator.size;
  const size = FLOAT32_SIZE;
  allocator.size += size;
  return {
    offset,
    size,
    read: (view) => view.getFloat32(offset, true),
    write: (view, value) => view.setFloat32(offset, value, true)
  };
}
function verifier(kindField, kind, size) {
  return (view) => view.byteLength == size && kindField.read(view) == kind;
}
const ItemCollectedStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const index = allocUint32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 9, size);
  return { kind, index, size, verify };
})();
const BombSpawnedStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const index = allocUint32Field(allocator);
  const x = allocFloat32Field(allocator);
  const y = allocFloat32Field(allocator);
  const z = allocFloat32Field(allocator);
  const dx = allocFloat32Field(allocator);
  const dy = allocFloat32Field(allocator);
  const dz = allocFloat32Field(allocator);
  const lifetime = allocFloat32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 10, size);
  return { kind, index, x, y, z, dx, dy, dz, lifetime, size, verify };
})();
const BombExplodedStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const index = allocUint32Field(allocator);
  const x = allocFloat32Field(allocator);
  const y = allocFloat32Field(allocator);
  const z = allocFloat32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 11, size);
  return { kind, index, x, y, z, size, verify };
})();
const ItemSpawnedStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const itemKind = allocUint8Field(allocator);
  const index = allocUint32Field(allocator);
  const x = allocFloat32Field(allocator);
  const y = allocFloat32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 8, size);
  return { kind, itemKind, index, x, y, size, verify };
})();
const PingStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const timestamp = allocUint32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 6, size);
  return { kind, timestamp, size, verify };
})();
const PongStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const timestamp = allocUint32Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 7, size);
  return { kind, timestamp, size, verify };
})();
const HelloStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const id = allocUint32Field(allocator);
  const x = allocFloat32Field(allocator);
  const y = allocFloat32Field(allocator);
  const direction = allocFloat32Field(allocator);
  const hue = allocUint8Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 0, size);
  return { kind, id, x, y, direction, hue, size, verify };
})();
const AmmaMovingStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const direction = allocUint8Field(allocator);
  const start = allocUint8Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 4, size);
  return { kind, direction, start, size, verify };
})();
const AmmaThrowingStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const size = allocator.size;
  const verify = verifier(kind, 5, size);
  return { kind, size, verify };
})();
const PlayerStruct = (() => {
  const allocator = { size: 0 };
  const id = allocUint32Field(allocator);
  const x = allocFloat32Field(allocator);
  const y = allocFloat32Field(allocator);
  const direction = allocFloat32Field(allocator);
  const hue = allocUint8Field(allocator);
  const moving = allocUint8Field(allocator);
  const size = allocator.size;
  return { id, x, y, direction, hue, moving, size };
})();
const PlayersJoinedHeaderStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const size = allocator.size;
  const itemSize = PlayerStruct.size;
  const verify = (view) => view.byteLength >= size && (view.byteLength - size) % itemSize === 0 && kind.read(view) == 1;
  const count = (view) => (view.byteLength - size) / itemSize;
  return { kind, count, size, verify };
})();
const PlayersMovingHeaderStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const size = allocator.size;
  const itemSize = PlayerStruct.size;
  const verify = (view) => view.byteLength >= size && (view.byteLength - size) % itemSize === 0 && kind.read(view) == 3;
  const count = (view) => (view.byteLength - size) / itemSize;
  return { kind, count, size, verify };
})();
const PlayersLeftHeaderStruct = (() => {
  const allocator = { size: 0 };
  const kind = allocUint8Field(allocator);
  const headerSize = allocator.size;
  const itemSize = UINT32_SIZE;
  const items = (index) => {
    return {
      id: {
        read: (view) => view.getUint32(headerSize + index * itemSize, true),
        write: (view, value) => view.setUint32(headerSize + index * itemSize, value, true)
      }
    };
  };
  const verify = (view) => view.byteLength >= headerSize && (view.byteLength - headerSize) % itemSize === 0 && kind.read(view) === 2;
  const allocateAndInit = (countItems) => {
    const buffer = new ArrayBuffer(headerSize + itemSize * countItems);
    const view = new DataView(buffer);
    kind.write(
      view,
      2
      /* PlayerLeft */
    );
    return view;
  };
  const count = (view) => (view.byteLength - headerSize) / itemSize;
  return { kind, count, items, itemSize, headerSize, verify, allocateAndInit };
})();
function properMod(a, b) {
  return (a % b + b) % b;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function sceneContains(scene, p) {
  return 0 <= p.x && p.x < scene.width && 0 <= p.y && p.y < scene.height;
}
function sceneGetTile(scene, p) {
  if (!sceneContains(scene, p)) return false;
  return scene.walls[Math.floor(p.y) * scene.width + Math.floor(p.x)];
}
function sceneCanRectangleFitHere(scene, px, py, sx, sy) {
  const x1 = Math.floor(px - sx * 0.5);
  const x2 = Math.floor(px + sx * 0.5);
  const y1 = Math.floor(py - sy * 0.5);
  const y2 = Math.floor(py + sy * 0.5);
  for (let x = x1; x <= x2; ++x) {
    for (let y = y1; y <= y2; ++y) {
      if (sceneGetTile(scene, new Vector2(x, y))) {
        return false;
      }
    }
  }
  return true;
}
function createScene(walls) {
  const scene = {
    height: walls.length,
    width: Number.MIN_VALUE,
    walls: []
  };
  for (let row of walls) {
    scene.width = Math.max(scene.width, row.length);
  }
  for (let row of walls) {
    scene.walls = scene.walls.concat(row);
    for (let i = 0; i < scene.width - row.length; ++i) {
      scene.walls.push(false);
    }
  }
  return scene;
}
var ItemKind = /* @__PURE__ */ ((ItemKind2) => {
  ItemKind2[ItemKind2["Key"] = 0] = "Key";
  ItemKind2[ItemKind2["Bomb"] = 1] = "Bomb";
  return ItemKind2;
})(ItemKind || {});
function collectItem(player, item) {
  if (item.alive) {
    if (player.position.sqrDistanceTo(item.position) < PLAYER_RADIUS * PLAYER_RADIUS) {
      item.alive = false;
      return true;
    }
  }
  return false;
}
function allocateBombs(capacity) {
  let bomb = [];
  for (let i = 0; i < capacity; ++i) {
    bomb.push({
      position: new Vector3(),
      velocity: new Vector3(),
      lifetime: 0
    });
  }
  return bomb;
}
function throwBomb(player, bombs) {
  for (let index = 0; index < bombs.length; ++index) {
    const bomb = bombs[index];
    if (bomb.lifetime <= 0) {
      bomb.lifetime = BOMB_LIFETIME;
      bomb.position.copy2(player.position, 0.6);
      bomb.velocity.x = Math.cos(player.direction);
      bomb.velocity.y = Math.sin(player.direction);
      bomb.velocity.z = 0.5;
      bomb.velocity.scale(BOMB_THROW_VELOCITY);
      return index;
    }
  }
  return null;
}
function updateBomb(bomb, scene, deltaTime) {
  let collided = false;
  bomb.lifetime -= deltaTime;
  bomb.velocity.z -= BOMB_GRAVITY * deltaTime;
  const nx = bomb.position.x + bomb.velocity.x * deltaTime;
  const ny = bomb.position.y + bomb.velocity.y * deltaTime;
  if (sceneGetTile(scene, new Vector2(nx, ny))) {
    const dx = Math.abs(Math.floor(bomb.position.x) - Math.floor(nx));
    const dy = Math.abs(Math.floor(bomb.position.y) - Math.floor(ny));
    if (dx > 0) bomb.velocity.x *= -1;
    if (dy > 0) bomb.velocity.y *= -1;
    bomb.velocity.scale(BOMB_DAMP);
    if (bomb.velocity.length() > 1) collided = true;
  } else {
    bomb.position.x = nx;
    bomb.position.y = ny;
  }
  const nz = bomb.position.z + bomb.velocity.z * deltaTime;
  if (nz < BOMB_SCALE || nz > 1) {
    bomb.velocity.z *= -1;
    bomb.velocity.scale(BOMB_DAMP);
    if (bomb.velocity.length() > 1) collided = true;
  } else {
    bomb.position.z = nz;
  }
  return collided;
}
function createLevel() {
  const scene = createScene([
    [false, false, true, true, true, false, false],
    [false, false, false, false, false, true, false],
    [true, false, false, false, false, true, false],
    [true, false, false, false, false, true, false],
    [true],
    [false, true, true, true, false, false, false],
    [false, false, false, false, false, false, false]
  ]);
  const items = [
    {
      kind: 1,
      position: new Vector2(1.5, 3.5),
      alive: true
    },
    {
      kind: 0,
      position: new Vector2(2.5, 1.5),
      alive: true
    },
    {
      kind: 0,
      position: new Vector2(3, 1.5),
      alive: true
    },
    {
      kind: 0,
      position: new Vector2(3.5, 1.5),
      alive: true
    },
    {
      kind: 0,
      position: new Vector2(4, 1.5),
      alive: true
    },
    {
      kind: 0,
      position: new Vector2(4.5, 1.5),
      alive: true
    }
  ];
  const bombs = allocateBombs(20);
  return { scene, items, bombs };
}
function updatePlayer(player, scene, deltaTime) {
  const controlVelocity = new Vector2();
  let angularVelocity = 0;
  if (player.moving >> 0 & 1) {
    controlVelocity.add(new Vector2().setPolar(player.direction, PLAYER_SPEED));
  }
  if (player.moving >> 1 & 1) {
    controlVelocity.sub(new Vector2().setPolar(player.direction, PLAYER_SPEED));
  }
  if (player.moving >> 2 & 1) {
    angularVelocity -= Math.PI;
  }
  if (player.moving >> 3 & 1) {
    angularVelocity += Math.PI;
  }
  player.direction = player.direction + angularVelocity * deltaTime;
  const nx = player.position.x + controlVelocity.x * deltaTime;
  if (sceneCanRectangleFitHere(scene, nx, player.position.y, PLAYER_SIZE, PLAYER_SIZE)) {
    player.position.x = nx;
  }
  const ny = player.position.y + controlVelocity.y * deltaTime;
  if (sceneCanRectangleFitHere(scene, player.position.x, ny, PLAYER_SIZE, PLAYER_SIZE)) {
    player.position.y = ny;
  }
}
const initWasm = async (opts = {}, url) => {
  let result;
  if (url.startsWith("data:")) {
    const urlContent = url.replace(/^data:.*?base64,/, "");
    let bytes;
    if (typeof Buffer === "function" && typeof Buffer.from === "function") {
      bytes = Buffer.from(urlContent, "base64");
    } else if (typeof atob === "function") {
      const binaryString = atob(urlContent);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      throw new Error(
        "Failed to decode base64-encoded data URL, Buffer and atob are not supported"
      );
    }
    result = await WebAssembly.instantiate(bytes, opts);
  } else {
    const response = await fetch(url);
    const contentType = response.headers.get("Content-Type") || "";
    if ("instantiateStreaming" in WebAssembly && contentType.startsWith("application/wasm")) {
      result = await WebAssembly.instantiateStreaming(response, opts);
    } else {
      const buffer = await response.arrayBuffer();
      result = await WebAssembly.instantiate(buffer, opts);
    }
  }
  return result.instance;
};
const createRenderer = (opts) => initWasm(opts, "/assets/renderer-CM6HW2lB.wasm?init");
const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI * 0.5;
const SCREEN_FACTOR = 30;
const SCREEN_WIDTH = Math.floor(16 * SCREEN_FACTOR);
const SCREEN_HEIGHT = Math.floor(9 * SCREEN_FACTOR);
const ITEM_FREQ = 0.7;
const ITEM_AMP = 0.07;
const BOMB_PARTICLE_COUNT = 50;
const PARTICLE_LIFETIME = 1;
const PARTICLE_DAMP = 0.8;
const PARTICLE_SCALE = 0.05;
const PARTICLE_MAX_SPEED = 8;
const PARTICLE_COLOR = new RGBA(1, 0.5, 0.15, 1);
const SPRITE_ANGLES_COUNT = 8;
const CONTROL_KEYS = {
  "ArrowLeft": Moving.TurningLeft,
  "ArrowRight": Moving.TurningRight,
  "ArrowUp": Moving.MovingForward,
  "ArrowDown": Moving.MovingBackward,
  "KeyA": Moving.TurningLeft,
  "KeyD": Moving.TurningRight,
  "KeyW": Moving.MovingForward,
  "KeyS": Moving.MovingBackward
};
function createSpritePool() {
  return {
    items: [],
    length: 0
  };
}
function resetSpritePool(spritePool) {
  spritePool.length = 0;
}
function snap(x, dx) {
  if (dx > 0) return Math.ceil(x + Math.sign(dx) * EPS);
  if (dx < 0) return Math.floor(x + Math.sign(dx) * EPS);
  return x;
}
function hittingCell(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return new Vector2(
    Math.floor(p2.x + Math.sign(dx) * EPS),
    Math.floor(p2.y + Math.sign(dy) * EPS)
  );
}
function rayStep(p1, p2) {
  let p3 = p2.clone();
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx !== 0) {
    const k = dy / dx;
    const c = p1.y - k * p1.x;
    {
      const x3 = snap(p2.x, dx);
      const y3 = x3 * k + c;
      p3.set(x3, y3);
    }
    if (k !== 0) {
      const y3 = snap(p2.y, dy);
      const x3 = (y3 - c) / k;
      const p3t = new Vector2(x3, y3);
      if (p2.sqrDistanceTo(p3t) < p2.sqrDistanceTo(p3)) {
        p3.copy(p3t);
      }
    }
  } else {
    const y3 = snap(p2.y, dy);
    const x3 = p2.x;
    p3.set(x3, y3);
  }
  return p3;
}
function castRay(scene, p1, p2) {
  let start = p1;
  while (start.sqrDistanceTo(p1) < FAR_CLIPPING_PLANE * FAR_CLIPPING_PLANE) {
    const c = hittingCell(p1, p2);
    if (sceneGetTile(scene, c)) break;
    const p3 = rayStep(p1, p2);
    p1 = p2;
    p2 = p3;
  }
  return p2;
}
function renderDebugInfo(ctx, deltaTime, game) {
  const fontSize = 28;
  ctx.font = `${fontSize}px bold`;
  game.dts.push(deltaTime);
  if (game.dts.length > 60)
    game.dts.shift();
  const dtAvg = game.dts.reduce((a, b) => a + b, 0) / game.dts.length;
  const labels = [];
  labels.push(`FPS: ${Math.floor(1 / dtAvg)}`);
  switch (game.ws.readyState) {
    case WebSocket.CONNECTING:
      {
        labels.push("Connecting...");
      }
      break;
    case WebSocket.OPEN:
      {
        labels.push(`Ping: ${game.ping.toFixed(2)}ms`);
        labels.push(`Players: ${game.players.size}`);
      }
      break;
    case WebSocket.CLOSING:
    case WebSocket.CLOSED:
      {
        labels.push(`Offline`);
      }
      break;
  }
  const shadowOffset = fontSize * 0.06;
  const padding = 70;
  for (let i = 0; i < labels.length; ++i) {
    ctx.fillStyle = "black";
    ctx.fillText(labels[i], padding, padding + fontSize * i);
    ctx.fillStyle = "white";
    ctx.fillText(labels[i], padding + shadowOffset, padding - shadowOffset + fontSize * i);
  }
}
function renderColumnOfWall(display, cell, x, p, c) {
  if (cell instanceof RGBA) {
    const stripHeight = display.backImageHeight / display.zBuffer[x];
    const shadow = 1 / display.zBuffer[x] * 2;
    for (let dy = 0; dy < Math.ceil(stripHeight); ++dy) {
      const y = Math.floor((display.backImageHeight - stripHeight) * 0.5) + dy;
      const destP = (y * display.backImageWidth + x) * 4;
      display.backImageData[destP + 0] = cell.r * shadow * 255;
      display.backImageData[destP + 1] = cell.g * shadow * 255;
      display.backImageData[destP + 2] = cell.b * shadow * 255;
    }
  } else if (cell instanceof ImageData) {
    const stripHeight = display.backImageHeight / display.zBuffer[x];
    let u = 0;
    const t = p.clone().sub(c);
    if (Math.abs(t.x) < EPS && t.y > 0) {
      u = t.y;
    } else if (Math.abs(t.x - 1) < EPS && t.y > 0) {
      u = 1 - t.y;
    } else if (Math.abs(t.y) < EPS && t.x > 0) {
      u = 1 - t.x;
    } else {
      u = t.x;
    }
    const y1f = (display.backImageHeight - stripHeight) * 0.5;
    const y1 = Math.ceil(y1f);
    const y2 = Math.floor(y1 + stripHeight);
    const by1 = Math.max(0, y1);
    const by2 = Math.min(display.backImageHeight, y2);
    const tx = Math.floor(u * cell.width);
    const sh = cell.height / stripHeight;
    const shadow = Math.min(1 / display.zBuffer[x] * 4, 1);
    for (let y = by1; y < by2; ++y) {
      const ty = Math.floor((y - y1f) * sh);
      const destP = (y * display.backImageWidth + x) * 4;
      const srcP = (ty * cell.width + tx) * 4;
      display.backImageData[destP + 0] = cell.data[srcP + 0] * shadow;
      display.backImageData[destP + 1] = cell.data[srcP + 1] * shadow;
      display.backImageData[destP + 2] = cell.data[srcP + 2] * shadow;
    }
  }
}
function renderWalls(display, assets, camera, scene) {
  const d = new Vector2().setPolar(camera.direction);
  for (let x = 0; x < display.backImageWidth; ++x) {
    const p = castRay(scene, camera.position, camera.fovLeft.clone().lerp(camera.fovRight, x / display.backImageWidth));
    const c = hittingCell(camera.position, p);
    const v = p.clone().sub(camera.position);
    display.zBuffer[x] = v.dot(d);
    if (sceneGetTile(scene, c)) {
      renderColumnOfWall(display, assets.wallImageData, x, p, c);
    }
  }
}
function createDisplay(ctx, buffer, width, height) {
  const pixelPtr = allocate_pixels(width, height);
  const backImageData = new Uint8ClampedArray(buffer, pixelPtr, width * height * 4);
  backImageData.fill(255);
  const backCanvas = new OffscreenCanvas(width, height);
  const backCtx = backCanvas.getContext("2d");
  if (backCtx === null) throw new Error("2D context is not supported");
  backCtx.imageSmoothingEnabled = false;
  return {
    ctx,
    backCtx,
    backImageData,
    backImageWidth: width,
    backImageHeight: height,
    zBuffer: Array(width).fill(0)
  };
}
function displaySwapBackImageData(display) {
  display.backCtx.putImageData(new ImageData(display.backImageData, display.backImageWidth), 0, 0);
  display.ctx.drawImage(display.backCtx.canvas, 0, 0, display.ctx.canvas.width, display.ctx.canvas.height);
}
function cullAndSortSprites(camera, spritePool, visibleSprites) {
  const sp = new Vector2();
  const dir = new Vector2().setPolar(camera.direction);
  const fov = camera.fovRight.clone().sub(camera.fovLeft);
  visibleSprites.length = 0;
  for (let i = 0; i < spritePool.length; ++i) {
    const sprite = spritePool.items[i];
    sp.copy(sprite.position).sub(camera.position);
    const spl = sp.length();
    if (spl <= NEAR_CLIPPING_PLANE) continue;
    if (spl >= FAR_CLIPPING_PLANE) continue;
    const cos = sp.dot(dir) / spl;
    if (cos < 0) continue;
    sprite.dist = NEAR_CLIPPING_PLANE / cos;
    sp.norm().scale(sprite.dist).add(camera.position).sub(camera.fovLeft);
    sprite.t = sp.length() / fov.length() * Math.sign(sp.dot(fov));
    sprite.pdist = sprite.position.clone().sub(camera.position).dot(dir);
    if (sprite.pdist < NEAR_CLIPPING_PLANE) continue;
    if (sprite.pdist >= FAR_CLIPPING_PLANE) continue;
    visibleSprites.push(sprite);
  }
  visibleSprites.sort((a, b) => b.pdist - a.pdist);
}
function renderSprites(display, sprites) {
  for (let sprite of sprites) {
    const cx = display.backImageWidth * sprite.t;
    const cy = display.backImageHeight * 0.5;
    const maxSpriteSize = display.backImageHeight / sprite.pdist;
    const spriteSize = maxSpriteSize * sprite.scale;
    const x1 = Math.floor(cx - spriteSize * 0.5);
    const x2 = Math.floor(x1 + spriteSize - 1);
    const bx1 = Math.max(0, x1);
    const bx2 = Math.min(display.backImageWidth - 1, x2);
    const y1 = Math.floor(cy + maxSpriteSize * 0.5 - maxSpriteSize * sprite.z);
    const y2 = Math.floor(y1 + spriteSize - 1);
    const by1 = Math.max(0, y1);
    const by2 = Math.min(display.backImageHeight - 1, y2);
    if (sprite.image instanceof ImageData) {
      const src = sprite.image.data;
      const dest = display.backImageData;
      for (let x = bx1; x <= bx2; ++x) {
        if (sprite.pdist < display.zBuffer[x]) {
          for (let y = by1; y <= by2; ++y) {
            const tx = Math.floor((x - x1) / spriteSize * sprite.cropSize.x);
            const ty = Math.floor((y - y1) / spriteSize * sprite.cropSize.y);
            const srcP = ((ty + sprite.cropPosition.y) * sprite.image.width + (tx + sprite.cropPosition.x)) * 4;
            const destP = (y * display.backImageWidth + x) * 4;
            const alpha = src[srcP + 3] / 255;
            dest[destP + 0] = dest[destP + 0] * (1 - alpha) + src[srcP + 0] * alpha;
            dest[destP + 1] = dest[destP + 1] * (1 - alpha) + src[srcP + 1] * alpha;
            dest[destP + 2] = dest[destP + 2] * (1 - alpha) + src[srcP + 2] * alpha;
          }
        }
      }
    } else if (sprite.image instanceof RGBA) {
      const dest = display.backImageData;
      for (let x = bx1; x <= bx2; ++x) {
        if (sprite.pdist < display.zBuffer[x]) {
          for (let y = by1; y <= by2; ++y) {
            const destP = (y * display.backImageWidth + x) * 4;
            const alpha = sprite.image.a;
            dest[destP + 0] = dest[destP + 0] * (1 - alpha) + sprite.image.r * 255 * alpha;
            dest[destP + 1] = dest[destP + 1] * (1 - alpha) + sprite.image.g * 255 * alpha;
            dest[destP + 2] = dest[destP + 2] * (1 - alpha) + sprite.image.b * 255 * alpha;
          }
        }
      }
    }
  }
}
function pushSprite(spritePool, image, position, z, scale, cropPosition, cropSize) {
  if (spritePool.length >= spritePool.items.length) {
    spritePool.items.push({
      image,
      position: new Vector2(),
      z,
      scale,
      pdist: 0,
      dist: 0,
      t: 0,
      cropPosition: new Vector2(),
      cropSize: new Vector2()
    });
  }
  const last = spritePool.length;
  spritePool.items[last].image = image;
  spritePool.items[last].position.copy(position);
  spritePool.items[last].z = z;
  spritePool.items[last].scale = scale;
  spritePool.items[last].pdist = 0;
  spritePool.items[last].dist = 0;
  spritePool.items[last].t = 0;
  if (image instanceof ImageData) {
    if (cropPosition === void 0) {
      spritePool.items[last].cropPosition.set(0, 0);
    } else {
      spritePool.items[last].cropPosition.copy(cropPosition);
    }
    if (cropSize === void 0) {
      spritePool.items[last].cropSize.set(image.width, image.height).sub(spritePool.items[last].cropPosition);
    } else {
      spritePool.items[last].cropSize.copy(cropSize);
    }
  } else {
    spritePool.items[last].cropPosition.set(0, 0);
    spritePool.items[last].cropSize.set(0, 0);
  }
  spritePool.length += 1;
}
function updateCamera(player, camera) {
  const halfFov = FOV * 0.5;
  const fovLen = NEAR_CLIPPING_PLANE / Math.cos(halfFov);
  camera.position.copy(player.position);
  camera.direction = player.direction;
  camera.fovLeft.setPolar(camera.direction - halfFov, fovLen).add(camera.position);
  camera.fovRight.setPolar(camera.direction + halfFov, fovLen).add(camera.position);
}
function spriteOfItemKind(itemKind, assets) {
  switch (itemKind) {
    case ItemKind.Key:
      return assets.keyImageData;
    case ItemKind.Bomb:
      return assets.bombImageData;
    default:
      return assets.nullImageData;
  }
}
function updateItems(ws, spritePool, time, me, items, assets) {
  for (let item of items) {
    if (item.alive) {
      pushSprite(spritePool, spriteOfItemKind(item.kind, assets), item.position, 0.25 + ITEM_AMP - ITEM_AMP * Math.sin(ITEM_FREQ * Math.PI * time + item.position.x + item.position.y), 0.25);
    }
  }
  if (ws.readyState != WebSocket.OPEN) {
    for (let item of items) {
      if (collectItem(me, item)) {
        playSound(assets.itemPickupSound, me.position, item.position);
      }
    }
  }
}
function allocateParticles(capacity) {
  let bomb = [];
  for (let i = 0; i < capacity; ++i) {
    bomb.push({
      position: new Vector3(),
      velocity: new Vector3(),
      lifetime: 0
    });
  }
  return bomb;
}
function updateParticles(spritePool, deltaTime, scene, particles) {
  for (let particle of particles) {
    if (particle.lifetime > 0) {
      particle.lifetime -= deltaTime;
      particle.velocity.z -= BOMB_GRAVITY * deltaTime;
      const nx = particle.position.x + particle.velocity.x * deltaTime;
      const ny = particle.position.y + particle.velocity.y * deltaTime;
      if (sceneGetTile(scene, new Vector2(nx, ny))) {
        const dx = Math.abs(Math.floor(particle.position.x) - Math.floor(nx));
        const dy = Math.abs(Math.floor(particle.position.y) - Math.floor(ny));
        if (dx > 0) particle.velocity.x *= -1;
        if (dy > 0) particle.velocity.y *= -1;
        particle.velocity.scale(PARTICLE_DAMP);
      } else {
        particle.position.x = nx;
        particle.position.y = ny;
      }
      const nz = particle.position.z + particle.velocity.z * deltaTime;
      if (nz < PARTICLE_SCALE || nz > 1) {
        particle.velocity.z *= -1;
        particle.velocity.scale(PARTICLE_DAMP);
      } else {
        particle.position.z = nz;
      }
      if (particle.lifetime > 0) {
        pushSprite(spritePool, PARTICLE_COLOR, new Vector2(particle.position.x, particle.position.y), particle.position.z, PARTICLE_SCALE);
      }
    }
  }
}
function emitParticle(source, particles) {
  for (let particle of particles) {
    if (particle.lifetime <= 0) {
      particle.lifetime = PARTICLE_LIFETIME;
      particle.position.copy(source);
      const angle = Math.random() * 2 * Math.PI;
      particle.velocity.x = Math.cos(angle);
      particle.velocity.y = Math.sin(angle);
      particle.velocity.z = Math.random() * 0.5 + 0.5;
      particle.velocity.scale(PARTICLE_MAX_SPEED * Math.random());
      break;
    }
  }
}
function playSound(sound, playerPosition, objectPosition) {
  const maxVolume = 1;
  const distanceToPlayer = objectPosition.distanceTo(playerPosition);
  sound.volume = clamp(maxVolume / distanceToPlayer, 0, 1);
  sound.currentTime = 0;
  sound.play();
}
function explodeBomb(bomb, player, assets, particles) {
  playSound(assets.bombBlastSound, player.position, bomb.position.clone2());
  for (let i = 0; i < BOMB_PARTICLE_COUNT; ++i) {
    emitParticle(bomb.position, particles);
  }
}
function updateBombs(ws, spritePool, player, bombs, particles, scene, deltaTime, assets) {
  for (let bomb of bombs) {
    if (bomb.lifetime > 0) {
      pushSprite(spritePool, assets.bombImageData, new Vector2(bomb.position.x, bomb.position.y), bomb.position.z, BOMB_SCALE);
      if (updateBomb(bomb, scene, deltaTime)) {
        playSound(assets.bombRicochetSound, player.position, bomb.position.clone2());
      }
      if (ws.readyState != WebSocket.OPEN && bomb.lifetime <= 0) {
        explodeBomb(bomb, player, assets, particles);
      }
    }
  }
}
async function loadImage(url) {
  const image = new Image();
  image.src = url;
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}
async function loadImageData(url) {
  const image = await loadImage(url);
  const canvas = new OffscreenCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("2d canvas is not supported");
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}
async function createGame() {
  const [wallImageData, keyImageData, bombImageData, playerImageData, nullImageData] = await Promise.all([
    loadImageData("images/custom/wall.png"),
    loadImageData("images/custom/key.png"),
    loadImageData("images/custom/bomb.png"),
    loadImageData("images/custom/player.png"),
    loadImageData("images/custom/null.png")
  ]);
  const itemPickupSound = new Audio("sounds/bomb-pickup.ogg");
  const bombRicochetSound = new Audio("sounds/ricochet.wav");
  const bombBlastSound = new Audio("sounds/blast.ogg");
  const assets = {
    wallImageData,
    keyImageData,
    bombImageData,
    playerImageData,
    nullImageData,
    bombRicochetSound,
    itemPickupSound,
    bombBlastSound
  };
  const particles = allocateParticles(1e3);
  const visibleSprites = [];
  const spritePool = createSpritePool();
  const players = /* @__PURE__ */ new Map();
  const camera = {
    position: new Vector2(),
    direction: 0,
    fovLeft: new Vector2(),
    fovRight: new Vector2()
  };
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(`${protocol}//${window.location.hostname}:${SERVER_PORT}`);
  if (window.location.hostname === "tsoding.github.io") ws.close();
  const me = {
    id: 0,
    position: new Vector2(),
    direction: 0,
    moving: 0,
    hue: 0
  };
  const level = createLevel();
  for (const item of level.items) item.alive = false;
  const game = {
    camera,
    ws,
    me,
    ping: 0,
    players,
    particles,
    assets,
    spritePool,
    visibleSprites,
    dts: [],
    level
  };
  ws.binaryType = "arraybuffer";
  ws.addEventListener("close", (event) => {
    console.log("WEBSOCKET CLOSE", event);
    game.players.clear();
  });
  ws.addEventListener("error", (event) => {
    console.log("WEBSOCKET ERROR", event);
  });
  ws.addEventListener("message", (event) => {
    if (!(event.data instanceof ArrayBuffer)) {
      console.error("Received bogus-amogus message from server. Expected binary data", event);
      ws == null ? void 0 : ws.close();
    }
    const view = new DataView(event.data);
    if (HelloStruct.verify(view)) {
      game.me = {
        id: HelloStruct.id.read(view),
        position: new Vector2(HelloStruct.x.read(view), HelloStruct.y.read(view)),
        direction: HelloStruct.direction.read(view),
        moving: 0,
        hue: HelloStruct.hue.read(view) / 256 * 360
      };
      players.set(game.me.id, game.me);
    } else if (PlayersJoinedHeaderStruct.verify(view)) {
      const count = PlayersJoinedHeaderStruct.count(view);
      for (let i = 0; i < count; ++i) {
        const playerView = new DataView(event.data, PlayersJoinedHeaderStruct.size + i * PlayerStruct.size, PlayerStruct.size);
        const id = PlayerStruct.id.read(playerView);
        const player = players.get(id);
        if (player !== void 0) {
          player.position.x = PlayerStruct.x.read(playerView);
          player.position.y = PlayerStruct.y.read(playerView);
          player.direction = PlayerStruct.direction.read(playerView);
          player.moving = PlayerStruct.moving.read(playerView);
          player.hue = PlayerStruct.hue.read(playerView) / 256 * 360;
        } else {
          const x = PlayerStruct.x.read(playerView);
          const y = PlayerStruct.y.read(playerView);
          players.set(id, {
            id,
            position: new Vector2(x, y),
            direction: PlayerStruct.direction.read(playerView),
            moving: PlayerStruct.moving.read(playerView),
            hue: PlayerStruct.hue.read(playerView) / 256 * 360
          });
        }
      }
    } else if (PlayersLeftHeaderStruct.verify(view)) {
      const count = PlayersLeftHeaderStruct.count(view);
      for (let i = 0; i < count; ++i) {
        const id = PlayersLeftHeaderStruct.items(i).id.read(view);
        players.delete(id);
      }
    } else if (PlayersMovingHeaderStruct.verify(view)) {
      const count = PlayersMovingHeaderStruct.count(view);
      for (let i = 0; i < count; ++i) {
        const playerView = new DataView(event.data, PlayersMovingHeaderStruct.size + i * PlayerStruct.size, PlayerStruct.size);
        const id = PlayerStruct.id.read(playerView);
        const player = players.get(id);
        if (player === void 0) {
          console.error(`Received bogus-amogus message from server. We don't know anything about player with id ${id}`);
          ws == null ? void 0 : ws.close();
          return;
        }
        player.moving = PlayerStruct.moving.read(playerView);
        player.position.x = PlayerStruct.x.read(playerView);
        player.position.y = PlayerStruct.y.read(playerView);
        player.direction = PlayerStruct.direction.read(playerView);
      }
    } else if (PongStruct.verify(view)) {
      game.ping = performance.now() - PongStruct.timestamp.read(view);
    } else if (ItemCollectedStruct.verify(view)) {
      const index = ItemCollectedStruct.index.read(view);
      if (!(0 <= index && index < game.level.items.length)) {
        console.error(`Received bogus-amogus ItemCollected message from server. Invalid index ${index}`);
        ws == null ? void 0 : ws.close();
        return;
      }
      if (game.level.items[index].alive) {
        game.level.items[index].alive = false;
        playSound(assets.itemPickupSound, game.me.position, game.level.items[index].position);
      }
    } else if (ItemSpawnedStruct.verify(view)) {
      const index = ItemSpawnedStruct.index.read(view);
      if (!(0 <= index && index < game.level.items.length)) {
        console.error(`Received bogus-amogus ItemSpawned message from server. Invalid index ${index}`);
        ws == null ? void 0 : ws.close();
        return;
      }
      game.level.items[index].alive = true;
      game.level.items[index].kind = ItemSpawnedStruct.itemKind.read(view);
      game.level.items[index].position.x = ItemSpawnedStruct.x.read(view);
      game.level.items[index].position.y = ItemSpawnedStruct.y.read(view);
    } else if (BombSpawnedStruct.verify(view)) {
      const index = BombSpawnedStruct.index.read(view);
      if (!(0 <= index && index < game.level.bombs.length)) {
        console.error(`Received bogus-amogus BombSpawned message from server. Invalid index ${index}`);
        ws == null ? void 0 : ws.close();
        return;
      }
      game.level.bombs[index].lifetime = BombSpawnedStruct.lifetime.read(view);
      game.level.bombs[index].position.x = BombSpawnedStruct.x.read(view);
      game.level.bombs[index].position.y = BombSpawnedStruct.y.read(view);
      game.level.bombs[index].position.z = BombSpawnedStruct.z.read(view);
      game.level.bombs[index].velocity.x = BombSpawnedStruct.dx.read(view);
      game.level.bombs[index].velocity.y = BombSpawnedStruct.dy.read(view);
      game.level.bombs[index].velocity.z = BombSpawnedStruct.dz.read(view);
    } else if (BombExplodedStruct.verify(view)) {
      const index = BombExplodedStruct.index.read(view);
      if (!(0 <= index && index < game.level.bombs.length)) {
        console.error(`Received bogus-amogus BombExploded message from server. Invalid index ${index}`);
        ws == null ? void 0 : ws.close();
        return;
      }
      game.level.bombs[index].lifetime = 0;
      game.level.bombs[index].position.x = BombExplodedStruct.x.read(view);
      game.level.bombs[index].position.y = BombExplodedStruct.y.read(view);
      game.level.bombs[index].position.z = BombExplodedStruct.z.read(view);
      explodeBomb(level.bombs[index], me, assets, particles);
    } else {
      console.error("Received bogus-amogus message from server.", view);
      ws == null ? void 0 : ws.close();
    }
  });
  ws.addEventListener("open", (event) => {
    console.log("WEBSOCKET OPEN", event);
  });
  return game;
}
function spriteAngleIndex(cameraPosition, entity) {
  return Math.floor(properMod(properMod(entity.direction, 2 * Math.PI) - properMod(entity.position.clone().sub(cameraPosition).angle(), 2 * Math.PI) - Math.PI + Math.PI / 8, 2 * Math.PI) / (2 * Math.PI) * SPRITE_ANGLES_COUNT);
}
function renderGame(display, deltaTime, time, game) {
  resetSpritePool(game.spritePool);
  game.players.forEach((player) => {
    if (player !== game.me) updatePlayer(player, game.level.scene, deltaTime);
  });
  updatePlayer(game.me, game.level.scene, deltaTime);
  updateCamera(game.me, game.camera);
  updateItems(game.ws, game.spritePool, time, game.me, game.level.items, game.assets);
  updateBombs(game.ws, game.spritePool, game.me, game.level.bombs, game.particles, game.level.scene, deltaTime, game.assets);
  updateParticles(game.spritePool, deltaTime, game.level.scene, game.particles);
  game.players.forEach((player) => {
    if (player !== game.me) {
      const index = spriteAngleIndex(game.camera.position, player);
      pushSprite(game.spritePool, game.assets.playerImageData, player.position, 1, 1, new Vector2(55 * index, 0), new Vector2(55, 55));
    }
  });
  render_floor_and_ceiling(game.camera.position.x, game.camera.position.y, properMod(game.camera.direction, 2 * Math.PI));
  renderWalls(display, game.assets, game.camera, game.level.scene);
  cullAndSortSprites(game.camera, game.spritePool, game.visibleSprites);
  renderSprites(display, game.visibleSprites);
  displaySwapBackImageData(display);
  renderDebugInfo(display.ctx, deltaTime, game);
}
function make_environment(...envs) {
  return new Proxy(envs, {
    get(_target, prop, _receiver) {
      for (let env of envs) {
        if (env.hasOwnProperty(prop)) {
          return env[prop];
        }
      }
      return (...args) => {
        throw new Error(`NOT IMPLEMENTED: ${String(prop)} ${args}`);
      };
    }
  });
}
let allocate_pixels;
let render_floor_and_ceiling;
(async () => {
  const gameCanvas = document.getElementById("game");
  if (gameCanvas === null) throw new Error("No canvas with id `game` is found");
  const factor = 80;
  gameCanvas.width = 16 * factor;
  gameCanvas.height = 9 * factor;
  const ctx = gameCanvas.getContext("2d");
  if (ctx === null) throw new Error("2D context is not supported");
  ctx.imageSmoothingEnabled = false;
  const { exports } = await createRenderer({
    env: make_environment({
      "fmodf": (x, y) => x % y,
      "fminf": Math.min,
      "fmaxf": Math.max
    })
  });
  const memory = exports.memory;
  allocate_pixels = exports.allocate_pixels;
  render_floor_and_ceiling = exports.render_floor_and_ceiling;
  const game = await createGame();
  const display = createDisplay(ctx, memory.buffer, SCREEN_WIDTH, SCREEN_HEIGHT);
  window.addEventListener("keydown", (e) => {
    if (!e.repeat) {
      const direction = CONTROL_KEYS[e.code];
      if (direction !== void 0) {
        if (game.ws.readyState === WebSocket.OPEN) {
          const view = new DataView(new ArrayBuffer(AmmaMovingStruct.size));
          AmmaMovingStruct.kind.write(view, MessageKind.AmmaMoving);
          AmmaMovingStruct.start.write(view, 1);
          AmmaMovingStruct.direction.write(view, direction);
          game.ws.send(view);
        } else {
          game.me.moving |= 1 << direction;
        }
      } else if (e.code === "Space") {
        if (game.ws.readyState === WebSocket.OPEN) {
          const view = new DataView(new ArrayBuffer(AmmaThrowingStruct.size));
          AmmaThrowingStruct.kind.write(view, MessageKind.AmmaThrowing);
          game.ws.send(view);
        } else {
          throwBomb(game.me, game.level.bombs);
        }
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    if (!e.repeat) {
      const direction = CONTROL_KEYS[e.code];
      if (direction !== void 0) {
        if (game.ws.readyState === WebSocket.OPEN) {
          const view = new DataView(new ArrayBuffer(AmmaMovingStruct.size));
          AmmaMovingStruct.kind.write(view, MessageKind.AmmaMoving);
          AmmaMovingStruct.start.write(view, 0);
          AmmaMovingStruct.direction.write(view, direction);
          game.ws.send(view);
        } else {
          game.me.moving &= ~(1 << direction);
        }
      }
    }
  });
  const PING_COOLDOWN = 60;
  let prevTimestamp = 0;
  let pingCooldown = PING_COOLDOWN;
  const frame = (timestamp) => {
    const deltaTime = (timestamp - prevTimestamp) / 1e3;
    const time = timestamp / 1e3;
    prevTimestamp = timestamp;
    renderGame(display, deltaTime, time, game);
    if (game.ws.readyState == WebSocket.OPEN) {
      pingCooldown -= 1;
      if (pingCooldown <= 0) {
        const view = new DataView(new ArrayBuffer(PingStruct.size));
        PingStruct.kind.write(view, MessageKind.Ping);
        PingStruct.timestamp.write(view, performance.now());
        game.ws.send(view);
        pingCooldown = PING_COOLDOWN;
      }
    }
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame((timestamp) => {
    prevTimestamp = timestamp;
    window.requestAnimationFrame(frame);
  });
})();
//# sourceMappingURL=index-7QWquRgU.js.map
