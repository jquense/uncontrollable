import React from 'react';
import * as utils from './utils';

export default function createUncontrollable(mixins, set){

  return uncontrollable;

  function uncontrollable(Component, controlledValues, forwardMethods = []) {
    var displayName = Component.displayName || Component.name || 'Component'
      , basePropTypes = utils.getType(Component).propTypes
      , propTypes;

    propTypes = utils.uncontrolledPropTypes(controlledValues, basePropTypes, displayName)

    let methods = utils.transform(forwardMethods, (proto, method) => {
      proto[method] = function() {
        let controlled = this.refs.controlled;
        return controlled[method].apply(controlled, arguments)
      }
    }, {})

    let component = React.createClass({

      displayName: `Uncontrolled(${displayName})`,

      mixins,

      propTypes,

      ...methods,

      componentWillMount() {
        var props = this.props
          , keys  = Object.keys(controlledValues);

        this._values = utils.transform(keys, function(values, key){
          values[key] = props[utils.defaultKey(key)]
        }, {})
      },

      /**
       * If a prop switches from controlled to Uncontrolled
       * reset its value to the defaultValue
       */
      componentWillReceiveProps(nextProps){
        let props = this.props
          , keys  = Object.keys(controlledValues);

        keys.forEach(key => {
          if (utils.getValue(nextProps, key) === undefined
           && utils.getValue(props, key) !== undefined)
           {
             this._values[key] = nextProps[utils.defaultKey(key)]
           }
        })
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

          if (linkPropName && !isProp(this.props, propName) && isProp(this.props, linkPropName) ) {
            prop = this.props[linkPropName].value
          }

          newProps[propName] = prop !== undefined
            ? prop : this._values[propName]

          newProps[handle] = setAndNotify.bind(this, propName)
        })

        newProps = { ref: 'controlled', ...props, ...newProps }

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
