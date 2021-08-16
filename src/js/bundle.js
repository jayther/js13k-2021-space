var Resources = {
  imgs: {
    robot: "robot_3Dblue.png"
  },
  patterns: {
    hallwayTile: "repeat",
    roomTile: "repeat",
    wallTile: "repeat"
  },
  loadedImgs: {},
  loadedPatterns: {}
};


var Directions = {
  left: 1,
  top: 2,
  right: 4,
  bottom: 8
};


// Object.assign as extend function
function extend(target, varArgs) {
  'use strict';
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}

function extendPrototype() {
  return extend.apply(this, [{}].concat(Array.prototype.slice.call(arguments)));
}

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

var DOM = (function () {
  var map = {};
  return {
    get: function (id) {
      if (!map[id]) {
        map[id] = document.getElementById(id);
      }
      return map[id];
    },
    create: function (tagName) {
      return document.createElement(tagName);
    }
  };
}());

function KB(press, release) {
  var keys = {};
  var kb = {};
  kb.downHandler = function (e) {
    var k = e.keyCode;
    if (!has(keys, k)) {
      keys[k] = false;
    }
    if (!keys[k]) {
      press(k);
    }
    keys[k] = true;
    e.preventDefault();
  };
  kb.upHandler = function (e) {
    var k = e.keyCode;
    if (!has(keys, k)) {
      keys[k] = false;
    }
    if (keys[k]) {
      release(k);
    }
    keys[k] = false;
    e.preventDefault();
  };
  kb.destroy = function () {
    window.removeEventListener('keydown', kb.downHandler, false);
    window.removeEventListener('keyup', kb.upHandler, false);
  };
  window.addEventListener('keydown', kb.downHandler, false);
  window.addEventListener('keyup', kb.upHandler, false);
  
  return kb;
}

KB.keys = {
  a: 65,
  w: 87,
  s: 83,
  d: 68,
  z: 90,
  q: 81,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  space: 32,
  enter: 13
};


var Random = null;
Random = {
  range: function (min, max) {
    return min + Math.random() * (max - min);
  },
  rangeInt: function (min, max) {
    return Math.floor(Random.range(min, max));
  },
  pick: function (array) {
    return array[Random.rangeInt(0, array.length)];
  },
  pickAndRemove: function (array) {
    var i = Random.rangeInt(0, array.length);
    var item = array[i];
    array.splice(i, 1);
    return item;
  },
  flagPick: function (flags) {
    var pool = [], i = 0;
    while (flags > 0) {
      if (flags & 1) {
        pool.push(1 << i);
      }
      flags >>= 1;
      i += 1;
    }
    if (pool.length > 0) {
      return Random.pick(pool);
    }
    return 0;
  }
};

var JMath = {
  clamp: function (v, min, max) {
    return v < min ? min : v > max ? max : v;
  },
  intersectRectRect: function (a, b) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  },
  angleFromVec: function (v) {
    return Math.atan2(v.y, v.x);
  },
  lengthFromVec: function (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },
  rotateVec: function (v, a) {
    var rotX = Math.cos(a);
    var rotY = Math.sin(a);
    // matrix mult
    return {
      x: v.x * rotX - v.y * rotY,
      y: v.x * rotY + v.y * rotX
    };
  },
  rotateRectAroundPoint: function (rect, point, angle) {
    if (angle === 0) {
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
      };
    }
    var w = rect.right - rect.left,
      h = rect.bottom - rect.top,
      newLeftTop, t, rad = angle / 360 * Math.PI * 2;
    
    if (angle === 90 || angle === 270) {
      t = w;
      w = h;
      h = t;
    }
    
    if (angle === 90) {
      newLeftTop = { x: rect.left, y: rect.bottom };
    } else if (angle === 180) {
      newLeftTop = { x: rect.right, y: rect.bottom };
    } else {
      newLeftTop = { x: rect.right, y: rect.top };
    }
    newLeftTop.x -= point.x;
    newLeftTop.y -= point.y;
    newLeftTop = JMath.rotateVec(newLeftTop, rad);
    return {
      left: point.x + newLeftTop.x,
      top: point.y + newLeftTop.y,
      right: point.x + newLeftTop.x + w,
      bottom: point.y + newLeftTop.y + h
    };
  }
};

