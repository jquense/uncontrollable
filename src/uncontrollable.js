import React from 'react'
import invariant from 'invariant'
import * as Utils from './utils'

export function uncontrollable(Component, controlledValues, methods = []) {
  let displayName = Component.displayName || Component.name || 'Component'
  let canAcceptRef = Utils.canAcceptRef(Component)

  let controlledProps = Object.keys(controlledValues)
  const PROPS_TO_OMIT = controlledProps.map(Utils.defaultKey)

  invariant(
    canAcceptRef || !methods.length,
    '[uncontrollable] stateless function components cannot pass through methods ' +
      'because they have no associated instances. Check component: ' +
      displayName +
      ', ' +
      'attempting to pass through methods: ' +
      methods.join(', ')
  )

  class UncontrolledComponent extends React.Component {
    constructor(...args) {
      super(...args)

      this.handlers = Object.create(null)

      controlledProps.forEach(propName => {
        const handlerName = controlledValues[propName]

        const handleChange = (value, ...args) => {
          if (this.props[handlerName]) {
            this._notifying = true
            this.props[handlerName](value, ...args)
            this._notifying = false
          }

          this._values[propName] = value
          if (!this.unmounted) this.forceUpdate()
        }
        this.handlers[handlerName] = handleChange
      })

      if (methods.length)
        this.attachRef = ref => {
          this.inner = ref
        }
    }

    shouldComponentUpdate() {
      //let the forceUpdate trigger the update
      return !this._notifying
    }

    componentWillMount() {
      let props = this.props

      this._values = Object.create(null)

      controlledProps.forEach(key => {
        this._values[key] = props[Utils.defaultKey(key)]
      })
    }

    componentWillReceiveProps(nextProps) {
      let props = this.props

      controlledProps.forEach(key => {
        /**
         * If a prop switches from controlled to Uncontrolled
         * reset its value to the defaultValue
         */
        if (!Utils.isProp(nextProps, key) && Utils.isProp(props, key)) {
          this._values[key] = nextProps[Utils.defaultKey(key)]
        }
      })
    }

    componentWillUnmount() {
      this.unmounted = true
    }

    render() {
      let { innerRef, ...props } = this.props

      PROPS_TO_OMIT.forEach(prop => {
        delete props[prop]
      })

      let newProps = {}
      controlledProps.forEach(propName => {
        let propValue = this.props[propName]
        newProps[propName] =
          propValue !== undefined ? propValue : this._values[propName]
      })

      return React.createElement(Component, {
        ...props,
        ...newProps,
        ...this.handlers,
        ref: innerRef || this.attachRef,
      })
    }
  }

  UncontrolledComponent.displayName = `Uncontrolled(${displayName})`

  UncontrolledComponent.propTypes = {
    innerRef: () => {},
    ...Utils.uncontrolledPropTypes(controlledValues, displayName),
  }

  methods.forEach(method => {
    UncontrolledComponent.prototype[method] = function $proxiedMethod(...args) {
      return this.inner[method](...args)
    }
  })

  let WrappedComponent = UncontrolledComponent

  if (React.forwardRef) {
    WrappedComponent = React.forwardRef((props, ref) => (
      <UncontrolledComponent {...props} innerRef={ref} />
    ))
    WrappedComponent.propTypes = UncontrolledComponent.propTypes
  }

  WrappedComponent.ControlledComponent = Component

  /**
   * useful when wrapping a Component and you want to control
   * everything
   */
  WrappedComponent.deferControlTo = (
    newComponent,
    additions = {},
    nextMethods
  ) => {
    return uncontrollable(
      newComponent,
      { ...controlledValues, ...additions },
      nextMethods
    )
  }

  return WrappedComponent
}
