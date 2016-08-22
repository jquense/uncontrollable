import React from 'react';
import tsp from 'teaspoon';
import ReactDom, { findDOMNode } from 'react-dom';
import uncontrol from '../src';
import batching from '../src/batching';

describe('uncontrollable', () => {
  var Base;

  beforeEach(() => {
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
        var target = findDOMNode(this.refs.input)

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
      },

      foo(num){
        return num + num;
      },

      bar(){
        return 'value: ' + this.props.value
      }

    })
  })

  describe('common behavior', () => {
    var obj = {
      'classic': uncontrol,
      'batching': batching
    }

    Object.keys(obj).forEach(type => {
      var method = obj[type];

      describe(type, () => {

        it('should warn when handlers are missing', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.propTypes.value({ value: 3 }, 'value')
            .message.should.contain(
              'You have provided a `value` prop to `Base` without an `onChange` ' +
              'handler. This will render a read-only field.')
        })

        it('should work with valueLink', () => {
          var requestChange = sinon.spy()
            , Control  = method(Base, { value: 'onChange' })

          tsp(<Control valueLink={{ value: 10, requestChange }} />)
            .render()
            .first('input')
            .tap(inst => inst.dom().value.should.equal('10'))
            .trigger('change', { value: 42 })

          requestChange.should.have.been.calledOnce.and.calledWith(42)
        })

        it('should work with checkedLink', () => {
          var requestChange = sinon.spy()
            , Control  = method(Base, { checked: 'onChange' })

          tsp(<Control checkedLink={{ value: false, requestChange }} />)
            .render()
            .single('input[type=checkbox]')
            .tap(inst => inst.dom().checked.should.equal(false))
            .trigger('change', { checked: true })

            requestChange.should.have.been.calledOnce.and.calledWith(true)
        })

        it('should forward methods', () => {
          var Control  = method(Base, { value: 'onChange' }, ['foo', 'bar'])

          let instance = tsp(<Control value={5} onChange={()=>{}}/>)
            .render()
            .unwrap()

          expect(instance.foo).to.be.a('function')
          expect(instance.bar).to.be.a('function')

          expect(instance.foo(10)).to.be.equal(20)
          expect(instance.bar()).to.be.equal('value: 5')
        })

        it('should adjust displayName', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.displayName.should.equal('Uncontrolled(Base)')
        })

        it('should expose the original component', () => {
          var Control  = method(Base, { value: 'onChange' })

          Control.ControlledComponent.should.equal(Base)
        })

        it('should expose the original instance', () => {
          var Control  = method(Base, { value: 'onChange' })

          expect(
            tsp(<Control defaultValue={10} defaultOpen />)
              .render()
              .unwrap()
              .getControlledInstance()
          ).to.exist;
        })

        it('should work with stateless components', () => {
          sinon.spy(console, 'error')

          var Control  = method(() => <span />, { value: 'onChange' })

          expect(
            tsp(<Control defaultValue={10} defaultOpen />)
              .render()
              .unwrap()
              .refs.inner
          ).to.not.exist;

          console.error.should.not.have.been.called;
          console.error.restore();
        })

        it('should pass through methods', () => {
          var Control  = method(Base, { value: 'onChange' }, ['foo'])
            , instance = tsp(<Control defaultValue={10} defaultOpen />).render().unwrap();

          instance.foo.should.be.a('function')
          instance.foo(2).should.equal(4)
          instance.refs.inner.should.exist
        })

        it('should warn when passing through methods to stateless components', () => {
          (function () {
            method(() => null, { value: 'onChange' }, [ 'foo'])
          })
          .should.throw(/stateless function components.+Component.+foo/g)
        })

        it('should track internally if not specified', () => {
          var Control  = method(Base, { value: 'onChange' })

          let inst = tsp(<Control />).render()

          inst
            .first('input')
            .trigger('change', { value: 42 })

          inst.unwrap()._values.should.have.property('value').that.equals(42)
        })

        it('should allow for defaultProp', () => {
          let Control  = method(Base, { value: 'onChange', open: 'onToggle' })

          let inst = tsp(<Control defaultValue={10} defaultOpen />).render();

          inst.any('.open')

          inst
            .first('input')
            .tap(inst => inst.dom().value.should.equal('10'))
            .trigger('change', { value: 42 })

          expect(inst.unwrap()._values.value).to.equal(42);
        })

        it('should not forward default props through', () => {
          let Control  = method(Base, { value: 'onChange', open: 'onToggle' })

          let inst = tsp(<Control defaultValue={10} defaultOpen />).render();

          let props = inst
            .find(Base)
            .props()

          props.should.not.contain.keys(['defaultValue', 'defaultOpen'])

          props.should.contain.keys(['value', 'open'])
        })

        it('should not throw when not batching', () => {
          let spy = sinon.spy();

          let Control  = method(Base, { value: 'onChange', open: 'onToggle' })

          let inst = tsp(<Control defaultValue={10} defaultOpen onChange={spy} />).render();
          let base = inst.find(Base).unwrap();

          inst.any('.open')

          expect(() => base.nonBatchingChange(42)).not.to.throw()

          spy.should.have.been.calledOnce

          expect(inst.unwrap()._values.value).to.equal(42)
        })

        it('should update in the right order when controlled', () => {
          var Control = method(Base, { value: 'onChange' })
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

          tsp(<Parent/>)
            .render()
            .first('input')
            .trigger('change', { value: 42 })

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
                  onRender={spy}
                  defaultValue={this.state.value}
                />
              )
            }
          })

          var inst = tsp(<Parent/>).render()

          inst
            .first('input')
            .trigger('change', { value: 42 })

          spy.callCount.should.equal(2)
          spy.firstCall.args[0].value.should.equal(5)
          spy.secondCall.args[0].value.should.equal(42)

          spy.reset();

          inst.find(Base).unwrap().nonBatchingChange(84);

          spy.callCount.should.equal(1)
          spy.firstCall.args[0].value.should.equal(84)
        })
      })
    })
  })

  describe('batching specific behavior', () => {
    class Layer {

      constructor(container, render){
        this._container = container
        this._render = render
      }

      render(cb){
        if (!this._mountPoint)
          this._createMountPoint();

        var child = this._render()

        return ReactDom.render(child, this._mountPoint, cb);
      }

      unmount() {
        if(!this._mountPoint) return

        ReactDom.unmountComponentAtNode(this._mountPoint);
      }

      destroy() {
        this.unmount()

        if (this._mountPoint){
          this._container.removeChild(this._mountPoint)
          this._mountPoint = null;
        }
      }

      _createMountPoint() {
        this._mountPoint = document.createElement('div');
        this._container.appendChild(this._mountPoint);
      }
    }

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
            this._layer = new Layer(document.body, () => this._child)

          this.layerInstance = this._layer.render()
        },

        render(){
          this._child = (
            <Control
              onRender={spy}
              value={this.state.value}
              onChange={value => this.setState({ value, called: true })}
            />
          )

          return <div/>
        }
      })

      let layer = tsp(<Parent/>).render().unwrap();
      let inst = tsp(layer.layerInstance)

      inst
        .first('input')
        .trigger('change', { value: 42 })

      spy.callCount.should.equal(2)
      spy.firstCall.args[0].value.should.equal(5)
      spy.secondCall.args[0].value.should.equal(42)

      spy.reset();

      inst.find(Base).unwrap().nonBatchingChange(84);

      spy.callCount.should.equal(1)
      spy.firstCall.args[0].value.should.equal(84)
    })
  })
})
