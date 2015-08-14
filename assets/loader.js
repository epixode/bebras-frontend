// --- start of loader configuration ---
// This part of the loader is meant to be generated and concatenated
// to the code part below.
requirejs.config({
	// baseUrl is the root path for module lookup
	baseUrl: "http://castor.home.epixode.fr:3000",
	// path mapping for module names not found under baseUrl
	paths: {
		// Verified AMD-style modules
		"json": [
			"assets/bower_components/json3/lib/json3.min",
			"https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min"
		],
		"lodash": [
			"assets/bower_components/lodash/lodash.min",
			"https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min"
		],
		"jquery": [
			"assets/bower_components/jquery1/dist/jquery.min",
			"https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min"
		],
		"jqueryui": [
			"assets/bower_components/jquery-ui/jquery-ui.min",
			"https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min"
		],
		"jquery-deparam": [
			"assets/bower_components/jquery-deparam/jquery-deparam"
		],
		"beav": [
			"assets/bower_components/beav/beav"
		],
		"miniPlatform": [
			"assets/bower_components/miniPlatform/miniPlatform"
		],
		"platform-pr": [
			"assets/bower_components/platform-pr/platform-pr"
		],
		"beaver-task": [
			"assets/bower_components/beaver-task/beaver-task"
		],
		"display-helper": [
			"assets/bower_components/display-helper/displayHelper"
		],
		// Need a shim with a string exports
		"raphael": [
			"assets/bower_components/raphael/raphael-min",
			"https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.4/raphael-min"
		],
		"jquery.ui.touch-punch": [
			"assets/bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min",
			"https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min"
		],
		"jquery-postmessage": [
			"assets/bower_components/jquery-postmessage/jquery.ba-postmessage.min"
		]
	},
	shim: {
		"raphael": {exports: 'R'},
		"jquery.ui.touch-punch": {deps: ['jqueryui'], exports: '$.ui.touchPunch'},
		"jquery-postmessage": {deps: ['jquery'], exports: '$.postMessage'}
	},
	// /!\ Every module must call define() or have a shim with a string exports.
	enforceDefine: true,
	// number of seconds to wait before giving up on loading a script.
	waitSeconds: 10,
	config: {
		loader: {}
	}
});
// --- end of loader configuration ---
// --- start of module registry ---
define('Registry', [], function () {
	var Registry = {};
	var moduleSpecs = {};
	Registry.define = function (name, spec) {
		moduleSpecs[name] = spec;
	};
	Registry.use = function (name, callback, loader) {
		if (!(name in moduleSpecs))
			return callback('no such module: ' + name);
		// Load the JS module dependencies, and pass them as extra arguments to
		// the module's load function.
		var moduleSpec = moduleSpecs[name];
		require(moduleSpec.require || [], function () {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(callback);
			moduleSpec.load.apply(loader, args);
		});
	};
	return Registry;
});
// --- end of module registry ---
// --- start of module definitions ---
require(['Registry'], function (Registry) {
	Registry.define('jquery', {
		require: ['jquery'],
		load: function (callback, jQuery) {
			this.define('$', jQuery);
			return callback();
		}
	});
	Registry.define('raphael', {
		require: ['raphael'],
		load: function (callback, R) {
			this.define('Raphael', R);
			return callback();
		}
	});
	Registry.define('beaver', {
		require: ['beav'],
		load: function (callback, beav) {
			this.define('Beaver', beav);
			return callback();
		}
	});
	Registry.define('displayHelper', {
		require: ['display-helper'],
		load: function (callback, displayHelper) {
			displayHelper(this.context);
			return callback();
		}
	});

});
// --- end of module definitions ---
// --- start of loader code ---
define(['module', 'Registry'], function (module, Registry) {

	requirejs.onError = function (err) {
		console.log('global require.js onError callback', err);
	};

	function Loader () {
		this.defines = {};
	};

	Loader.prototype.define = function (name, value) {
		this.defines[name] = value;
	};

	Loader.prototype.fatalError = function (err) {
		this.error = arguments;
		alert(err);
	}

	Loader.prototype.loadModules = function (modules, callback) {
		var loader = this;
		var queue = modules.slice(0); // clone the list of modules to load
		loadNext();
		function loadNext () {
			if (queue.length === 0)
				return callback();
			var moduleName = queue.shift();
			Registry.use(moduleName, loadNext, loader);
		}
	}

	Loader.prototype.bootstrap = function (mode) {
		var loader = this;
		loader.mode = mode;
		require(['json', 'jquery', 'miniPlatform', 'platform-pr', 'beaver-task'], function (JSON, $, miniPlatform, platformPr, beaverTask) {
			var specElement = document.getElementById('spec');
			if (!specElement)
				return loader.fatalError('missing #spec element');
			try {
				var spec = JSON.parse(specElement.innerText);
				var task = beaverTask.task;
				var grader = beaverTask.grader;
				task.getMetaData = function (callback) { callback(spec); };
				loader.context = {
					platform: platformPr,
					task: task,
					grader: grader
				};
				window.platform = platformPr; // XXX needed for some onclick events
				loader.loadModules(spec.modules, function () {
					require([spec.entry], function (initTask) {
						$(function () {
							initTask(platformPr, task, grader);
							miniPlatform(platformPr, task, grader);
						})
					});
				});
			} catch (ex) {
				// TODO: run spec through jsonlint
				return loader.fatalError('parse error in #spec: ' + ex.message);
			}
		}, function (err) {
			loader.fatalError('requirejs errback: ' + err);
		});
	}

	return Loader;

});