'use strict';
var React = require('react')
var invariant = require('react/lib/invariant')

function customPropType(handler, propType) {

  return function(props, propName, componentName, location) {

    if(props[propName] !== undefined) {
      if ( !props[handler] )
        return new Error(
            'You have provided a `' + propName + '` prop to ' 
          + '`' + componentName + '` without an `' + handler + '` handler. This will render a read-only field. ' 
          + 'If the field should be mutable use `' + defaultKey(propName) + '`. Otherwise, set `' + handler + '`')

      return propType && propType(props, propName, componentName, location)
    }
  }
}

var version = React.version.split('.').map(parseFloat);

function getType(component){
  if( version[0] === 0 && version[1] >= 13)
    return component

  return component.type
}

function getLinkName(name){
  return name === 'value' 
    ? 'valueLink' 
    : name === 'checked' 
      ? 'checkedLink' : null
}

module.exports = function(Component, controlledValues, taps) {
    var types = {}

    if ( process.env.NODE_ENV !== 'production' && getType(Component).propTypes ) {
      types = transform(controlledValues, function(obj, handler, prop){
            var type = getType(Component).propTypes[prop];

            invariant(typeof handler === 'string' && handler.trim().length,
                'Uncontrollable - [%s]: the prop `%s` needs a valid handler key name in order to make it uncontrollable'
              , Component.displayName
              , prop)

            obj[prop] = customPropType(handler, type)
            if(type !== undefined ) {
              obj[defaultKey(prop)] = type;
            }
          }, {});
    }

    taps = taps || {}

    return React.createClass({

      displayName: Component.displayName,

      propTypes: types,

      getInitialState() {
        var props = this.props
          , keys  = Object.keys(controlledValues);

        return transform(keys, function(state, key){
          state[key] = props[defaultKey(key)]
        }, {})
      },

      shouldComponentUpdate() {
        //let the setState trigger the update
        return !this._notifying;
      },

      render() {
        var newProps = {}
          , { 
            valueLink
          , checkedLink
          , ...props} = this.props;

        each(controlledValues, (handle, propName) => {
          var linkPropName = getLinkName(propName)
            , prop = this.props[propName];

          if ( linkPropName && !isProp(this.props, propName) && isProp(this.props, linkPropName) ) {
            prop = this.props[linkPropName].value
          }

          newProps[propName] = prop !== undefined 
            ? prop 
            : this.state[propName] 

          newProps[handle] = setAndNotify.bind(this, propName)
        })

        newProps = { ...props, ...newProps }

        //console.log('props: ', newProps)
        each(taps, (val, key) => 
          newProps[key] = chain(this, val, newProps[key]))
          
        return React.createElement(Component, newProps);
      }
    })

    function setAndNotify(propName, value, ...args){
      var linkName = getLinkName(propName)
        , handler    = this.props[controlledValues[propName]];
        //, controlled = handler && isProp(this.props, propName);

      if ( linkName && isProp(this.props, linkName) && !handler ) {
        handler = this.props[linkName].requestChange
        //propName = propName === 'valueLink' ? 'value' : 'checked'
      }

      if( handler ) {
        this._notifying = true
        handler.call(this, value, ...args)
        this._notifying = false
      }
        
      this.setState({ [propName]: value })

      //return !controlled
    }

    function isProp(props, prop){
      return props[prop] !== undefined;
    }
  }


function defaultKey(key){
  return 'default' + key.charAt(0).toUpperCase() + key.substr(1)
}

function chain(thisArg, a, b){
  return function chainedFunction(...args){
    a && a.call(thisArg, ...args)
    b && b.call(thisArg, ...args)
  }
}

function transform(obj, cb, seed){
  each(obj, cb.bind(null, seed = seed || (Array.isArray(obj) ? [] : {})))
  return seed
}

function each(obj, cb, thisArg){
  if( Array.isArray(obj)) return obj.forEach(cb, thisArg)

  for(var key in obj) if(has(obj, key)) 
    cb.call(thisArg, obj[key], key, obj)
}

function has(o, k){
  return o ? Object.prototype.hasOwnProperty.call(o, k) : false
}