function AABB(x, y, hw, hh) {
  this.x = x || 0;
  this.y = y || 0;
  this.hw = hw || 0;
  this.hh = hh || 0;
}
AABB.fromRect = function (rect) {
  return new AABB(
    (rect.left + rect.right) / 2,
    (rect.top + rect.bottom) / 2,
    (rect.right - rect.left) / 2,
    (rect.bottom - rect.top) / 2
  );
};

AABB.prototype = {};
AABB.prototype.set = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};
AABB.prototype.getLeft = function () {
  return this.x - this.hw;
};
AABB.prototype.getTop = function () {
  return this.y - this.hh;
};
AABB.prototype.getRight = function () {
  return this.x + this.hw;
};
AABB.prototype.getBottom = function () {
  return this.y + this.hh;
};
AABB.prototype.getWidth = function () {
  return this.hw * 2;
};
AABB.prototype.getHeight = function () {
  return this.hh * 2;
};
AABB.prototype.intersectsWith = function (aabb) {
  return (
    (Math.abs(this.x - aabb.x) < this.hw + aabb.hw) &&
    (Math.abs(this.y - aabb.y) < this.hh + aabb.hh)
  );
};
AABB.prototype.containsPoint = function (x, y) {
  return Math.abs(this.x - x) < this.hw && Math.abs(this.y - y) < this.hh;
};
AABB.prototype.copy = function () {
  return new AABB(this.x, this.y, this.hw, this.hh);
};
AABB.prototype.grow = function (amt) {
  this.hw += amt;
  this.hh += amt;
  return this;
};
AABB.prototype.rotateAroundPoint = function (point, angle) {
  var t, rad = angle / 360 * Math.PI * 2;
  if (angle === 90 || angle === 270) {
    t = this.hw;
    this.hw = this.hh;
    this.hh = t;
  }

  var n = JMath.rotateVec({ x: this.x - point.x, y: this.y - point.y }, rad);
  this.x = point.x + n.x;
  this.y = point.y + n.y;
  return this;
};
AABB.prototype.toBounds = function () {
  return {
    left: this.x - this.hw,
    top: this.y - this.hh,
    right: this.x + this.hw,
    bottom: this.y + this.hh
  };
};
AABB.prototype.toRect = function () {
  return {
    x: this.x - this.hw,
    y: this.y - this.hh,
    w: this.hw * 2,
    h: this.hh * 2
  };
};

function Anim(settings) {
  this.settings = extend({
    object: null,
    property: null,
    from: 0,
    to: 1,
    duration: 1,
    timeFunction: Anim.easingFunctions.linear,
    onStep: null,
    onEnd: null
  }, settings || {});
  this.startTime = -1;
  this.endTime = -1;
  this.cancelled = false;
}
Anim.easingFunctions = {
  linear: function (t) { return t; },
  easeInCubic: function (t) { return t*t*t; },
  easeOutCubic: function (t) { return (--t)*t*t+1; },
  easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }
};
Anim.prototype = {
  start: function (startTime) {
    this.startTime = startTime;
    this.endTime = startTime + this.settings.duration;
  },
  step: function (time) {
    if (!((this.settings.object && this.settings.property) || this.settings.onStep)) { return; }

    var timeRatio = (time - this.startTime) / this.settings.duration;
    if (timeRatio > 1) {
      timeRatio = 1;
    }
    var ratio = this.settings.timeFunction(timeRatio);
    var adjusted = this.settings.from + (this.settings.to - this.settings.from) * ratio;
    if (this.settings.object && this.settings.property) {
      this.settings.object[this.settings.property] = adjusted;
    }
    if (this.settings.onStep) {
      this.settings.onStep(adjusted);
    }
  },
  cancel: function () {
    this.cancelled = true;
  }
};


