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
