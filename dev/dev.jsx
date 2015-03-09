'use strict';
var React = require('react');
var uncontrolledInput = require('../src/uncontrollable')

var App = React.createClass({

  render: function() {
    var Simple = uncontrolledInput(Component, { value: 'onChange' })

    var WithTaps = uncontrolledInput(Component, { value: 'onChange' }, { 
      onChange: function(){
        this.setState({ label: 'hello'})
      }
    })

    return (<div>
      <Simple defaultValue={4} label='hi'/>

      <WithTaps defaultValue={4} />

    </div>);
  }

});

var Component = React.createClass({

  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func,
  },

  render: function() {
    return (
      <div>
        <input 
          type='text' 
          value={this.props.value} 
          onChange={ e => this.props.onChange(e.target.value)}/>
        <span>{this.props.label}</span>
      </div>
    )
  }

});


React.render(<App />, document.body);