function AnimManager() {
  this.time = 0;
  this.anims = [];
}
AnimManager.singleton = null;
AnimManager.prototype = {
  add: function (anim) {
    anim.start(this.time);
    this.anims.push(anim);
  },
  step: function (dts) {
    var i, anim, removeAnim;
    for (i = 0; i < this.anims.length; i += 1) {
      removeAnim = false;
      anim = this.anims[i];
      if (!anim.cancelled) {
        anim.step(this.time);
      }
      if (anim.cancelled) {
        removeAnim = true;
      } else if (this.time >= anim.endTime) {
        if (anim.settings.onEnd) {
          anim.settings.onEnd();
        }
        removeAnim = true;
      }
      if (removeAnim) {
        this.anims.splice(i, 1);
        i -= 1;
      }
    }
    this.time += dts;
  }
};

function DisplayItem(options) {
  var opts = extend({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    visible: true,
    alpha: 1,
    anchorX: 0,
    anchorY: 0
  }, options || {});
  this.parent = null;
  this.x = opts.x;
  this.y = opts.y;
  this.scaleX = opts.scaleX;
  this.scaleY = opts.scaleY;
  this.angle = opts.angle;
  this.visible = opts.visible;
  this.alpha = opts.alpha;
  this.anchorX = opts.anchorX;
  this.anchorY = opts.anchorY;
}
DisplayItem.prototype = {
  setScale: function (scale) {
    this.scaleX = scale;
    this.scaleY = scale;
  },
  _render: function (context) {
    if (this.visible && this.alpha >= 0.01) {
      context.save();
      if (this.x || this.y) {
        context.translate(this.x, this.y);
      }
      if (this.scaleX !== 1 || this.scaleY !== 1) {
        context.scale(this.scaleX, this.scaleY);
      }
      if (this.angle) {
        context.rotate(this.angle);
      }
      if (this.anchorX || this.anchorY) {
        context.translate(-this.anchorX, -this.anchorY);
      }
      if (this.alpha < 1) {
        context.globalAlpha *= this.alpha;
      }
      this.render(context);
      context.restore();
    }
  },
  render: function (context) {}
}

function DisplayContainer(options) {
  DisplayItem.apply(this, arguments);
  this.children = [];
}
DisplayContainer.prototype = extendPrototype(DisplayItem.prototype, {
  addChild: function (child) {
    this.children.push(child);
    child.parent = this;
    return this;
  },
  removeChild: function (child) {
    var i = this.children.indexOf(child);
    if (i >= 0) {
      this.children.splice(i, 1);
      child.parent = null;
    }
    return this;
  },
  render: function (context) {
    for (var i = 0; i < this.children.length; i += 1) {
      this.children[i]._render(context);
    }
  }
});

function DisplayRect(options) {
  DisplayItem.apply(this, arguments);
  var opts = extend({
    w: 0,
    h: 0,
    color: 'black',
    rounded: 0,
    fillOffsetX: 0,
    fillOffsetY: 0,
    fillScaleX: 1,
    fillScaleY: 1
  }, options || {});
  this.rounded = opts.rounded;
  this.w = opts.w;
  this.h = opts.h;
  this.fillOffsetX = opts.fillOffsetX;
  this.fillOffsetY = opts.fillOffsetY;
  this.fillScaleX = opts.fillScaleX;
  this.fillScaleY = opts.fillScaleY;
  this.color = opts.color;
}
DisplayRect.prototype = extendPrototype(DisplayItem.prototype, {
  render: function (context) {
    context.fillStyle = this.color;
    if (this.rounded) {
      var rounded = this.rounded, w = this.w, h = this.h;
      context.beginPath();
      context.moveTo(rounded, 0);
      context.lineTo(w - rounded, 0);
      context.arcTo(w, 0, w, rounded, rounded);
      context.lineTo(w, h - rounded);
      context.arcTo(w, h, w - rounded, h, rounded);
      context.lineTo(rounded, h);
      context.arcTo(0, h, 0, h - rounded, rounded);
      context.lineTo(0, rounded);
      context.arcTo(0, 0, rounded, 0, rounded);
      context.closePath();
      if (this.fillOffsetX || this.fillOffsetY) {
        context.translate(this.fillOffsetX, this.fillOffsetY);
      }
      if (this.fillScaleX !== 1 || this.fillScaleY !== 1) {
        context.scale(this.fillScaleX, this.fillScaleY);
      }
      context.fill();
    } else {
      context.beginPath();
      context.rect(0, 0, this.w, this.h);
      context.closePath();
      if (this.fillOffsetX || this.fillOffsetY) {
        context.translate(this.fillOffsetX, this.fillOffsetY);
      }
      if (this.fillScaleX !== 1 || this.fillScaleY !== 1) {
        context.scale(this.fillScaleX, this.fillScaleY);
      }
      context.fill();
    }
  }
});

