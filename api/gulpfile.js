var gulp = require('gulp');
var run = require('gulp-run');
var child_process = require('child_process');
var psTree = require('ps-tree');
require('dotenv').config();

var redis = false;
var mongo = false;
var api = false;

gulp.task('redis-start', function() {
	redis = child_process.exec('redis-server', function(err, stdout, stderr) {
		console.log(stdout);
		if (err !== null) {
		  console.log('ERROR: ' + err);
		}else{
			console.log('✓ Redis started');
		}
	});
	redis.on('close', function(code) {
		console.log('closing code: ' + code);
	});
});

gulp.task('mongo-start', function() {
  mongo = child_process.exec(`mongod --port ${process.env.MONGO_PORT} --dbpath ./data/mongo/`, function(err, stdout, stderr) {
    console.log(stdout);
    if (err !== null) {
      console.log('ERROR: ' + err);
    } else {
			console.log('✓ Mongo started');
		}
  });
});

gulp.task('api-start', ['redis-start'], function () {
	api = child_process.exec('npm start dev', function(err, stdout, stderr) {
		if (err !== null) {
			console.log('ERROR: ' + err);
		} else {
			console.log('✓ API started');
		}
	});
	api.stdout.on('data', function(data) {
		console.log(data.toString());
	});
	/*api.on('close', function(code) {
		kill(redis.pid);
    child_process.exec(`mongod --port ${process.env.MONGO_PORT} --dbpath ./data/mongo/ --shutdown`, function(err, stdout, stderr) {
      console.log(stdout);
      if (err !== null) {
      console.log('ERROR: ' + err);
      }
    });
	});*/
});

gulp.task('default', [/*'redis-start', 'mongo-start',*/ 'api-start']);

var kill = function (pid, signal, callback) {
	signal   = signal || 'SIGKILL';
	callback = callback || function () {};
	var killTree = true;
	if(killTree) {
		psTree(pid, function (err, children) {
			[pid].concat(
					children.map(function (p) {
						return p.PID;
					})
				).forEach(function (tpid) {
					try { process.kill(tpid, signal) }
					catch (ex) { }
				});
			callback();
		});
	} else {
		try { process.kill(pid, signal) }
		catch (ex) { }
		callback();
	}
};
