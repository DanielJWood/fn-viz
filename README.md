## Using the repo

### Development

To start developing with this repository, run the following:

```
$ npm install
$ npm start
```

Then, visit localhost:3000 in your browser. You should see the page load.

### Building

To build the project into production-ready Javascript, run `npm run build`

After this, if you want to push to the gh-pages branch use the following command:

```
$ git add dist && git commit -m "Some commit message"
$ git subtree push --prefix dist origin gh-pages
```

### Credits

Some of the methods (appendselect most importantly) used here were cribbed from the Politico graphic's teams awesome [reusable charts session at NICAR18](https://github.com/The-Politico/nicar18-reusable-charts)