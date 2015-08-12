import React from 'react/addons';
import uncontrol from '../src';
import batching from '../src/batching';
import Layer from 'react-layer';

var TestUtils = React.addons.TestUtils
  , render = TestUtils.renderIntoDocument
  , findClass = TestUtils.findRenderedDOMComponentWithClass
  , findAllTag = TestUtils.scryRenderedDOMComponentsWithTag
  , findType = TestUtils.findRenderedComponentWithType
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

        onRender: React.PropTypes.func
      },

      nonBatchingChange(val){
        var target = this.refs.input.getDOMNode()

        if (val) target.value = val

        this.props.onChange(val)
      },

      render() {
        if ( this.props.onRender )
          this.props.onRender(this.props)

        return (
          <div>
            <button onClick={this.props.onToggle}>toggle</button>
            { this.props.open &&
              <span className='open'>open!</span>
            }
            <input className='valueInput'
              ref='input'
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

  describe('common behavior', ()=>{
    var obj = {
      'classic': uncontrol,
      'batching': batching,
    }

    Object.keys(obj).forEach(type => {
      var method = obj[type];

      describe(type, ()=> {

        it('should warn when handlers are missing', () => {
          var warn = sinon.stub(console, 'warn', msg =>{})
            , Control  = method(Base, { value: 'onChange' })
            , instance = render(<Control value={3}/>)

            warn.should.have.been.CalledOnce;

            warn.args[0][0].should.contain(
              'You have provided a `value` prop to `Base` without an `onChange` ' +
              'handler. This will render a read-only field.')

            warn.restore()
        })

        it('should work with valueLink', () => {
          var changeSpy = sinon.spy()
            , Control  = method(Base, { value: 'onChange' })
            , instance = render(<Control valueLink={{ value: 10, requestChange: changeSpy }} />)
            , input = findAllTag(instance, 'input')[0]

          input.getDOMNode().value.should.equal('10')

          trigger.change(input.getDOMNode(), { value: 42 })

          changeSpy.should.have.been.calledOnce.and.calledWith(42)
        })

        it('should work with checkedLink', () => {
          var changeSpy = sinon.spy()
            , Control  = method(Base, { checked: 'onChange' })
            , instance = render(<Control checkedLink={{ value: false, requestChange: changeSpy }} />)
            , input = findAllTag(instance, 'input')[1]

          input.getDOMNode().checked.should.equal(false)

          trigger.change(input.getDOMNode(), { checked: true })

          changeSpy.should.have.been.calledOnce.and.calledWith(true)
        })

        it('should create defaultProp propTypes', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.propTypes.should.have.property('defaultValue')
            .that.equals(Base.propTypes.value)
        })

        it('should adjust displayName', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.displayName.should.equal('Uncontrolled(Base)')
        })

        it('should expose the original component', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.ControlledComponent.should.equal(Base)
        })

        it('should track internally if not specified', () => {
          var Control  = method(Base, { value: 'onChange' })
            , instance = render(<Control />)
            , input = findAllTag(instance, 'input')[0]

          trigger.change(input.getDOMNode(), { value: 42})

          expect(instance._values).to.have.property('value')
            .that.equals(42)
        })

        it('should allow for defaultProp', () => {
          var Control  = method(Base, { value: 'onChange', open: 'onToggle' })
            , instance = render(<Control defaultValue={10} defaultOpen />)
            , input = findAllTag(instance, 'input')[0]
            , span = findClass(instance, 'open')

          input.getDOMNode().value.should.equal('10')

          trigger.change(input.getDOMNode(), { value: 42})

          expect(instance._values.value).to.equal(42)
        })

        it('should not throw when not batching', () => {
          var spy = sinon.spy();

          var Control  = method(Base, { value: 'onChange', open: 'onToggle' })
            , instance = render(<Control defaultValue={10} defaultOpen onChange={spy} />)
            , base = findType(instance, Base)
            , span = findClass(instance, 'open')

          expect(()=>
            base.nonBatchingChange(42)).not.to.throw()

          spy.should.have.been.calledOnce

          expect(instance._values.value).to.equal(42)
        })

        it('should update in the right order when controlled', () => {
          var Control  = method(Base, { value: 'onChange' })
            , spy = sinon.spy();

          var Parent = React.createClass({
            getInitialState(){ return { value: 5 } },
            render(){

              return (
                <Control
                  onRender={spy}
                  value={this.state.value}
                  onChange={value => this.setState({ value })}
                />
              )
            }
          })

          var instance = render(<Parent/>)
            , input = findAllTag(instance, 'input')[0]

          trigger.change(input.getDOMNode(), { value: 42 })

          spy.callCount.should.equal(2)
          spy.firstCall.args[0].value.should.equal(5)
          spy.secondCall.args[0].value.should.equal(42)
        })

        it('should update in the right order', () => {
          var Control  = method(Base, { value: 'onChange' })
            , spy = sinon.spy();

          var Parent = React.createClass({
            getInitialState(){ return { value: 5 } },
            render(){

              return (
                <Control
                  ref='ctrl'
                  onRender={spy}
                  defaultValue={this.state.value}
                />
              )
            }
          })

          var instance = render(<Parent/>)
            , input = findAllTag(instance, 'input')[0]

          trigger.change(input.getDOMNode(), { value: 42 })

          spy.callCount.should.equal(2)
          spy.firstCall.args[0].value.should.equal(5)
          spy.secondCall.args[0].value.should.equal(42)

          spy.reset();

          findType(instance.refs.ctrl, Base).nonBatchingChange(84);

          spy.callCount.should.equal(1)
          spy.firstCall.args[0].value.should.equal(84)
        })
      })
    })
  })

  describe('batching specific behavior', ()=>{

    it('should update correctly in a Layer', () => {
      var Control  = batching(Base, { value: 'onChange' })
        , spy = sinon.spy();

      var Parent = React.createClass({
        getInitialState(){ return { value: 5 } },

        componentWillUnmount () {
          this._layer.destroy()
          this._layer = null
        },
        componentDidUpdate(){this._renderOverlay()},
        componentDidMount() {this._renderOverlay()},
        _renderOverlay() {
          if (!this._layer)
            this._layer = new Layer(document.body, ()=> this._child)

          this.layerInstance = this._layer.render()
        },

        render(){
          this._child = (
            <Control ref='ctrl'
              onRender={spy}
              value={this.state.value}
              onChange={value => this.setState({ value, called: true })}
            />
          )

          return (
            <div/>
          )
        }
      })

      var instance = render(<Parent/>)
        , input = findAllTag(instance.layerInstance, 'input')[0]

      trigger.change(input.getDOMNode(), { value: 42 })

      spy.callCount.should.equal(2)
      spy.firstCall.args[0].value.should.equal(5)
      spy.secondCall.args[0].value.should.equal(42)

      spy.reset();

      findType(instance.refs.ctrl, Base).nonBatchingChange(84);

      spy.callCount.should.equal(1)
      spy.firstCall.args[0].value.should.equal(84)
    })

  })
})
