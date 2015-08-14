
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var reload = require('reload');
var fs = require('fs');
var errorhandler = require('errorhandler');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var YAML = require('yamljs');

var app = express();

var rootDir = path.resolve(__dirname, '..');
var config = YAML.load(path.join(rootDir, 'config.yaml'));
var configEnv = config[config.env];

app.locals.rootDir = rootDir;
app.locals.isDev = configEnv.isDev;
app.locals.baseUrl = configEnv.baseUrl;

if (app.locals.isDev) {
	app.use(errorhandler());
	app.use(morgan('dev'));
}

app.set('views', path.join(app.locals.rootDir, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.locals.assetUrl = function (path) {
	return app.locals.baseUrl + '/assets' + path;
};

app.get('/', function index (req, res) {
  res.render('index', {
  	require_config: {
  		baseUrl: app.locals.assetUrl(''),
  		config: {
				main: {
					// main config goes here
				}
			},
			paths: {
				"angular": "bower_components/angular/angular",
				"angular-animate": "bower_components/angular-animate/angular-animate.min",
				"angular-bootstrap": "bower_components/angular-bootstrap/ui-bootstrap-tpls.min",
				"angular-toggle-switch": "bower_components/angular-toggle-switch/angular-toggle-switch.min",
				"angular-sanitize": "bower_components/angular-sanitize/angular-sanitize.min",
				"angular-ui-router": "bower_components/angular-ui-router/release/angular-ui-router.min",
				"lodash": "bower_components/lodash/lodash.min",
				"ngstorage": "bower_components/ngstorage/ngStorage.min",
				"ngtoast": "bower_components/ngtoast/dist/ngToast.min"
			},
			"shim": {
				"angular": {"exports": "angular"},
				"angular-animate": {"deps": ["angular"]},
				"angular-bootstrap": {"deps": ["angular"]},
				"angular-sanitize": {"deps": ["angular"]},
				"angular-ui-router": {"deps": ["angular"]},
				"ngtoast": {"deps": ["angular-animate", "angular-sanitize"]},
				"ngstorage": {"deps": ["angular"]}
			}
  	}
  });
});
app.get('/templates/:name', function (req, res) {
	var name = req.params.name;
	var parts = name.split('.');
	if (parts[parts.length-1] == 'html')
		parts.pop();
	parts.unshift('templates');
	res.render(parts.join('/'), {}, function (err, html) {
		if (err) {
			console.log(err);
			return res.sendStatus(404);
		}
		res.send(html);
	});
});

var server = http.createServer(app);
if (app.locals.isDev) { reload(server, app, 800); }

var listenAddr = configEnv.listen
var isUnixSocket = typeof(listenAddr) == 'string' && listenAddr.startsWith('/');
if (isUnixSocket) {
	fs.stat(listenAddr, function (err) {
		if (!err) { fs.unlinkSync(listenAddr); }
		fs.mkdir(path.dirname(listenAddr), function (err) {
			if (err && err.code != 'EEXIST') throw err;
			server.listen(listenAddr, function () {
				fs.chmod(listenAddr, 0777, function (err) {
					if (err) throw err;
					console.log('Express server listening on socket ' + listenAddr);
				});
			});
		})
	});
} else {
	server.listen(listenAddr, function () {
		console.log('Express server listening on port ' + listenAddr);
	});
}
