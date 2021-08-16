function Scene(main, settings) {
  DisplayContainer.call(this);
  this.main = main;
  this.settings = settings;
}
Scene.prototype = extendPrototype(DisplayContainer.prototype, {
  create: function () {},
  destroy: function () {},
  addSteppable: function (steppable) {
    this.steppables.push(steppable);
  },
  step: function (dts) {
  },
  _render: function (context) {
    // we don't need transformations
    this.render(context);
  }
});