function DisplayImg(options) {
  DisplayItem.apply(this, arguments);
  var opts = extend({
    w: 0,
    h: 0,
    img: null
  }, options || {});
  this.w = opts.w;
  this.h = opts.h;
  this.img = opts.img;

  if (this.w && !opts.scaleX) {
    this.scaleX = this.w / this.img.width;
  }
  if (this.h && !opts.scaleY) {
    this.scaleY = this.h / this.img.height;
  }
}
DisplayImg.prototype = extendPrototype(DisplayItem.prototype, {
  render: function (context) {
    context.drawImage(this.img, 0, 0);
  }
});
  
function DisplayText(options) {
  DisplayItem.apply(this, arguments);
  var opts = extend({
    text: '',
    align: 'left',
    baseline: 'top',
    font: null,
    color: 'black'
  }, options || {});
  this.color = opts.color;
  this.text = opts.text;
  this.align = opts.align;
  this.baseline = opts.baseline;
  this.font = opts.font;
}
DisplayText.prototype = extendPrototype(DisplayItem.prototype, {
  render: function (context) {
    if (this.font) {
      context.font = this.font;
    }
    context.textAlign = this.align;
    context.textBaseline = this.baseline;
    context.fillStyle = this.color;
    context.fillText(this.text, 0, 0);
  }
});
  
function DisplayPath(options) {
  DisplayItem.apply(this, arguments);
  var opts = extend({
    path: [],
    color: 'black'
  }, options || {});
  this.path = opts.path;
  this.color = opts.color;
}
DisplayPath.prototype = extendPrototype(DisplayItem.prototype, {
  render: function (context) {
    context.beginPath();
    var i, point;
    for (i = 0; i < this.path.length; i += 1) {
      point = this.path[i];
      if (i === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }
});

function CachedContainer(options) {
  DisplayContainer.apply(this, arguments);
  var opts = extend({
    w: 100,
    h: 100
  }, options || {});
  this.canvas = DOM.create('canvas');
  this.canvas.width = opts.w;
  this.canvas.height = opts.h;
  this.context = this.canvas.getContext('2d');
}
CachedContainer.prototype = extendPrototype(DisplayContainer.prototype, {
  setDimensions: function (w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  },
  addChild: function (child) {
    DisplayContainer.prototype.addChild.apply(this, arguments);
    this.redraw();
  },
  removeChild: function (child) {
    DisplayContainer.prototype.removeChild.apply(this, arguments);
    this.redraw();
  },
  redraw: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.children.length; i += 1) {
      this.children[i]._render(this.context);
    }
  },
  render: function (context) {
    context.drawImage(this.canvas, 0, 0);
  }
});


function squiggles(y, amplitude, iterations, width, thickness) {
  var i, points = [], step = width / (iterations - 1);
  for (i = 0; i < iterations; i += 1) {
    points.push({ x: i * step, y: y + amplitude - thickness / 2 });
    amplitude *= -1;
  }
  amplitude *= -1;
  for (i = iterations - 1; i >= 0; i -= 1) {
    points.push({ x: i * step, y: y + amplitude + thickness / 2});
    amplitude *= -1;
  }
  return points;
}

