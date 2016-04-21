import React from 'react';
import invariant from 'invariant';

export function customPropType(handler, propType, name) {

  return function(props, propName) {

    if(props[propName] !== undefined) {
      if ( !props[handler] ){
        return new Error(
            'You have provided a `' + propName + '` prop to '
          + '`' + name + '` without an `' + handler + '` handler. This will render a read-only field. '
          + 'If the field should be mutable use `' + defaultKey(propName) + '`. Otherwise, set `' + handler + '`')
      }

      return propType && propType(props, propName, name)
    }
  }
}

export function uncontrolledPropTypes(controlledValues, basePropTypes, displayName) {
  let propTypes = {}

  if (process.env.NODE_ENV !== 'production' && basePropTypes) {
    transform(controlledValues, function(obj, handler, prop){
      var type = basePropTypes[prop];

      invariant(typeof handler === 'string' && handler.trim().length,
          'Uncontrollable - [%s]: the prop `%s` needs a valid handler key name in order to make it uncontrollable'
        , displayName
        , prop)

      obj[prop] = customPropType(handler, type, displayName)

      if (type !== undefined )
        obj[defaultKey(prop)] = type;

    }, propTypes);
  }

  return propTypes;
}

export let version = React.version.split('.').map(parseFloat);

export function getType(component){
  if( version[0] >= 15 || (version[0] === 0 && version[1] >= 13) )
    return component

  return component.type
}

export function getValue(props, name){
  var linkPropName = getLinkName(name);

  if (linkPropName && !isProp(props, name) && isProp(props, linkPropName))
    return props[linkPropName].value

  return props[name]
}

function isProp(props, prop){
  return props[prop] !== undefined;
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


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
export function isReactComponent(component) {
  return !!(
    component &&
    component.prototype &&
    component.prototype.isReactComponent
  );
}


export function has(o, k){
  return o ? Object.prototype.hasOwnProperty.call(o, k) : false
}
