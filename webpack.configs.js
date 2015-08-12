var webpack = require('webpack');

var loaders = [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ];


module.exports = {

  dev: {
    devtool: 'source-map',

    cache: true,

    entry: [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './dev/dev.jsx'
    ],

    output: {
      filename: 'bundle.js',
      path: __dirname
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],

    resolve: {
      extensions: ['', '.js', '.jsx']
    },

    module: {
      loaders: loadersWithHotModule(),
    }
  },

  test: {
    devtool: 'inline-source-map',
    cache: true,
    module: {
      loaders: loaders.concat(
        { test: /sinon-chai/, loader: "imports?define=>false" })
    }
  }
}

function loadersWithHotModule(){
  return loaders.reduce(function (current, next, idx){
      if(next.loader === 'babel-loader')
        current.push({ test: /\.jsx$|\.js$/, loader: 'react-hot-loader', exclude: /node_modules/ })

      return current.concat(next);
  }, [])
}