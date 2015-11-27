
'use strict';
// vendor_bundle.js 
var $ = require('jquery');
var moment = require('moment');
var sprintf = require('sprintf');
var Log = this;
var console = require('console');

var Version = 'log.js 25-Sep-15';
/** get Version string
 * @returns {string} version as 'filename.js date'
 */
exports.getVersion = 
	function getVersion(){ 
		return Version; 
	};

//    var tags = {};
//
//    function Tag(name, category, color, group, show){  // call using new or not-- same result
//        var rep = { nm: name.trim(), cat: category, clr: color, cnt: 0, grp: group || '', sh: show || false };
//        var idx = rep.nm.indexOf(':');
//        if (idx>0) 
//            rep.nm = rep.nm.substr(0,idx).trim();
//        if (rep.nm.length > 12) 
//            rep.nm = 'etc';
//        rep.key = rep.nm.toLowerCase();
//        rep.prototype = Tag.prototype;
//        tags.key = rep;  // add to index of tags
//        return rep;
//    }
//    Tag.prototype = {
//
//    };

    function initTags(){  //define built-in pseudo-tags -- names start with _
        // categories of Log elements 
        // '' Lines-- messages in a scrolling log, associated with a 'level' & 'tag'-- created by calls to Log.e .w, .i, .d & .var
        // 'v_' Variable  -- values associated with a 'tag'-- intended to control program behaviour
        // 'w_' Watch     --  stationary displays of the most recent value of a Line or Variables
        // 'c_' Command   -- 'tag' that is associated with a program command
        // 't_' Toggle    -- control visibility of other elements-- color_on_clear = on, black_on_color = off 
        // 'g_' GrpToggle -- all on/off toggle for a group of toggles
        // 'b_' Buttons   -- color_in_box -- click to run command or change value
        Tag('W', 't_', 'hsl( 60,100%,50%)', 'warnings' );   // toggle controlling display of watches
        Tag('L', 't_', 'hsl(320,100%,70%)', 'log' );        // toggle controlling display of log
        Tag('C', 't_', 'hsl(180,100%,50%)', 'commands' );   // toggle controlling display of commands
        Tag('Show Cmds', 'g_', tags.t_C.color, 'cmds');
        Tag('Watch Format', 'g_', tags.t_W.color, 'wfmt');
        Tag('Tag', 't_', tags.t_W.color, 'wtag');
        Tag('Val', 't_', tags.t_W.color, 'wval');
        Tag('Cnt', 't_', tags.t_W.color, 'wcnt');
        Tag('Last', 't_', tags.t_W.color, 'wlast');
        Tag('Show Watches', 'g_', tags.t_w.color, 'wtch');
        Tag('Log Levels', 'g_', tags.t_L.color, 'levs');
        Tag('e', 't_', 'hsl( 10,100%,50%)', 'levs');
        Tag('w', 't_', 'hsl( 30,100%,50%)', 'levs');
        Tag('i', 't_', 'hsl(120,100%,50%)', 'levs');
        Tag('d', 't_', 'hsl(210,100%,60%)', 'levs');
        Tag('v', 't_', 'hsl(280,100%,70%)', 'levs');
        Tag('Log Format', 'g_', tags.t_L.color, 'lfmt');
        Tag('num', 't_', tags.t_L.color, 'lfmt');
        Tag('lev', 't_', tags.t_L.color, 'lfmt');
        Tag('tag', 't_', tags.t_L.color, 'lfmt');
        Tag('dtm', 't_', tags.t_L.color, 'lfmt');
        Tag('val', 't_', tags.t_L.color, 'lfmt');
        Tag('dsc', 't_', tags.t_L.color, 'lfmt');
        Tag('Log Tags', 'g_', tags.t_L.color, 'tags');
        Tag('Pgsz', 'v_', tags.t_L.color, 'log');

    }

    var tags = {
		_RA:     {key: '_RA',    nm: '&rarr;',on: 'T', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
		_LA:     {key: '_LA',    nm: '&larr;',on: 'F', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
		_UA:     {key: '_UA',    nm: '&uarr;',on: 'T', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
		_DA:     {key: '_DA',    nm: '&darr;',on: 'F', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
		_W:      {key: '_W',     nm: 'W',     on: 'T', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        _C:      {key: '_C',     nm: 'C',     on: 'F', val: '', cnt: 0, color: {h:180,s:100,l:50}}, //cyan
        _L:      {key: '_L',     nm: 'L',     on: 'T', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        _V:      {key: '_V',     nm: 'V',     on: 'T', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        _T:      {key: '_T',     nm: 'T',     on: 'F', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        // formatting fields: watch label/val/count/last  log num/lev/tag/date/val/msg/descr
        _wlab:   {key: '_wlab',  nm: 'WLab',  on: 'T', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        _wval:   {key: '_wval',  nm: 'WVal',  on: 'T', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        _wcnt:   {key: '_wcnt',  nm: 'WCnt',  on: 'F', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        _wlast:  {key: '_wlast', nm: 'WLast', on: 'F', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        // log levels: e/w/i/d/v
        _e:      {key: '_e',     nm: 'e',     on: 'T', val: '', cnt: 0, color: {h:10,s:100,l:50}}, //red
        _w:      {key: '_w',     nm: 'w',     on: 'T', val: '', cnt: 0, color: {h:30,s:100,l:50}}, //orange
        _i:      {key: '_i',     nm: 'i',     on: 'T', val: '', cnt: 0, color: {h:120,s:100,l:50}},  //green
        _d:      {key: '_d',     nm: 'd',     on: 'T', val: '', cnt: 0, color: {h:210,s:100,l:60}}, //blue
        _v:      {key: '_v',     nm: 'v',     on: 'F', val: '', cnt: 0, color: {h:280,s:100,l:70}},  //violet
        __W:     {key: '__W',    nm: 'W',     on: 'F', val: '', cnt: 0, color: {h:60,s:100,l:50}}, //yellow
        __C:     {key: '__C',    nm: 'C',     on: 'F', val: '', cnt: 0, color: {h:180,s:100,l:50}}, //cyan
        _num:    {key: '_num',   nm: 'num',   on: 'F', val: '', cnt: 0, color: {h:320,s:100,l:60}}, //pink
        _lev:    {key: '_lev',   nm: 'lev',   on: 'F', val: '', cnt: 0, color: {h:320,s:100,l:60}}, //pink
        _tag:    {key: '_tag',   nm: 'tag',   on: 'T', val: '', cnt: 0, color: {h:320,s:100,l:60}}, //pink
        _dt:     {key: '_dt',    nm: 'dt',    on: 'F', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        _msg:    {key: '_msg',   nm: 'msg',   on: 'T', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        _val:    {key: '_val',   nm: 'val',   on: 'T', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
        _descr:  {key: '_descr', nm: 'descr', on: 'F', val: '', cnt: 0, color: {h:320,s:100,l:70}}, //pink
//        dtfmt:   {key: 'dtfmt',  nm: 'dtFmt',  isVar: true, val: 'hh:mm:ss', cnt: 0 },
//        pgsize:  {key: 'pgsize', nm: 'pgSize', isVar: true, val: '30', cnt: 0 }
    };
    var watches = [], commands = [];  // list of tags being watched / as commands
    var cmdlines = [], curr_command=null;  // list of commands entered
    var chartrecorder = null;
    var logCnt = null;	// used to trigger self initialization
    var ticTimer = null, watchTic = 1000, chartTic = 100, ticMS;
    var keys = { up: 38, down: 40 };
    var testInBrowser = new Function("try { return this===window; } catch(e){ return false; }");
    var inBrowser = testInBrowser();
    var LogLines = [], LogDisabled = false;
var init = 
    /** 
     * initialize Log 
     * @param {string} [jquery_selector] - specifies DOM element to append Log to (defaults to 'body')
     */
	
exports.init = 
	function init(selector) {
    	if (logCnt!=null) return; // already called
		logCnt = 0;				  // so don't repeat or self initialize
	if (inBrowser){
            if (selector == undefined) selector = 'body';
            $(selector).append('<div id="logMarkup" class="log_top log_left"><div id="logOverlay"></div>  <div id="logPopup" class="log_grp log_grp__C"></div></div>');
            var html = shiftHtml(tags._LA,'hide_grp log_LR') + shiftHtml(tags._RA,'log_LR') + shiftHtml(tags._UA,'hide_grp log_UD') + shiftHtml(tags._DA,'log_UD');
            html += buttonHtml(tags._W) + buttonHtml(tags._L);
            html += '<span id="logPages" class="log_grp log_grp__L log_clr_L"></span>'; // page controls
            html += buttonHtml(tags._C) + '<span id="logCommands" class="log_clr_C"></span>'; // commands
            html += '<div id="logWatch" class="log_grp log_grp__W"> </div>';
            html += '<div id="logLog" class="log_grp log_grp__L"> </div>';
            $('#logOverlay').html(html);
    
            html =  sprintf('<div id="logCmdBtns" class="log_clr_C">Command: <input id="cmdLine" type="text" val="">%s</div>', grpBtnHtml('Show Cmds:','C','CB'));
            html += sprintf('<div>%s %s </div>', grpBtnHtml('Watch format:','W','WF'), htmlForButtons(['_wlab','_wval','_wcnt','_wlast'],'W','WF') );
            html += sprintf('<div id="logWatchBtns"> %s </div>', grpBtnHtml('Show Watches:','W','WV') );
            html += sprintf('<div> %s %s </div>', grpBtnHtml('Log levels:','L','LL'), htmlForButtons(['_e', '_w', '_i', '_d', '_v', '__W', '__C'], false, 'LL') );
            html += sprintf('<div> %s %s </div>', grpBtnHtml('Log format:','L','LF'), htmlForButtons(['_num', '_lev', '_tag', '_dt', '_msg', '_val', '_descr'], 'L', 'LF') );
            html += sprintf('<div id="logTagBtns"> %s </div>',  grpBtnHtml('Log tags:','L','LT'));
            $('#logPopup').html(html);
    
            initStyles();
	}
        setButtons([ '_LA','_RA','_UA','_DA', '_C','_W','_L', '_wlab','_wval','_wcnt','_wlast', '_e','_w','_i','_d','_v','__W', '__C', '_num','_lev','_tag','_dt','_msg','_val','_descr' ]);
        VCF('dtFmt: used in log entries =HH:mm:ss', reformatDates);
        valChoices('dtFmt', ['H:mm:ss', 'mm:ss', 'D-MMM H:mm:ss', 'pop-up']);
        info('version: %s', Version);

        V('pgSize: num lines per log page =30');
	if (!inBrowser) return;
	
//        CF('test1: run a log test', LogTest.test1);
        CF('chart: add recorder chart', addChart,this);
        show('chart');

		if (isBrowser()) {
	        var qterms = window.location.search.substr(1).split('&');
	        for (var i in qterms)
	            if (qterms[i].trim()!=''){
	                d('urlQuery: '+decodeURIComponent(qterms[i]));
	                d(decodeURIComponent(qterms[i]));
	            }
	        startTicking(watchTic);
	        updateGroups();
	        $('body').on('keydown', '', checkLogToggle);
	        $('#logMarkup').on('click touch','button', logBtnClick);
	        $('#logPopup').on('keypress','input', logCmdKey);
	        $('#logMarkup').toggle();
        }
    }
    function startTicking(ms){
	   if (ticTimer != null) 
	       clearInterval(ticTimer);
	   ticMS = ms;
       ticTimer = setInterval(onTic, ms);
    }
    function initStyles(){
        var styles = "<style type='text/css'>";
        // default styles for regions
        styles += "\r\n  #logMarkup { position:absolute; width: 50%; height:50%; }";
        styles += "\r\n  #logMarkup.log_top { top:10px; }";
        styles += "\r\n  #logMarkup.log_left { left:10px; }";
        styles += "\r\n  #logMarkup.log_bottom { bottom:10px; }";
        styles += "\r\n  #logMarkup.log_right { right:10px; }";
        styles += "\r\n  #logOverlay { position:absolute; width: 100%; height:100%; left:0; top:0; }";
        styles += "\r\n  #logPopup { position:absolute; left:10%; top:20%; width: 60%; height: 60%; background-color:rgba(50,50,150,0.4); }";
        styles += sprintf("\r\n #logWatch { background-color:transparent; color:%s; margin: 8px 30px; clear:both; }", asHsla(tags._W.color));
        styles += sprintf("\r\n #logLog { background-color:transparent; margin: 2px 5px; clear:both; }");  // text color is per line
        styles += '\r\n  .hide_grp { display: none; }';

        // special override of <input text
        styles += sprintf("\r\n #cmdLine { margin-left: 5px; background-color:transparent; border: 1px solid %1$s; color: %1$s; }", asHsla(tags._C.color));

        // override default button format
        styles += "\r\n button { margin: 3px 3px; background-color:transparent; border: none; }";
        styles += "\r\n button.log_btn_pg { margin: 1px 3px; padding: 1px 1px; background-color:transparent; border: none; }";
        var clr =  asHsla(tags._C.color);
        styles += sprintf("\r\n button.log_Cmd { margin: 1px 0 1px 3px; padding: 1px 1px; background-color:transparent; border: none; color: %s; }", clr);
        styles += sprintf("\r\n button.log_Cmd.log_on { margin: 1px 0 1px 3px; padding: 1px 1px; background-color:transparent; border: 1px solid %s; color: %s; }", clr, clr);
        styles += sprintf("\r\n button.log_CmdNm { margin: 1px 0 1px 3px; padding: 1px 1px; background-color:transparent; border: none; color: %s; }", clr);
        styles += sprintf("\r\n button.log_CmdNm.log_on { margin: 1px 0 1px 3px; padding: 1px 1px; background-color:transparent; border: 1px solid %s; color: %s; }", clr, clr);
        styles += sprintf("\r\n button.log_CmdVal { margin: 1px 3px 1px 0; padding: 1px 1px; background-color:transparent; border: 1px solid %s; color: %s; }", clr, clr );

        styles += cssForColors(['_C', '_W', '_L', '_V', '_e', '_w', '_i', '_d', '_v', '__W']);   // colors for each type on & off

        styles += '\r\n #logChart { clear:both; float: left; }';
        styles += '\r\n #logChart canvas { display: inline-block; }';
        styles += '\r\n #logChartTags { color:black; }';
        styles += '\r\n #logChartTags span { display: inline-block; color: white; margin: 2px 2px; padding: 0 1px; opacity: 0.5; }';
        styles += '\r\n #logChartTags span.log_on { color: black; opacity: 1.0; }';
        styles += '\r\n #logChartTags span.log_Cmd { background-color:transparent; border: 1px solid red; color: red; opacity: 1.0; }';
        // spacing & sizes of log fields
        styles += '\r\n div.log_grp__L       {  clear:both; }';
        styles += '\r\n span.log_grp_l_pg    { float:left; margin-left: 5px; width: 18px; }';
        styles += '\r\n span.log_grp_l_num   { float:left; margin-left: 5px; width: 27px; }';
        styles += '\r\n span.log_grp_l_lev   { float:left; margin-left: 5px; width: 18px; }';
        styles += '\r\n span.log_grp_l_tag   { float:left; margin-left: 5px; width: 70px; }';
        styles += '\r\n span.log_grp_l_dt    { float:left; margin-left: 5px; width: 80px; }';
        styles += '\r\n span.log_grp_l_msg   { float:left; margin-left: 5px; }';
        styles += '\r\n span.log_grp_l_val   { float:left; margin-left: 5px; }';
        styles += '\r\n span.log_grp_l_descr { float:left; margin-left: 5px; }';

        // spacing & sizes of watch fields
        styles += '\r\n span.log_grp_W      { float:left; clear: left; }';
//        styles += '\r\n button.log_grp_w_wlab   { float:left; margin-left: 15px; padding-right: 2px; }';
        styles += '\r\n span.log_grp_w_wlab   { float:left;  margin: 3px 0 3px 15px; padding: 1px 2px 1px 0; }';
        styles += '\r\n span.log_grp_w_wval   { float:left; margin: 3px 0; padding: 1px 0; }';
        styles += '\r\n span.log_grp_w_wcnt   { float:left; margin: 3px 10px; padding: 1px 0; }';
        styles += '\r\n span.log_grp_w_wlast  { float:left; margin: 3px 10px; padding: 1px 0; }';

        styles += "</style>";
        $('head').append(styles);
    }
    function pageHtml(){
        var tag = asTag('pgSize');
        tag.maxPg = 0;
        return sprintf('<button id="logPgSize" class="log_UpdVar log_clr_L log_on" value="pgsize">sz%s:</button>', tag.val);
    }
    function lastPage(){  return Math.floor(logCnt/asNum('pgSize')); }
    function updatePages(){
	if (!inBrowser) return;
        var tag = asTag('pgSize');
        if (tag.maxPg==undefined || tag.valChanged)
            $('#logPages').html(pageHtml());
        tag.valChanged = false;
        var lastpg = lastPage()+1;
        for (var i=tag.maxPg+1; i<=lastpg; i++)
            $('#logPages').append(sprintf('<button class="log_btn log_btn_pg log_btn_G%d log_clr_L log_on" value="G%d">%d</button>',i,i, i));
        tag.maxPg = lastpg;
        var grpsize = asNum('pgSize');
        $('#logPgSize').text('G'+grpsize);
        $('.log_btn_pg').each(function(){
            if (!$(this).hasClass('log_on')){
                var grp  = parseInt($(this).text())-1;
                // hide lines in this group
                for (var i=0; i<grpsize; i++) {
                    var id = sprintf('#logLine%d', grp * grpsize + i);
                    $(id).toggleClass('hide_grp',true);
                }
            }
        });
    }
    function changeVar(nm){
        var tag = tags[nm]; // asTag(nm);
        var cval = tag.val;
        var choices = tag.choices? tag.choices : ['10','20','30','40','50'];
        var idx = choices.indexOf(cval)+1;  // not found => 0
        if (idx>=choices.length) idx = 0;
        tag.val = choices[idx];
        tag.valChanged = true;
        if (tag.onChangeCB!=undefined)
            tag.onChangeCB.call(tag.onChangeThis, tag.nm);
    }
    function htmlForButtons(nms, clr, grp){
        var html = '';
        for (var t in nms)
            html += buttonHtml(tags[nms[t]], clr, false, grp);
        return html;
    }
    function grpBtnHtml(lab,clr,grp){
        return sprintf('\r\n <button class="log_btn log_btn_%s log_clr_%s" value="-%s">%s</button>',grp, clr,grp,lab);
    }
    function buttonHtml(tag, clr, on, grp){
        tag.btnnm = clr? clr.toLowerCase()+tag.key : tag.key;   // distinguishes between L, W, & C btns
        var btnclr = clr? clr : tag.nm;  // actual color
        var ison = on? 'log_on' : '';
        var bgrp = grp? 'log_bgrp_'+grp : '';
        if (grp=='Cmd') ison = 'log_UpdVar';
        var label = tag.nm;
        return sprintf('\r\n <button id="logTog%s" class="log_btn log_btn_%s log_clr_%s %s %s" value="%s">%s</button>', 
        	tag.nm, tag.btnnm, btnclr, bgrp, ison, tag.btnnm, tag.nm);
    }
    function cssForColors(nms){
        var css = '';
        for (var t in nms)
            css += colorCSS(tags[nms[t]]);
        return css;
    }
    function colorCSS(tag){
        // when off: color text on transparent
        var css = sprintf('\r\n .log_clr_%s { color:%s; background-color: transparent; }', tag.nm, asHsla(tag.color));
        // when on:  black text on color background
        css += sprintf('\r\n .log_clr_%s.log_on { color: black; background-color: %s; }', tag.nm, asHsla(tag.color));
        return css;
    }
    function watchHtml(tag){
        var html = sprintf('<span class="log_grp log_grp__W log_grp_w%s">', tag.key);
        html += sprintf(' <span class="log_grp log_grp_w_wlab log_clr_W">%s:</span>', tag.key,tag.key, tag.nm);
//        html += sprintf(' <button class="log_btn log_btn_w%s log_grp log_grp_w_wlab log_clr_W log_on" value="w%s">%s:</button>', tag.key,tag.key, tag.nm);
        html += sprintf(' <span id="logWVal%s"  class="log_grp log_grp_w_wval">%s</span>', tag.nm, tag.val );
        html += sprintf(' <span id="logWCnt%s"  class="log_grp log_grp_w_wcnt">%s</span>', tag.nm, tag.cnt);
        var fmt = val('dtFmt');
        html += sprintf(' <span id="logWLast%s" class="log_grp log_grp_w_wlast log_date" value="%s">%s</span></span>',
            tag.nm, tag.last.format('x'), tag.last.format(fmt));
        return html;
    }
    function cmdHtml(tag){
        var html = sprintf('<span class="log_grp log_grp_c%s log_clr_C">', tag.key);
        if (tag.isVar) {
            html += sprintf(' <button class="log_btn log_btn_c%s log_CmdNm log_clr_C" value="c%s">%s</button>', tag.key, tag.key, tag.nm);
            html += sprintf(' <button id="logCVal%s" class="log_btn log_CmdVal log_UpdVar" value="%s">=%s</button></span>', tag.key, tag.key, tag.val);
        } else
            html += sprintf(' <button class="log_btn log_Cmd log_on" value="c%s">%s</button>', tag.key, tag.nm);
        return html;
    }
    function shiftHtml(tag, cls){
	return sprintf('<button class="log_btn log_clr_W log_Shift %s" value="%s">%s</button>', cls, tag.key, tag.nm);
    }
    function asHsla(c, a, l){  return sprintf('hsla(%d,%d%%,%d%%,%1.1f)', c.h, c.s, l==undefined? c.l : l, a==undefined? 1.0 : a);  }

    function logToggleTrace(ev){
	if (!inBrowser) return;
        var targ = $(ev.target);
        if (targ.hasClass('log_Cmd')){
            chartrecorder.scale(targ.text());
        } else
            targ.toggleClass('log_on');	// toggle with no refresh
    }
    function logBtnClick(ev){
        var targ = $(ev.target);
        var tag = null;
        if (targ.hasClass('log_UpdVar')){  // page control, vars
            changeVar(targ.val());
            return true;
        } else if (targ.hasClass('log_Cmd')){  // command button
            tag = tags[targ.val().substr(1)];
            if (tag && tag.command)
                tag.command.fn.call(tag.command.fnThis, tag.nm);
            return true;
        } else if (targ.hasClass('log_Shift')){  // shift position button
            tag = tags[targ.val()];
            shiftLog(tag, targ.hasClass('log_LR')? 'log_LR':'log_UD');
            return true;
        } else  {
            var nm = targ.val();
            var ison = targ.hasClass('log_on');
            setButton(nm, !ison);
            return true;
        }
        updateGroups();
        return false;
    }
    function shiftLog(tag, pair){
	$('.'+pair).toggleClass('hide_grp');
	if (pair=='log_LR'){
	    $('#logMarkup').toggleClass('log_left');
	    $('#logMarkup').toggleClass('log_right');
	} else {
	    $('#logMarkup').toggleClass('log_top');
	    $('#logMarkup').toggleClass('log_bottom');
	}
    }
    function setButton(nm, on ){
    	if (!inBrowser) return;
    	if (nm.charAt(0)=='-'){ // toggle button group?
            nm = nm.substr(1);
            $('.log_bgrp_'+nm).toggleClass('log_on', on);
        }
        if (tags[nm] && tags[nm].btnnm!=undefined)
            nm = tags[nm].btnnm;
        $('.log_btn_' + nm).toggleClass('log_on', on);
    }
    function setButtons(nms){
        for (var t in nms){
            var tag = tags[nms[t]];
            setButton(tag.key, tag.on=='T');
        }
        updateGroups();
    }
    function updateGroups(){
    	if (!inBrowser) return;
        $('.log_grp').toggleClass('hide_grp', false);  // set all visible
        $('.log_btn').each(function(){
            if (!$(this).hasClass('log_on')){   // button is off--
                var v = $(this).val();
                if (v.charAt(0)!='-') { // skip button groups
                    var grpsel = '.log_grp_' + v;
                    $(grpsel).toggleClass('hide_grp', true);  // so hide that group
                }
            }
        });
        updatePages();
    }
    function clamp(val, min, max, delta){
        if (delta!=undefined) val += delta;
        if (val<min) val = min;
        if (val>max) val = max;
        return val;
    }
    function logCmdKey(ev){
        if (ev.which==keys.up || ev.which==keys.down){
            if (curr_command==null) curr_command = cmdLines.length;
            clamp(curr_command, 0, cmdLines.length-1, ev.which==keys.up? -1 : 1);
            $(ev.target).val(cmdLines[curr_command]);
            return;
        }
        if (ev.which!=13) return;
        curr_command = null;
        var cmd = $(ev.target).val();
        cmdLines.push(cmd);
        if (cmd=='') return;
        if (cmd.indexOf(':')<0) cmd = 'cmd: '+cmd;
        d(cmd);
        $(ev.target).val('');
    }
    function checkLogToggle(ev) {
        if (ev.ctrlKey && ev.shiftKey && ev.which==76)  // ctr-shf-L
        {
            ToggleView();
            return false;   // event was handled
        }
        return true;
    }
    
    /** 
     * make log markup visible/invisible
     */
var ToggleView = exports.ToggleView = function ToggleView(){
            $('#logMarkup').toggle();
    }
    function reformatDates() {
        $('.log_date').each(function () {
            var tmstamp = $(this).attr('value');
            var fmt = val('dtFmt');
            var dtstr = moment(tmstamp,'x').format(fmt);
            if (tmstamp!='')
                $(this).text(dtstr);
        });
    }
    function onTic() {
        if (chartrecorder!=null){ 
            if (ticMS!=chartTic) startTicking(chartTic);
            chartrecorder.render(ticMS);
        } else {
            if (ticMS!=watchTic) startTicking(watchTic);
        }
        for (var m in watches) {
            var tag = watches[m];
            if (tag.watch){ //todo: && tag.watch.visible) {
                if (tag.watch.getVal)
                    tag.val = tag.watch.getVal.call(tag.watch.getThis, tag.nm);
                if (tag.val==undefined) tag.val='undef';
                $('#logWVal'+tag.nm).text(tag.val);
                $('#logWCnt'+tag.nm).text(tag.cnt);
                $('#logWLast'+tag.nm).val(tag.last.format('x'));
                $('#logWLast'+tag.nm).text(tag.last.format(val('dtFmt')));
            }
        }
        for (var c in commands) {
            var tag = commands[c];
            $('#logCVal'+tag.key).text(tag.val);  // todo: explain why
        }
    }
    function onChange(tagnm, callback, cbThis){ // register callback for when value changes: e.g. dtFmt:='hh:mm:ss.sss'
        var tag = asTag(tagnm);
        tag.onChangeCB = callback;
        tag.onChangeThis = cbThis;
    }

    // recorder -------------------------------------------
    function recorder(){
        this.cnt = 0;
        this.sum = 0;
        this.samples = [];
        this.sampleCnt = 0;
        this.maxsamples = 0;
        this.minv = -100.0;
        this.maxv = 100.0;
        return this;
    }
    recorder.prototype.updt = function updt(timestamp, floatval){
            if (this.cnt==0){
                this.min = floatval;
                this.max = floatval;
                this.sum = floatval;
            }
            this.cnt++;
            this.sum += floatval;
            if (floatval<this.min) this.min = floatval;
            if (floatval>this.max) this.max = floatval;
            this.samples.push({ tm: timestamp, val: floatval });
            this.sampleCnt++;
        };
    recorder.prototype.setScale = function setScale(minval, maxval){  // call without args to autoscale
	   this.minv = minval==undefined? this.min: minval;
	   this.maxv = maxval==undefined? this.max: maxval;
    };
    recorder.prototype.avg = function avg(){ return this.sum/this.cnt; };
    recorder.prototype.min = function min(){ return this.min; };
    recorder.prototype.max = function max(){ return this.max; };
    recorder.prototype.cnt = function cnt(){ return this.cnt; };
    recorder.prototype.pt = function pt(idx){ return this.samples[idx]; };
    recorder.prototype.next = function next(){ return 0; };
    recorder.prototype.clear = function clear(overlap){
        if (overlap > this.sampleCnt) 
        	overlap = this.sampleCnt;
    	for (var i=0; i<overlap; i++)
    		this.samples[i] = this.samples[this.sampleCnt-overlap+i];
    	this.sampleCnt = overlap; 
    }
    recorder.prototype.maxpt = function maxpt() { return this.sampleCnt; };
    // end_recorder -------------------------------------------

    function addChart(){
        if (chartrecorder!=null) return;
        var tag = asTag("ChartRecorder");
        $('#logWatchBtns').append(buttonHtml(tag,'W',false,'WV'));
        chartrecorder = new chart(300,200, 3);
        $('#logWatch').prepend(chartrecorder.html());

        for (var t in tags){
            if (tags[t].recorder!=undefined)
                chartrecorder.addTrace(tags[t]);
        }
    }

    // chart -------------------------------------------
    function chart(wd, hi, stepPixels){
        this.wide = wd || 300; 
        this.high = hi || 200; 
        this.pixPerStep = stepPixels || 3; 
        this.msPerStep = chartTic; 
        this.msPerPix = this.msPerStep / this.pixPerStep;
        this.stepCnt = 0;
        this.stepsPerSec = 1000/this.msPerStep;
        this.canv = null; 
        this.ctx = null; 
        this.trCnt = 0;
        this.traces = [];
        this.hues = [0,120,240,60,180,300,30,150,270,90,210,330]; 
        this.NHues = 12;
        this.lightvals = [ 50, 80, 20 ];
        this.startTS = null; 
        this.currTS = 0;
    }
    chart.prototype.scale =  function scale(cmd){
        for (var t in this.traces){
            var tag = this.traces[t];
            var rec = tag.recorder;
            if (rec!=undefined && $('#logTr'+tag.nm).hasClass('log_on')){
        	if (cmd=='auto')
        	    rec.setScale();
        	else
        	    rec.setScale(cmd=='+'? rec.minv*.75 : rec.minv/.75, cmd=='+'? rec.maxv*.75 : rec.maxv/.75); 
            }
        }
    }
    chart.prototype.html =  function html(wd, hi){
	if (wd) this.wide = wd;
	if (hi) this.high = hi;
        var html = '<div id="logChart">'; 
        html += sprintf('<canvas id="chartCanv" width="%d", height="%d" style="width: %dpx; height: %dpx;">',
        	this.wide, this.high, this.wide, this.high);
        html += sprintf('</canvas><div id="logChartTags" style="width: %dpx;">', this.wide); 
        html += sprintf('<span class="log_Cmd">+</span><span class="log_Cmd">-</span><span class="log_Cmd">auto</span></div></div>','');
        return html;
    }
    chart.prototype.addTrace =  function addTrace(tag){
	var h = this.trCnt % this.NHues;
	var lv = Math.floor(this.trCnt/this.NHues);
        tag.recorder.color = sprintf('hsl(%d, 100%%, %d%%)', this.hues[h], this.lightvals[lv]);
        if (this.trCnt==0)  
            $('#logChartTags').on('click','span', logToggleTrace);
        this.traces.push(tag);
        this.trCnt++;
        $('#logChartTags').append(sprintf('<span id="logTr%s" %s style="background: %s;">%s</span>', 
        	tag.nm, (this.trCnt<4? 'class="log_on"':''), tag.recorder.color, tag.nm));
    };
    chart.prototype.render = function render(ticms){  // shift by a step & fill in traces
        if (this.canv==null){
            this.canv = document.getElementById('chartCanv');
            this.ctx = this.canv.getContext('2d');
            this.currTS = Date.now();
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0,0, this.wide, this.high);
            this.ctx.lineWidth = 1;
        }
        this.startTS = this.currTS;
        var ts = Date.now();
        this.ctx.strokeStyle = 'white';
        while (this.currTS+this.msPerStep < ts) {
            this.ctx.drawImage(this.canv, this.pixPerStep, 0); // shift chart right by pixPerStep
            this.ctx.fillRect(0, 0, this.pixPerStep, this.high); // black out exposed section
            if (this.stepCnt % this.stepsPerSec == 0){
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, this.high);
                this.ctx.stroke();
                //this.stepCnt = 0;
            }
            this.currTS += this.msPerStep;
            this.stepCnt++;
        }
        var zrts = this.currTS - this.startTS;
    	if (this.stepCnt < 30)
    		Log.v('chartstep: startTs=%d currTs=%d zr=%d stepcnt=%d nw=%d', this.startTS, this.currTS, zrts, this.stepCnt, ts);

        var x = 0;
        for (var t in this.traces){
            var tag = this.traces[t];
            var rec = tag.recorder;
            if ($('#logTr'+tag.nm).hasClass('log_on')){
                var pixPerVal = this.high/(rec.maxv-rec.minv);
                this.ctx.strokeStyle = rec.color;
                var currpt=rec.pt(rec.next());
                this.ctx.beginPath();
                var x = (this.currTS-currpt.tm)/this.msPerPix;
                var y = (currpt.val-rec.minv)*pixPerVal;
                this.ctx.moveTo(x, y);
                for (var i=rec.next()+1; i<rec.maxpt(); i++){   // for all points since last refresh
                    currpt = rec.pt(i);
                    var ptts = currpt.tm - this.startTS;
                    x = (this.currTS-currpt.tm)/this.msPerPix;
                    y = (currpt.val-rec.minv)*pixPerVal;
                	if (this.stepCnt < 30)
                		Log.v('chartstep: ptts=%d ptval=%6.2f x=%4.0f y=%4.0f', ptts, currpt.val, x, y);
                    this.ctx.lineTo(x, y);
                    if (currpt.tm < this.startTS) break;
                }
                this.ctx.stroke();
            }
            rec.clear(40);
        }
    };
    // end_chart -------------------------------------------


    /* return current value of log variable 
     * @param {string} tagnm - name of log variable defined with Log.V()
     */
var show = exports.show = function show(tagnm){
	var tag = asTag(tagnm);
    if (isBrowser())
    	$('#logTog'+tag.nm).toggleClass('log_on', true);
    }
    
    /* return current value of log variable 
     * @param {string} tagnm - name of log variable defined with Log.V()
     */
var val = exports.val = function val(tagnm) {  // get value of switch set by Log, e.g. 'doExtra: do some extra stuff if true =false'
        var tag = asTag(tagnm);
        return tag.val;
    }
    function asRec(tagnm){
        var tag = asTag(tagnm);
        if (tag.recorder==undefined){
            tag.recorder = new recorder();
            if (chartrecorder!=null)
                chartrecorder.addTrace(tag);
        }
        return tag;
    }
    
var recordVal =  
/* record value of a chartable variable
 * @param {string} tagnm - name of chartable variable defined with Log.V()
 * @param {integer} tm - msec timestamp when value was recorded
 * @param {float} val - value of 'tagnm' at 'tm'
 */
exports.recordVal = 
	function recordVal(tagnm, tm, val){
        var tag = asRec(tagnm);
        tag.recorder.updt(tm, val);
        tag.val = val;
    }
    function setScale(tagnm, minv, maxv){
        asRec(tagnm).recorder.setScale(minv, maxv);
    }
    
var last = 
/* return moment() when log variable was last updated
 * @param {string} tagnm - name of log variable defined with Log.V()
 */
exports.last = 
	function last(tagnm) {  // get time of last update
        var tg = asTag(tagnm);
        return tg.last;
    }
    
var cnt =   
/* return number of times log variable has been updated
 * @param {string} tagnm - name of log variable defined with Log.V()
 */
exports.cnt = 
	function cnt(tagnm) {  // get time of last update
        if (tagnm==undefined) return logCnt;
        var tg = asTag(tagnm);
        return tg.cnt;
    }

var isSet =
/** 
 * return boolean value of a log Variable 
 *   e.g. if (isSet('useXSize')){ ...
 * @param {string} tagnm - name of variable defined with Log.V()
 */
exports.isSet = 
	function isSet(tagnm) { 
        return asBool(tagnm); 
    }
    function asBool(tagnm) {  // return val() as boolean
        var v = val(tagnm);
        if (v == undefined) return false;
        var truevalues = '.true.t.1.yes.on.active.';
        v = '.' + v.toLowerCase() + '.';
        return truevalues.indexOf(v) >= 0;
    }
    function asNum(tagnm){ return parseFloat(val(tagnm)); }
    function toInt(float){ return Math.floor(float); }
    function asTag(tagnm) {
    	tagnm = tagnm.trim();
        var taglc = tagnm.toLowerCase();
        var fch = taglc.charAt(0), tagon = null;
        if (fch=='+' || fch=='-'){
        	taglc = taglc.substr(1);
        	tagnm = tagnm.substr(1);
        	tagon = (fch=='+');
        }
        if (tags[taglc]){
        	if (tagon!=null) tags[taglc].on = tagon;
            return tags[taglc];
        }
        tags[taglc] = { key: taglc, nm: tagnm, grp:'t', on: tagon, val: '', descr: '', last: moment(), cnt: 0};
        if (inBrowser)
            $('#logTagBtns').append(buttonHtml(tags[taglc],'L',true,'LT'));
        return tags[taglc];
    }
    function addWatch(tag) {    // returns true if already there
       if (tag.watch!=undefined) return true;
        tag.watch = { nm: 'w_'+tag.key };
        watches.push(tag);
	if (!inBrowser) return false;
	$('#logWatchBtns').append(buttonHtml(tag,'W',false,'WV'));
        $('#logWatch').append(watchHtml(tag));
        return false;
    }
    function addCommand(tag) {
    //    if (!tags._C.enabled) return;
        if (tag.command!=undefined) return;
        tag.command = { nm: 'c_'+tag.key };
        if (inBrowser){
	    $('#logCmdBtns').append(buttonHtml(tag,'C',false,'CB'));
	    $('#logCommands').append(cmdHtml(tag));
        }
        commands.push(tag);
    }
    function parseTag(s, isvar) {  //  'tagnm: description ' or 'tagnm: description = value' or 'description'
        var tagnm = 'etc', msg = s;
        var idx = s.indexOf(':');
        if (idx > 0 && idx < 20) {
            tagnm = s.substr(0, idx).trim();
            msg = s.substr(idx + 1).trim();
        }
        var tag = asTag(tagnm);
        tag.val = msg;
        
        if (isvar){
            tag.isVar = true;
            var eqIdx = tag.val.indexOf('=');
            if (eqIdx>=0) {
        	tag.descr = tag.val.substr(0,eqIdx).trim();
        	tag.val = tag.val.substr(eqIdx+1).trim();
            }
        }
        
        if (tag.onChangeCB!=undefined)
            tag.onChangeCB.call(tag.onChangeThis, tag.nm);
        return tag;
    }
    function startsWith(val, keywd) {
        for (var i = 0; i < keywd.length; i++)
            if (val.charAt(i) != keywd.charAt(i)) return false;
        return true;
    }

    function typval(arg){
 		if (arg==undefined) return "undefined";
		if (arg==null) return "null";
  		var typ = typeof arg;
		if (typ=='number') return sprintf("n[%5.3f]", arg);
		var val = arg.toString();
		if (typ=='function') return sprintf("fn[%s]", val.substr(0,val.indexOf(')')+1));
		if (val.length>50) val = val.substr(0,50)+'...';
		if (typ=='string') return sprintf("s[%s]", val);
	    return sprintf("%s[%s]", typ, val);
    };
    
var C = 
exports.C =  
/** 
 * debug log the parameters to a call 
 * @param {string} nmstr - comma separated 'fnname,arg0,arg1,...'
 * @param {array} args - 'slice'd copy of callers 'arguments', i.e. Array.prototype.slice.call(arguments)
 */
exports.Call = 
    function Call(nmstr, args) {
    	var nms = nmstr.split(',');
    	var s = nms[0] + ": (";
    	for (var i=1; i<nms.length; i++){
    	    s += sprintf(" %s=%s,", nms[i], typval(args[i-1]));
    	}
    	for (var i=nms.length; i<=args.length; i++){
    	    s += sprintf(" %s,", typval(args[i-1]));
    	}
    	wr('d', s.substr(0,s.length-1)+' )');
    }
var V = 
exports.V =  
/** 
 * define a log Variable -- used to control program options
 *   e.g. Log.Var('xsize: value used to configure program = 22');
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.Var = 
    function Var(fmt) {
        wr('V', sprintf.apply(null, arguments));
    }

var VCF = exports.VCF = 
/**
 *  register an onChange function for a log Variable
 *   e.g. Log.VarChangedFn('xsize', onXSizeChanged);
 * @param {string} tagnm -- name of Watch tag
 * @param {function} fn -- function to run to get value to show as watch
 * @param {object} mthis -- optional this for function
 */
exports.VarChangedFn = 
	function VarFn(s, updatefn, mthis){    // register change function, e.g. dtFmt
        var tag = wr('V', s);
        onChange(tag.nm, updatefn, mthis);
    }
    
var T = exports.T = 
/** 
 * log a trace message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.Trace =
    function Trace(fmt){
    	if (LogDisabled) return;
    	wr('T', sprintf.apply(null, arguments));
}
    

var W = exports.W = 
/** 
 * define a Watch field -- when shown, current value is updated periodically
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.Watch = 
    function Watch(fmt) {
	if (LogDisabled) return;
        wr('W', sprintf.apply(null, arguments));
}
    
var WF = exports.WF = 
/**
 *  register an update function for a Watch value
 *    e.g. Log.WF('clock: current time', function(){ return moment().format(); });
 * @param {string} tagnm -- name of Watch tag
 * @param {function} fn -- function to run to get value to show as watch
 * @param {object} mthis -- optional this for function
 */
exports.WatchFn = 
    function WatchFn(s, updatefn, mthis){    // register update function, e.g. WF('clock: current time', function(){
	if (LogDisabled) return;
        var tag = wr('W', s);
        tag.watch.getVal = updatefn;
        tag.watch.getThis = mthis;
        updateGroups();
    }

var CF = 
exports.CF = 
exports.CmdFn = 
/**
 *  register a command function, e.g. CF('cmd: does xxx', function(){... 
 * @param {string} tagnm -- name of Var tag
 * @param {function} fn -- function to run when tag-button is clicked
 * @param {object} mthis -- optional this for function
 */
exports.CommandFn = 
    function CmdFn(tagnm, fn, mthis){    
	if (LogDisabled) return;
        var tag = wr('C', tagnm);
        tag.command.fn = fn;
        tag.command.fnThis = mthis;
        updateGroups();
    }

var valChoices = 
/** 
 * specify legal value choices for a Var  
 * @param {string} tagnm -- name of Var tag
 * @param {string[]} choices -- legal values for 'tag' var
 */
exports.valChoices = 
    function valChoices(tagnm, choices){
        var tag = asTag(tagnm);
        tag.choices = choices;
    }

var e = exports.e = 
/** 
 * log an error message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.error = 
    function error(fmt) {
	if (LogDisabled) return;
        wr('e', sprintf.apply(null, arguments));
    }
    
var w = 
exports.w = 
exports.warn = 
/** 
 * log a warning message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.warning = 
    function warn(fmt) {
	if (LogDisabled) return;
            wr('w', sprintf.apply(null, arguments));
    }

var info = 
exports.i = 
/** 
 * log an information message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.info = 
    function info(fmt) {	// use info internally to avoid conflicts with local var i
	if (LogDisabled) return;
            wr('i', sprintf.apply(null, arguments));
    }
    
var d = 
exports.d =
/** 
 * log a debug message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.debug = 
    function debug(fmt) {
		if (LogDisabled) return;
        wr('d', sprintf.apply(null, arguments));
    }
    
var i = 
exports.v = 
/** 
 * log a verbose message 
 * @param {string} fmt - sprintf format string
 * @param {obj} ... - optional arguments matching fmt references
 */
exports.verbose = 
    function verbose(fmt) {
	if (LogDisabled) return;
            wr('v', sprintf.apply(null, arguments));
    }

    function wr(lev, s) {
//        if (!tags._L.enabled && lev!='W' && lev!='C' && lev!='V') return;
        if (logCnt==null) init();
        
        var levKey = (lev=='W' || lev=='C'? '__':'_')+lev;
        tags[levKey].cnt++;

        var tag = parseTag(s, lev=='V');
        tag.last = moment();
        tag.cnt++;
        if (lev=='T') return tag;
        if (lev=='W' || lev=='V')
            if (addWatch(tag) && lev=='W') return tag;  // log watch msg only the first time
        if (lev=='C')
            addCommand(tag);
//        if (!tags._L.enabled) return;
        logCnt++;
        if (!inBrowser) {
            LogLines.push( { cnt: logCnt, level: lev, tagnm: tag.nm, time: val('dtFmt'), val: tag.val });
            var m = sprintf('%03d %-s %s %s %s', logCnt, lev, tag.nm, tag.last.format(val('dtFmt')), tag.isVar? sprintf(' = %s(%s)',tag.val,tag.descr) : tag.val);
            if (tag.on) console.log(m + '\r');
            return tag;
        }
        
        var html = sprintf('<div id="logLine%d" class="log_grp log_grp__L log_grp_%s log_grp_l%s log_clr_%s"> ', logCnt, levKey, tag.key, lev );
        html += sprintf('<span class="log_grp log_grp_l_num log_clr_L">%03d</span> ', logCnt);
        html += sprintf('<span class="log_grp log_grp_l_lev">%-s</span> ', lev);
        html += sprintf('<span class="log_grp log_grp_l_tag">%s</span> ', tag.nm);
        html += sprintf('<span class="log_grp log_grp_l_dt" value="%d">%s</span> ', tag.last.valueOf(), tag.last.format(val('dtFmt')));
        if (tag.isVar)
            html += sprintf('<span class="log_grp log_grp_l_val"> = %s </span><span class="log_grp_l_descr">(%s)</span> </div> ', tag.val, tag.descr);
        else
            html += sprintf('<span class="log_grp log_grp_l_msg">%s</span> </div> ', tag.val);
        $('#logLog').append(html);
        updateGroups();
        return tag;
    }
    
    

