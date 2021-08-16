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
  step: function (dts) {
    this.player.step(dts);
  }
});
