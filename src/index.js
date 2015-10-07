import createUncontrollable  from './createUncontrollable';

let mixin = {
  shouldComponentUpdate() {
    //let the forceUpdate trigger the update
    return !this._notifying;
  }
}

function set(component, propName, handler, value, args) {
  if (handler) {
    component._notifying = true
    handler.call(component, value, ...args)
    component._notifying = false
  }

  component._values[propName] = value
  component.forceUpdate()
}

export default createUncontrollable([ mixin ], set)
