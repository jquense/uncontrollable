"use strict";
var babelHelpers = require("./util/babelHelpers.js");
var React = require("react");
var ReactUpdates = require("react/lib/ReactUpdates");
var invariant = require("react/lib/invariant");

function customPropType(handler, propType, name) {

  return function (props, propName, componentName, location) {

    if (props[propName] !== undefined) {
      if (!props[handler]) return new Error("You have provided a `" + propName + "` prop to " + "`" + name + "` without an `" + handler + "` handler. This will render a read-only field. " + "If the field should be mutable use `" + defaultKey(propName) + "`. Otherwise, set `" + handler + "`");

      return propType && propType(props, propName, name, location);
    }
  };
}

var version = React.version.split(".").map(parseFloat);

function getType(component) {
  if (version[0] === 0 && version[1] >= 13) return component;

  return component.type;
}

function getLinkName(name) {
  return name === "value" ? "valueLink" : name === "checked" ? "checkedLink" : null;
}

function forceUpdateIfMounted() {

  if (this.isMounted() && this._needsUpdate) {
    this._needsUpdate = false;
    this.forceUpdate();
  }
}

module.exports = function (Component, controlledValues) {
  var name = Component.displayName || Component.name || "Component",
      types = {};

  if (process.env.NODE_ENV !== "production" && getType(Component).propTypes) {
    types = transform(controlledValues, function (obj, handler, prop) {
      var type = getType(Component).propTypes[prop];

      invariant(typeof handler === "string" && handler.trim().length, "Uncontrollable - [%s]: the prop `%s` needs a valid handler key name in order to make it uncontrollable", Component.displayName, prop);

      obj[prop] = customPropType(handler, type, Component.displayName);
      if (type !== undefined) {
        obj[defaultKey(prop)] = type;
      }
    }, {});
  }

  name = name[0].toUpperCase() + name.substr(1);

  return React.createClass({

    displayName: "Uncontrolled" + name,

    propTypes: types,

    componentWillMount: function () {
      var _this = this;

      this.values = Object.create(null);

      var props = this.props,
          keys = Object.keys(controlledValues);

      return transform(keys, function (state, key) {
        _this.values[key] = props[defaultKey(key)];
      }, {});
    },

    componentWillReceiveProps: function (nextProps) {
      this._needsUpdate = false;
    },

    render: function () {
      var _this = this;

      var newProps = {};
      var _props = this.props;
      var valueLink = _props.valueLink;
      var checkedLink = _props.checkedLink;
      var props = babelHelpers.objectWithoutProperties(_props, ["valueLink", "checkedLink"]);

      each(controlledValues, function (handle, propName) {
        var linkPropName = getLinkName(propName),
            prop = _this.props[propName];

        if (linkPropName && !isProp(_this.props, propName) && isProp(_this.props, linkPropName)) {
          prop = _this.props[linkPropName].value;
        }

        newProps[propName] = prop !== undefined ? prop : _this.values[propName];

        newProps[handle] = setAndNotify.bind(_this, propName);
      });

      newProps = babelHelpers._extends({}, props, newProps);

      return React.createElement(Component, newProps);
    }
  });

  function setAndNotify(propName, value) {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var linkName = getLinkName(propName),
        handler = this.props[controlledValues[propName]];

    if (linkName && isProp(this.props, linkName) && !handler) {
      handler = this.props[linkName].requestChange;
    }

    this._needsUpdate = true;
    this.values[propName] = value;

    if (handler) handler.call.apply(handler, [this, value].concat(args));

    ReactUpdates.batchedUpdates(function () {
      ReactUpdates.asap(forceUpdateIfMounted, _this);
    });
  }

  function isProp(props, prop) {
    return props[prop] !== undefined;
  }
};

function defaultKey(key) {
  return "default" + key.charAt(0).toUpperCase() + key.substr(1);
}

function chain(thisArg, a, b) {
  return function chainedFunction() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    a && a.call.apply(a, [thisArg].concat(args));
    b && b.call.apply(b, [thisArg].concat(args));
  };
}

function transform(obj, cb, seed) {
  each(obj, cb.bind(null, seed = seed || (Array.isArray(obj) ? [] : {})));
  return seed;
}

function each(obj, cb, thisArg) {
  if (Array.isArray(obj)) return obj.forEach(cb, thisArg);

  for (var key in obj) if (has(obj, key)) cb.call(thisArg, obj[key], key, obj);
}

function has(o, k) {
  return o ? Object.prototype.hasOwnProperty.call(o, k) : false;
}