var hallwayTile = (function () {
  var c = new CachedContainer({ w: 70, h: 70 });
  
  c.addChild(new DisplayRect({
    w: 70, h: 70,
    color: '#c99869'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(25, 5, 7, 70, 16),
    color: '#c58f5c'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(55, 5, 7, 70, 16),
    color: '#c58f5c'
  }));

  return c;
}());

var wallTile = (function () {
  var c = new CachedContainer({ w: 70, h: 70 });
  
  c.addChild(new DisplayRect({
    w: 70, h: 70,
    color: '#838796'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(25, 5, 7, 70, 24),
    color: '#7e8291'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(55, 5, 7, 70, 16),
    color: '#7e8291'
  }));

  return c;
}());

var roomTile = (function () {
  var c = new CachedContainer({ w: 70, h: 70 });
  
  c.addChild(new DisplayRect({
    w: 70, h: 70,
    color: '#acc0c1'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(25, 5, 7, 70, 16),
    color: '#bbcbcc'
  }));

  c.addChild(new DisplayPath({
    path: squiggles(55, 5, 7, 70, 16),
    color: '#bbcbcc'
  }));

  return c;
}());

Resources.loadedImgs.hallwayTile = hallwayTile.canvas;
Resources.loadedImgs.wallTile = wallTile.canvas;
Resources.loadedImgs.roomTile = roomTile.canvas;

function Player(scene, settings) {
  DisplayContainer.call(this, settings);
  this.scene = scene;
  this.aabb = new AABB(0, 0, 10, 10);
  this.prevAabb = new AABB(0, 0, 10, 10);
  this.broadphase = new AABB(0, 0, 10, 10);
  this.speed = 200;
  this.collIterations = 4;
  this.vel = {
    x: 0,
    y: 0
  };
  this.prevVel = {
    x: 0,
    y: 0
  };
  this.normal = {
    x: 0,
    y: 0
  };
  var img = new DisplayImg({
    img: Resources.loadedImgs.robot,
    w: 19,
    h: 20,
    anchorX: 74,
    anchorY: 77
  });
  this.addChild(img);
  this.img = img;
  this.moveDirection = 0;
}
Player.prototype = extendPrototype(DisplayContainer.prototype, {
  addDirection: function (direction) {
    this.moveDirection |= direction;
    this.updateVel();
  },
  removeDirection: function (direction) {
    this.moveDirection ^= direction;
    this.updateVel();
  },
  resetDirection: function () {
    this.moveDirection = 0;
    this.updateVel();
  },
  updateVel: function () {
    this.vel.x = 0;
    this.vel.y = 0;
    if (this.moveDirection & Directions.left) {
      this.vel.x -= this.speed;
    }
    if (this.moveDirection & Directions.right) {
      this.vel.x += this.speed;
    }
    if (this.moveDirection & Directions.top) {
      this.vel.y -= this.speed;
    }
    if (this.moveDirection & Directions.bottom) {
      this.vel.y += this.speed;
    }
  },
  updateAABB: function () {
    this.prevAabb.set(this.aabb.x, this.aabb.y);
    this.aabb.set(this.x, this.y);
  },
  step: function (dts) {
    this.updateVel();

    if (this.vel.x || this.vel.y) {
      this.img.angle = JMath.angleFromVec(this.vel);
    }

    this.x += this.vel.x * dts;
    this.y += this.vel.y * dts;
  }
});

function TutorialKey(x, y, key, delay, animManager) {
  var container = new DisplayContainer({
    x: x,
    y: y
  });
  this.displayItem = container;
  this.animEnabled = false;
  this.delay = delay || 0;
  this.animManager = animManager;

  var keySide = new DisplayRect({
    x: -20,
    y: -5,
    w: 40,
    h: 25,
    color: '#cccccc',
    rounded: 5
  });
  container.addChild(keySide);
  this.keySide = keySide;

  var keyTop = new DisplayContainer({
    x: 0,
    y: 5
  });
  this.keyTop = keyTop;
  container.addChild(keyTop);

  var keyTopRect = new DisplayRect({
    x: -20,
    y: -40,
    w: 40,
    h: 40,
    color: '#ffffff',
    rounded: 5,
  });
  keyTop.addChild(keyTopRect);
  
  var keyTopKey = new DisplayText({
    x: 0,
    y: -20,
    text: key,
    font: '20px Arial',
    color: 'black',
    align: 'center',
    baseline: 'middle'
  });
  keyTop.addChild(keyTopKey);
  this.keyTopKey = keyTopKey;

  this.anims = [];
}

