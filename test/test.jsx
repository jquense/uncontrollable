'use strict';
var React = require('react/addons')
var uncontrol = require('../src/uncontrollable')

var TestUtils = React.addons.TestUtils
  , render = TestUtils.renderIntoDocument
  , findTag = TestUtils.findRenderedDOMComponentWithTag
  , findClass = TestUtils.findRenderedDOMComponentWithClass
  , findAllTag = TestUtils.scryRenderedDOMComponentsWithTag
  , findAllClass = TestUtils.scryRenderedDOMComponentsWithClass
  , findType = TestUtils.findRenderedComponentWithType
  , findAllType = TestUtils.scryRenderedComponentWithType
  , trigger = TestUtils.Simulate;

describe('uncontrollable', () =>{
  var Base;

  beforeEach(()=> {
    Base = React.createClass({

      propTypes: {
        value:    React.PropTypes.number,
        checked:  React.PropTypes.bool,
        onChange: React.PropTypes.func,

        open:     React.PropTypes.bool,
        onToggle: React.PropTypes.func,
      },

      render() {
        return (
          <div>
            <button onClick={this.props.onToggle}>toggle</button>
            { this.props.open && 
              <span className='open'>open!</span>
            }
            <input className='valueInput'
              value={this.props.value} 
              onChange={ e => this.props.onChange(e.value)}/>
            <input type='checkbox'
              value={this.props.value}
              checked={this.props.checked}
              onChange={ e => this.props.onChange(e.checked)}/>
          </div>)
      }
    })
  })

  it('should warn when handlers are missing', () => {
    var warn = sinon.stub(console, 'warn', msg =>{})
      , Control  = uncontrol(Base, { value: 'onChange' })
      , instance = render(<Control value={3}/>)
    
      warn.should.have.been.CalledOnce;

      warn.args[0][0].should.contain(
        'You have provided a `value` prop to `Base` without an `onChange` ' +
        'handler. This will render a read-only field.')

      warn.restore()
  })

  it('should work with valueLink', () => {
    var changeSpy = sinon.spy()
      , Control  = uncontrol(Base, { value: 'onChange' })
      , instance = render(<Control valueLink={{ value: 10, requestChange: changeSpy }} />)
      , input = findAllTag(instance, 'input')[0]
    
    input.getDOMNode().value.should.equal('10')

    trigger.change(input.getDOMNode(), { value: 42 })

    changeSpy.should.have.been.calledOnce.and.calledWith(42)
  })

  it('should work with checkedLink', () => {
    var changeSpy = sinon.spy()
      , Control  = uncontrol(Base, { checked: 'onChange' })
      , instance = render(<Control checkedLink={{ value: false, requestChange: changeSpy }} />)
      , input = findAllTag(instance, 'input')[1]
    
    input.getDOMNode().checked.should.equal(false)

    trigger.change(input.getDOMNode(), { checked: true })

    changeSpy.should.have.been.calledOnce.and.calledWith(true)
  })

  it('should create defaultProp propTypes', () => {
    var Control  = uncontrol(Base, { value: 'onChange' })

    Control.displayName.should.equal('UncontrolledBase')
  })

  it('should adjust displayName', () => {
    var Control  = uncontrol(Base, { value: 'onChange' })

    Control.propTypes.should.have.property('defaultValue')
      .that.equals(Base.propTypes.value)
  })


  it('should track state if no specified', () => {
    var Control  = uncontrol(Base, { value: 'onChange' })
      , instance = render(<Control />)
      , input = findAllTag(instance, 'input')[0]
    
    trigger.change(input.getDOMNode(), { value: 42})

    instance.state.should.have.property('value')
      .that.equals(42)
  })

  it('should allow for defaultProp', () => {
    var Control  = uncontrol(Base, { value: 'onChange', open: 'onToggle' })
      , instance = render(<Control defaultValue={10} defaultOpen />)
      , input = findAllTag(instance, 'input')[0]
      , span = findClass(instance, 'open')
    
    input.getDOMNode().value.should.equal('10')

    trigger.change(input.getDOMNode(), { value: 42})

    instance.state.value.should.equal(42)
  })

  describe('taps', () => {

    it('should call the tap function before the handler', ()=> {
      var tap = sinon.spy()
        , onChange = sinon.spy()
        , Control  = uncontrol(Base, { value: 'onChange' }, { 'onChange': tap })
        , instance = render(<Control defaultValue={10} onChange={onChange}/>)
        , input = findAllTag(instance, 'input')[0];

      trigger.change(input.getDOMNode(), { value: 42 })

      tap.should.have.been.CalledOnce
      tap.should.have.been.calledBefore(onChange)
      onChange.should.have.been.CalledOnce
    })

    it('should call the tap function this `this` as the wrapping component', ()=> {
      var tap = sinon.spy(function(){ this.should.equal(instance) })
        , Control  = uncontrol(Base, { value: 'onChange' }, { 'onChange': tap })
        , instance = render(<Control defaultValue={10}/>)
        , input = findAllTag(instance, 'input')[0];

      trigger.change(input.getDOMNode(), { value: 42 })

      tap.should.have.been.CalledOnce
    })
  })
})

