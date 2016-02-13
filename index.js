 
//#index.js
import $ from 'jquery';
import moment from 'moment';
import sprintf from 'sprintf';
import * as Log from '../log/log';
import * as Ux from '../ux/ux';
import * as Utils from '../utils/utils';
import * as Ixi from '../ixi/ixi';

Log.i('jspm: %s',  'jQuery ' + $.fn.jquery );
Log.i('jspm: %s',  'moment ' + moment.version );
Log.i('jspm: %s',  'sprintf ??' );
Log.i('jspm: %s',  Log.Version() );
Log.i('jspm: %s',  Ux.Version() );
Log.i('jspm: %s',  Utils.Version() );
Log.i('jspm: %s',  Ixi.Version() );

var path = window.location.pathname;

$('#gb53_header').text( sprintf('gb53 module: %s', path.substr(1,path.length-2)));
Ux.msg( 'loaded.' );

