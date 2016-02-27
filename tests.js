"use strict";
import * as QUnit from 'qunit';
import { verify } from '../testutils/gb53_testutils';
import * as Log from '../log/gb53_log';

QUnit.module("gb53_log");

//QUnit.test('SHOULD FAIL', function(assert){
//	assert.equal(2,3, 'Failed Assertion reports failure');
//});

QUnit.test('init and version',  function(assert) { 
	Log.init();
	assert.ok(Log.Version().startsWith('gb53_log.js', 'Version under test' ));
});


QUnit.test("Log",  function() {
	QUnit.expect(0);
    Log.info('version: %s', Log.Version() );
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
QUnit.start();

