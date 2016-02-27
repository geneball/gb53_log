 
//#index.js
import $ from 'jquery';
import moment from 'moment';
import sprintf from 'sprintf';
//import * as Qunit from 'qunit';
import * as Log from '../log/gb53_log';
//import * as MD from '../MODULE/gb53_MODULE';
//import * as TUt from '../testutils/gb53_testutils';
import * as Ut from '../utils/gb53_utils';
import * as Ux from '../ux/gb53_ux';
//import * as Ixi from '../ixi/gb53_ixi';
//import * as Ds from '../dstore/gb53_dstore';
//import * as Ev from '../engval/gb53_engval';
//import * as Gv from '../gameview/gb53_gameview';
//import * as Scr from '../scraper/gb53_scraper';
//import * as scrPFR from '../scrPFR/gb53_scrPFR';

Log.i('jspm: %s',  'jQuery ' + $.fn.jquery );
Log.i('jspm: %s',  'moment ' + moment.version );
Log.i('jspm: %s',  'sprintf ??' );
//Log.i('jspm: %s',  'Qunit ??' );
Log.i('jspm: %s',  Log.Version() );
//Log.i('jspm: %s',  MD.Version() );
//Log.i('jspm: %s',  TUt.Version() );
Log.i('jspm: %s',  Ut.Version() );
Log.i('jspm: %s',  Ux.Version() );
//Log.i('jspm: %s',  Ixi.Version() );
//Log.i('jspm: %s',  Ds.Version() );
//Log.i('jspm: %s',  Ev.Version() );
//Log.i('jspm: %s',  Gv.Version() );
//Log.i('jspm: %s',  Scr.Version() );
//Log.i('jspm: %s',  scrPFR.Version() );

Ux.msg( 'gb53_log loaded successfully.' );

// module specific code can go here