TutorialKey.prototype = {
  start: function () {
    this.animEnabled = true;
    setTimeout(this.startAnim.bind(this), this.delay * 1000);
  },
  startAnim: function () {
    if (!this.animEnabled) { return false; }
    var anim1, anim2;
    anim1 = new Anim({
      object: this.keyTop,
      property: 'y',
      from: 5,
      to: 15,
      duration: 0.5,
      timeFunction: Anim.easingFunctions.easeInCubic,
      onEnd: function () {
        this.animManager.add(anim2);
      }.bind(this)
    });
    anim2 = new Anim({
      object: this.keyTop,
      property: 'y',
      from: 15,
      to: 5,
      duration: 0.5,
      timeFunction: Anim.easingFunctions.easeInCubic,
      onEnd: this.startAnim.bind(this)
    });
    this.animManager.add(anim1);
  },
  stop: function () {
    this.animEnabled = false;
    this.anims.forEach(function (anim) {
      anim.cancel();
    });
  }
};

function Scene(main, settings) {
  DisplayContainer.call(this);
  this.main = main;
  this.settings = settings;
  this.steppables = [];
}
Scene.prototype = extendPrototype(DisplayContainer.prototype, {
  create: function () {},
  destroy: function () {},
  addSteppable: function (steppable) {
    this.steppables.push(steppable);
  },
  step: function (dts) {
    for (var i = 0; i < this.steppables.length; i += 1) {
      this.steppables[i](dts);
    }
  },
  _render: function (context) {
    // we don't need transformations
    this.render(context);
  }
});

function PlayScene() {
  Scene.apply(this, arguments);
  
  var bg = new DisplayRect({
    w: SETTINGS.width,
    h: SETTINGS.height,
    color: '#333333'
  });
  this.addChild(bg);
  
  this.player = new Player(this, {
  });
  this.addChild(this.player);
  
  this.keys = [];
  this.dirKeyMap = {};
  this.dirKeyMap[Directions.left] = [KB.keys.a, KB.keys.q, KB.keys.left];
  this.dirKeyMap[Directions.top] = [KB.keys.w, KB.keys.z, KB.keys.up];
  this.dirKeyMap[Directions.right] = [KB.keys.d, KB.keys.right];
  this.dirKeyMap[Directions.bottom] = [KB.keys.s, KB.keys.down];
  var keyDirMap = {};

  Object.entries(this.dirKeyMap).forEach(function (pair) {
    pair[1].forEach(function (key) {
      keyDirMap[key] = pair[0];
    });
  });
  this.keyDirMap = keyDirMap;
  this.kb = KB(this.keyDown.bind(this), this.keyUp.bind(this));

  this.addSteppable(this.cycle.bind(this));
}
PlayScene.gameStates = {
  tutorial: 1,
  play: 2,
  finished: 3,
  failed: 4
};
PlayScene.prototype = extendPrototype(Scene.prototype, {
  isGameDone: function () {
    return this.gameState === PlayScene.gameStates.finished || this.gameState === PlayScene.gameStates.failed;
  },
  keyDown: function (keyCode) {
    if (!this.keyDirMap[keyCode]) return;
    if (this.isGameDone()) return;
    if (this.gameState === PlayScene.gameStates.tutorial) {
      AnimManager.singleton.add(new Anim({
        object: this.overlay,
        property: 'alpha',
        from: 1,
        to: 0,
        duration: 0.5,
      }));
      this.gameState = PlayScene.gameStates.play;
    }
    this.player.addDirection(this.keyDirMap[keyCode]);
  },
  keyUp: function (keyCode) {
    if (!this.keyDirMap[keyCode]) return;
    this.player.removeDirection(this.keyDirMap[keyCode]);
  },
  destroy: function () {
    this.kb.destroy();
  },
  cycle: function (dts) {
    this.player.step(dts);
  }
});

