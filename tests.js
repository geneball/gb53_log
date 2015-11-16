"use strict";

var Utils = require('gb53_utils'), verify = Utils.verify;

var Log 	= require('gb53_log');

describe("gb53_log",  function() {    
	Log.init();
    describe("Version",  function() {    
    	verify(" Version( ) => 'log.js 25-Sep-15' ", Log.Verson );
    });
    describe("Log",  function() {
    	Log.info('version: %s', Version);
        Log.i('log-test: info-- starting...');
        Log.e('log-test: not really an error');
        Log.i('switch:VAR a boolean = true');
        Log.i('path:VAR a variable = gb53.net');
        Log.i('loopCnt:VAR loop count for test3 = 200');
        Log.w('log-test: warning there are more coming');
        Log.i('tag2: has %d args of types %s & %s ', 3, 'number', 'strings');
        Log.d('logmsg: a debugging %s message', 'test');
        Log.v('tag2: gets verbose sometimes');
        Log.WF('clock1:', function () { return moment().format('ddd DD-MMM-YYYY HH:mm'); });
        Log.WF('clock2: updating clock', function () { return moment().format('HH:mm:ss'); });
        Log.WF('logCnt: count of log messages so far', function(){ return Log.cnt(); });
    });
});

