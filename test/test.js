import PropTypes from 'prop-types'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from '@monastic.panic/enzyme-adapter-react-16'

import uncontrollable from '../src'

Enzyme.configure({ adapter: new Adapter() })

describe('uncontrollable', () => {
  var Base

  beforeEach(() => {
    Base = class extends React.Component {
      static propTypes = {
        value: PropTypes.number,
        checked: PropTypes.bool,
        onChange: PropTypes.func,

        open: PropTypes.bool,
        onToggle: PropTypes.func,

        onRender: PropTypes.func,
      }

      handleChange = val => {
        var target = this.input

        if (val) target.value = val

        this.props.onChange(val)
      }

      render() {
        if (this.props.onRender) this.props.onRender(this.props)

        const { value, checked } = this.props

        return (
          <div>
            <button onClick={this.props.onToggle}>toggle</button>
            {this.props.open && <span className="open">open!</span>}
            <input
              className="valueInput"
              ref={r => {
                this.input = r
              }}
              value={value == null ? '' : value}
              onChange={e => this.props.onChange(e.value)}
            />
            <input
              type="checkbox"
              checked={checked ? '' : null}
              value={value == null ? '' : value}
              onChange={e => this.props.onChange(e.checked)}
            />
          </div>
        )
      }

      foo(num) {
        return num + num
      }

      bar = () => {
        return 'value: ' + this.props.value
      }
    }
  })

  describe('uncontrollable', () => {
    it('should warn when handlers are missing', () => {
      var Control = uncontrollable(Base, { value: 'onChange' })

      expect(Control.propTypes.value({ value: 3 }, 'value').message).toContain(
        'You have provided a `value` prop to `Base` without an `onChange` ' +
          'handler prop. This will render a read-only field.'
      )
    })

    it('should include default PropTypes', () => {
      var Control = uncontrollable(Base, { value: 'onChange' })

      expect(Control.propTypes.defaultValue).not.toBeNull()
    })


    it('should adjust displayName', () => {
      var Control = uncontrollable(Base, { value: 'onChange' })

      expect(mount(<Control />).find('Uncontrolled(Base)')).toHaveLength(1)
    })

    it('should expose the original component', () => {
      var Control = uncontrollable(Base, { value: 'onChange' })

      expect(Control.ControlledComponent).toEqual(Base)
    })

    describe('without forwardRef()', () => {
      let forwardRef

      beforeEach(() => {
        forwardRef = React.forwardRef
        delete React.forwardRef
      })

      afterEach(() => {
        React.forwardRef = forwardRef
      })

      it('should forward methods', () => {
        var Control = uncontrollable(Base, { value: 'onChange' }, ['foo', 'bar'])

        let wrapper = mount(<Control value={5} onChange={() => {}} />)
        const instance = wrapper.instance()


        expect(instance.constructor.name).toBe('UncontrolledComponent')

        expect(typeof instance.foo).toBe('function')
        expect(typeof instance.bar).toBe('function')

        expect(instance.foo(10)).toEqual(20)
        expect(instance.bar()).toEqual('value: 5')
      })

      it('should pass through uncontrollables', () => {
        let Control = uncontrollable(Base, { value: 'onChange' }, ['foo'])
        let instance = mount(
          <Control defaultValue={10} defaultOpen />
        ).instance()

        expect(typeof instance.foo).toEqual('function')
        expect(instance.foo(2)).toEqual(4)
        expect(instance.inner).toEqual(expect.anything())
      })
      it('should work with stateless components', () => {
        jest.spyOn(console, 'error')

        var Control = uncontrollable(() => <span />, { value: 'onChange' })

        expect(
          mount(<Control defaultValue={10} defaultOpen />).instance().inner
        ).not.toEqual(expect.anything())

        expect(console.error).not.toHaveBeenCalled()
        console.error.mockRestore()
      })
    })

    it('should passthrough ref', () => {
      let Control = uncontrollable(Base, { value: 'onChange' })

      class Example extends React.Component {
        render() {
          return <Control ref="control" defaultValue={10} defaultOpen />
        }
      }

      expect(mount(<Example />).instance().refs.control instanceof Base).toEqual(
        true
      )
    })


    it('should compose ref with method passthrough', () => {
      let Control = uncontrollable(Base, { value: 'onChange' }, ['foo'])
      let ref = null

      class Example extends React.Component {
        render() {
          return <Control ref={r => (ref = r)} defaultValue={10} defaultOpen />
        }
      }

      mount(<Example />)

      expect(ref instanceof Base).toEqual(true)
    })

    it('should work with forwardRef components', () => {
      const OtherBase = React.forwardRef((props, ref) => <Base {...props} ref={ref} />)
      let Control = uncontrollable(OtherBase, { value: 'onChange' })
      let ref;
      class Example extends React.Component {
        render() {
          return <Control ref={r => ref =r} defaultValue={10} defaultOpen />
        }
      }
      mount(<Example />)

      expect(ref instanceof Base).toEqual(
        true
      )
    })

    it('should warn when passing through uncontrollables to stateless components', () => {
      expect(() => {
        uncontrollable(() => null, { value: 'onChange' }, ['foo'])
      }).toThrow(/stateless function components.+Component.+foo/g)
    })

    it('should track internally if not specified', () => {
      var Control = uncontrollable(Base, { value: 'onChange' })

      let inst = mount(<Control />)

      inst
        .find('input')
        .first()
        .simulate('change', { value: 42 })

      expect(inst.instance()._values.value).toEqual(42)
    })

    it('should allow for defaultProp', () => {
      let Control = uncontrollable(Base, {
        value: 'onChange',
        open: 'onToggle',
      })

      let inst = mount(<Control defaultValue={10} defaultOpen />)

      inst.find('.open').first()

      inst
        .find('input')
        .first()
        .tap(inst => expect(inst.getDOMNode().value).toEqual('10'))
        .simulate('change', { value: 42 })

      expect(inst.instance()._values.value).toEqual(42)
    })

    it('should not forward default props through', () => {
      let Control = uncontrollable(Base, {
        value: 'onChange',
        open: 'onToggle',
      })

      let inst = mount(<Control defaultValue={10} defaultOpen />)

      let props = inst.find(Base).props()

      expect(Object.keys(props)).not.toEqual(
        expect.arrayContaining(['defaultValue', 'defaultOpen'])
      )

      expect(Object.keys(props)).toEqual(
        expect.arrayContaining(['value', 'open'])
      )
    })

    it('should not throw when not batching', () => {
      let spy = jest.fn()

      let Control = uncontrollable(Base, {
        value: 'onChange',
        open: 'onToggle',
      })

      let inst = mount(<Control defaultValue={10} defaultOpen onChange={spy} />)
      let base = inst.find(Base).instance()

      inst.find('.open')

      expect(() => base.handleChange(42)).not.toThrow()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(inst.instance()._values.value).toEqual(42)
    })

    it('should update in the right order when controlled', () => {
      var Control = uncontrollable(Base, { value: 'onChange' }),
        spy = jest.fn()

      class Parent extends React.Component {
        state = { value: 5 }
        render() {
          return (
            <Control
              onRender={spy}
              value={this.state.value}
              onChange={value => this.setState({ value })}
            />
          )
        }
      }

      mount(<Parent />)
        .find('input')
        .first()
        .simulate('change', { value: 42 })

      expect(spy.mock.calls.length).toEqual(2)
      expect(spy.mock.calls[0][0].value).toEqual(5)
      expect(spy.mock.calls[1][0].value).toEqual(42)
    })

    it('should update in the right order', () => {
      var Control = uncontrollable(Base, { value: 'onChange' }),
        spy = jest.fn()

      class Parent extends React.Component {
        state = { value: 5 }
        render() {
          return <Control onRender={spy} defaultValue={this.state.value} />
        }
      }

      var inst = mount(<Parent />)

      inst
        .find('input')
        .first()
        .simulate('change', { value: 42 })

      expect(spy.mock.calls.length).toEqual(2)
      expect(spy.mock.calls[0][0].value).toEqual(5)
      expect(spy.mock.calls[1][0].value).toEqual(42)

      spy.mockReset()

      inst
        .find(Base)
        .instance()
        .handleChange(84)

      expect(spy.mock.calls.length).toEqual(1)
      expect(spy.mock.calls[0][0].value).toEqual(84)
    })
  })
})
