import React from 'react';
import invariant from 'react/lib/invariant';
import * as utils from './utils';

export default function createUncontrollable(mixins, set){

  return uncontrollable;

  function uncontrollable(Component, controlledValues) {
    var displayName = `Uncontrolled(${Component.displayName || Component.name || 'Component'})`
      , basePropTypes = utils.getType(Component).propTypes
      , propTypes = {}

    if (process.env.NODE_ENV !== 'production' && basePropTypes) {
      utils.transform(controlledValues, function(obj, handler, prop){
        var type = basePropTypes[prop];

        invariant(typeof handler === 'string' && handler.trim().length,
            'Uncontrollable - [%s]: the prop `%s` needs a valid handler key name in order to make it uncontrollable'
          , Component.displayName
          , prop)

        obj[prop] = utils.customPropType(handler, type, Component.displayName)

        if (type !== undefined )
          obj[utils.defaultKey(prop)] = type;

      }, propTypes);
    }

    let component = React.createClass({

      displayName,

      mixins,

      propTypes,

      componentWillMount() {
        var props = this.props
          , keys  = Object.keys(controlledValues);

        this._values = utils.transform(keys, function(values, key){
          values[key] = props[utils.defaultKey(key)]
        }, {})
      },

      render() {
        var newProps = {}
          , {
            valueLink
          , checkedLink
          , ...props} = this.props;

        utils.each(controlledValues, (handle, propName) => {
          var linkPropName = utils.getLinkName(propName)
            , prop = this.props[propName];

          if ( linkPropName && !isProp(this.props, propName) && isProp(this.props, linkPropName) ) {
            prop = this.props[linkPropName].value
          }

          newProps[propName] = prop !== undefined
            ? prop : this._values[propName]

          newProps[handle] = setAndNotify.bind(this, propName)
        })

        newProps = { ...props, ...newProps }

        return React.createElement(Component, newProps);
      }
    })

    component.ControlledComponent = Component

    return component

    function setAndNotify(propName, value, ...args){
      var linkName = utils.getLinkName(propName)
        , handler    = this.props[controlledValues[propName]];

      if ( linkName && isProp(this.props, linkName) && !handler ) {
        handler = this.props[linkName].requestChange
      }

      set(this, propName, handler, value, args)
    }

    function isProp(props, prop){
      return props[prop] !== undefined;
    }
  }
}