function MainMenuScene() {
  Scene.apply(this, arguments);

  this.time = 0;
  this.period = 2;

  this.scrollingBg = new DisplayRect({
    w: SETTINGS.width,
    h: SETTINGS.height,
    color: Resources.loadedPatterns.hallwayTile,
    fillScaleX: 5,
    fillScaleY: 5
  });
  this.addChild(this.scrollingBg);

  this.robot = new DisplayImg({
    img: Resources.loadedImgs.robot,
    x: 170,
    y: SETTINGS.height / 2,
    w: 148,
    h: 154,
    anchorX: 74,
    anchorY: 77
  });
  this.addChild(this.robot);

  var mainTitle = new DisplayText({
    text: 'Space Game',
    font: '32px Arial',
    x: 420,
    y: 100,
    align: 'center',
    baseline: 'middle',
    color: 'white'
  });
  this.addChild(mainTitle);

  var tutorialKeyCon = new DisplayContainer({
    x: 420,
    y: 190
  });
  this.addChild(tutorialKeyCon);

  var tutorialText = new DisplayText({
    text: 'Controls:',
    font: '24px Arial',
    x: 0,
    y: -40,
    align: 'center',
    baseline: 'bottom',
    color: 'white'
  });
  tutorialKeyCon.addChild(tutorialText);

  var tutorialKeys = this.tutorialKeys = [
    new TutorialKey(0, 0, 'W', 0, this.main.animManager),
    new TutorialKey(-45, 45, 'A', 0.125, this.main.animManager),
    new TutorialKey(0, 45, 'S', 0.25, this.main.animManager),
    new TutorialKey(45, 45, 'D', 0.375, this.main.animManager)
  ];

  this.tutorialKeys.forEach(function (key) {
    tutorialKeyCon.addChild(key.displayItem);
    key.start();
  });

  var startText = new DisplayText({
    text: 'Press any of these keys to start',
    font: '18px Arial',
    x: 0,
    y: 70,
    align: 'center',
    baseline: 'top',
    color: 'white'
  });
  tutorialKeyCon.addChild(startText);

  var keySets = [
    ['W', 'A', 'S', 'D'],
    ['↑', '←', '↓', '→'],
    ['Z', 'Q', 'S', 'D']
  ];
  var keySetIndex = 0;

  this.keySetInterval = setInterval(function () {
    keySetIndex += 1;
    if (keySetIndex >= keySets.length) {
      keySetIndex = 0;
    }
    tutorialKeys.forEach(function (key, index) {
      key.keyTopKey.text = keySets[keySetIndex][index];
    });
  }, 1000);

  var startKeys = [
    KB.keys.a, KB.keys.w, KB.keys.s, KB.keys.d,
    KB.keys.q, KB.keys.z,
    KB.keys.left, KB.keys.up, KB.keys.right, KB.keys.down
  ];

  this.kb = KB(function () {

  }, function (keyCode) {
    var start = startKeys.some(function (k) {
      return k === keyCode;
    });
    if (start) {
      this.main.setScene(new PlayScene(this.main));
    }
  }.bind(this));

  this.addSteppable(this.cycle.bind(this));
}

MainMenuScene.prototype = extendPrototype(Scene.prototype, {
  destroy: function () {
    this.tutorialKeys.forEach(function (key) {
      key.stop();
    });
    clearInterval(this.keySetInterval);
    this.kb.destroy();
  },
  cycle: function (dts) {
    this.time += dts;

    var current = this.time % this.period,
      ratio = current / this.period;
    
    this.robot.scaleX = 1 + Math.cos(ratio * Math.PI * 2) * 0.05;
    this.robot.scaleY = 1 + Math.sin(ratio * Math.PI * 2) * 0.05;
    this.scrollingBg.fillOffsetX -= 200 * dts;
  }
});

