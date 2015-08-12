var fs = require('fs')
var pkg = require('./package.json')

delete pkg.devDependencies

var base ={
  "name": "uncontrollable",
  "version": pkg.version,
  "description": "Wrap a controlled react component, to allow spcific prop/handler pairs to be uncontrolled",
  "author": {
    "name": "Jason Quense",
    "email": "monastic.panic@gmail.com"
  },
  "repository": "jquense/uncontrollable",
  "license": "MIT",
  "main": "index.js",
  "keywords": [
    "uncontrolled-component",
    "react-component",
    "input",
    "controlled",
    "uncontrolled",
    "form"
  ]
}

if (pkg.dependencies)
  base.dependencies = pkg.dependencies

if (pkg.dependencies)
  base.peerDependencies = pkg.peerDependencies

fs.writeFileSync('./lib/package.json', JSON.stringify(base, null, 2))
