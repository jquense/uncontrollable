import ReactUpdates from 'react-dom/lib/ReactUpdates';
import createUncontrollable  from './createUncontrollable';


let mixin = {
  componentWillReceiveProps() {
    // if the update already happend then don't fire it twice
    this._needsUpdate = false;
  }
}

function set(component, propName, handler, value, args) {
  component._needsUpdate = true;
  component._values[propName] = value

  if (handler)
    handler.call(component, value, ...args)

  ReactUpdates.batchedUpdates(()=> {
    ReactUpdates.asap(() => {
      if (!component.unmounted && component._needsUpdate) {
        component._needsUpdate = false

        if (!component.unmounted)
          component.forceUpdate()
      }
    })
  })
}

export default createUncontrollable(mixin, set)
