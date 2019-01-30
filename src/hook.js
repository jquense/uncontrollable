import { useState, useRef } from 'react'
import * as Utils from './utils'

export default function useUncontrolled(props, config) {
  return Object.keys(config).reduce((result, fieldName) => {
    const {
      [Utils.defaultKey(fieldName)]: defaultValue,
      [fieldName]: propsValue,
      ...rest
    } = result
    const handlerName = config[fieldName]
    const prevProps = useRef({})

    const [stateValue, setState] = useState(defaultValue)
    const isProp = Utils.isProp(props, fieldName)
    const wasProp = Utils.isProp(prevProps.current, fieldName)

    prevProps.current = props

    /**
     * If a prop switches from controlled to Uncontrolled
     * reset its value to the defaultValue
     */
    if (!isProp && wasProp) {
      return setState(defaultValue)
    }

    const handler = (value, ...args) => {
      if (props[handlerName]) {
        props[handlerName](value, ...args)
      }
      setState(value)
    }

    return {
      ...rest,
      [fieldName]: isProp ? propsValue : stateValue,
      [handlerName]: handler,
    }
  }, props)
}
