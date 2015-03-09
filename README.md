# uncontrollable

Wrap a controlled react component, to allow spcific prop/handler pairs to be uncontrolled. Uncontrollable allows you to write pure react components, with minimal state, and then wrap them in a component that will manage state for prop/handlers if they are excluded.

## Install

```sh
npm i -S uncontrollable
```


### use

Take the following simple component and essentially mimic how React inputs already work.

```js
var MyInput = React.createClass({

  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func,
  },

  render: function() {
    return (
        <input 
          type='text' 
          value={this.props.value} 
          onChange={ e => this.props.onChange(e.target.value)}/>
    )
  }
});
```

It will be effectively Readonly if you neglect to include an `onChange` handler. What about if you only want to set a initial value and then let the input manage the value prop itself? React inputs do this for you automatically with `value` and `onChange`, but if you are creating slightly more complex inputs you may have other prop pairs you wish to leave to the consumer to handler. 

Uncontrollable allows you serperate out the logic necessary to create controlled/uncontrolled inputs letting you focus on creating a completely controlled input and wrapping it later. This tends to be a lot simplier to reason about as well.

```js
    var uncontrollable =  require('uncontrollable');

    var UncontrollableMyInput = uncontrollable(
        MyInput, 
        /* define the pairs ->*/ 
        { value: 'onChange' })

    <UncontrollableMyInput defaultValue={4} /> // this will just work!
```

The above is a contrived example but it allows you to wrap even more complex Components, giving you a lot of flexibiltity in the API you can offer a consumer of your Component. 

[React Widgets](https://github.com/jquense/react-widgets) makes heavy use of this strategy, you can see it in action here: https://github.com/jquense/react-widgets/blob/master/src/Multiselect.jsx#L408