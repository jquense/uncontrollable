import invariant from 'invariant'

const noop = () => {}

function readOnlyPropType(handler, name) {
  return function(props, propName) {
    if (props[propName] !== undefined) {
      if (!props[handler]) {
        return new Error(
          `You have provided a \`${propName}\` prop to \`${name}\` ` +
            `without an \`${handler}\` handler prop. This will render a read-only field. ` +
            `If the field should be mutable use \`${defaultKey(propName)}\`. ` +
            `Otherwise, set \`${handler}\`.`
        )
      }
    }
  }
}

export function uncontrolledPropTypes(controlledValues, displayName) {
  let propTypes = {}

  Object.keys(controlledValues).forEach(prop => {
    // add default propTypes for folks that use runtime checks
    propTypes[defaultKey(prop)] = noop

    if (process.env.NODE_ENV !== 'production') {
      const handler = controlledValues[prop]
      invariant(
        typeof handler === 'string' && handler.trim().length,
        'Uncontrollable - [%s]: the prop `%s` needs a valid handler key name in order to make it uncontrollable',
        displayName,
        prop
      )

      propTypes[prop] = readOnlyPropType(handler, displayName)
    }
  })

  return propTypes
}

export function isProp(props, prop) {
  return props[prop] !== undefined
}

export function defaultKey(key) {
  return 'default' + key.charAt(0).toUpperCase() + key.substr(1)
}

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
export function canAcceptRef(component) {
  return (
    !!component &&
    (typeof component !== 'function' ||
      (component.prototype && component.prototype.isReactComponent))
  )
}
