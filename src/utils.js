import React from 'react';

export function customPropType(handler, propType, name) {

  return function(props, propName, componentName, location) {

    if(props[propName] !== undefined) {
      if ( !props[handler] )
        return new Error(
            'You have provided a `' + propName + '` prop to '
          + '`' + name + '` without an `' + handler + '` handler. This will render a read-only field. '
          + 'If the field should be mutable use `' + defaultKey(propName) + '`. Otherwise, set `' + handler + '`')

      return propType && propType(props, propName, name, location)
    }
  }
}

export let version = React.version.split('.').map(parseFloat);

export function getType(component){
  if( version[0] === 0 && version[1] >= 13)
    return component

  return component.type
}

export function getLinkName(name){
  return name === 'value'
    ? 'valueLink'
    : name === 'checked'
      ? 'checkedLink' : null
}


export function defaultKey(key){
  return 'default' + key.charAt(0).toUpperCase() + key.substr(1)
}

export function chain(thisArg, a, b){
  return function chainedFunction(...args){
    a && a.call(thisArg, ...args)
    b && b.call(thisArg, ...args)
  }
}

export function transform(obj, cb, seed){
  each(obj, cb.bind(null, seed = seed || (Array.isArray(obj) ? [] : {})))
  return seed
}

export function each(obj, cb, thisArg){
  if( Array.isArray(obj)) return obj.forEach(cb, thisArg)

  for(var key in obj) if(has(obj, key))
    cb.call(thisArg, obj[key], key, obj)
}

export function has(o, k){
  return o ? Object.prototype.hasOwnProperty.call(o, k) : false
}