function PreloadScene() {
  Scene.apply(this, arguments);
  this.imgs = [];
  this.finished = false;
  this.progressText = new DisplayText({
    x: SETTINGS.width / 2,
    y: SETTINGS.height / 2,
    text: '0%',
    color: 'black',
    align: 'center',
    baseline: 'middle',
    font: '32px Arial'
  });

  // bg
  this.addChild(new DisplayRect({
    w: SETTINGS.width,
    h: SETTINGS.height,
    color: '#777777'
  }))
  this.addChild(this.progressText);
}
PreloadScene.prototype = extendPrototype(Scene.prototype, {
  create: function () {
    Object.entries(Resources.imgs).forEach(function (entry) {
      var img = new Image();
      img.onload = this.onImgLoad.bind(this);
      img.src = entry[1];
      this.imgs.push(img);
      Resources.loadedImgs[entry[0]] = img;
    }, this);
  },
  onImgLoad: function (e) { 
    if (this.finished) return;
    var loaded = this.imgs.reduce(function (imgsLoaded, img) {
      return (img.complete ? 1 : 0) + (imgsLoaded || 0);
    }, 0);

    this.progressText.text = Math.floor(loaded / this.imgs.length * 100) + '%';

    if (loaded >= this.imgs.length) {
      this.finish();
    }
  },
  finish: function () {
    if (this.finished) return;

    // create patterns
    Object.entries(Resources.patterns).forEach(function (entry) {
      Resources.loadedPatterns[entry[0]] = this.main.context.createPattern(
        Resources.loadedImgs[entry[0]],
        entry[1]
      );
    }, this);

    this.finished = true;
    this.main.setScene(new MainMenuScene(this.main));
  }
});

function Main(){
  this.step = this.step.bind(this);
  this.root = DOM.get('root');
  var canvas = DOM.create('canvas');
  canvas.width = SETTINGS.width;
  canvas.height = SETTINGS.height;
  this.root.appendChild(canvas);
  this.resources = Resources;
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.context.font = '16px Arial'; // global font
  this.animManager = new AnimManager();
  AnimManager.singleton = this.animManager;
  this.scene = new PreloadScene(this);
  this.time = 0;
  
  this.resize = this.resize.bind(this);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
  this.onWindowResize();
  
  this.step(0);
  this.scene.create();
}
Main.prototype = {
  onWindowResize: function () {
    this.resize();
    setTimeout(function () {
      this.resize();
    }.bind(this), 100);
  },
  resize: function () {
    var computedStyle = window.getComputedStyle(DOM.get('root')),
      viewWidth = parseInt(computedStyle.width, 10),
      viewHeight = parseInt(computedStyle.height, 10),
      canvasAspectRatio = this.canvas.width / this.canvas.height,
      viewAspectRatio = viewWidth / viewHeight,
      useWidth,
      useHeight;
    
    if (canvasAspectRatio > viewAspectRatio) {
      // canvas aspect ratio is wider than view's aspect ratio
      useWidth = viewWidth;
      useHeight = useWidth / canvasAspectRatio;
    } else {
      // canvas aspect ratio is taller than view's aspect ratio
      useHeight = viewHeight;
      useWidth = useHeight * canvasAspectRatio;
    }
    
    this.canvas.style.width = Math.floor(useWidth) + 'px';
    this.canvas.style.height = Math.floor(useHeight) + 'px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '50%';
    this.canvas.style.top = '50%';
    this.canvas.style.marginLeft = Math.floor(-useWidth / 2) + 'px';
    this.canvas.style.marginTop = Math.floor(-useHeight / 2) + 'px';
  },
  setScene: function (scene) {
    if (this.scene) {
      this.scene.destroy();
    }
    this.scene = scene;
    scene.create();
  },
  step: function (time) {
    var dts = (time - this.time) / 1000.0;
    if (dts > 0) {
      if (dts > 0.2) {
        dts = 0.2;
      }
      this.scene.step(dts);
      this.scene._render(this.context);
      this.animManager.step(dts);
      this.time = time;
    }
    requestAnimationFrame(this.step);
  }
};

window.game = new Main();
