/**
 * gb53.net Ixi prototype 
 * @module gb53_Ixi
 */
'use strict';
import $ from 'jquery';
import moment from 'moment';
import sprintf from 'sprintf';
import * as Log from '../log/log';
import * as Ux from '../ux/ux';
import * as Ixi from '../ixi/ixi';
	
var Version = 'gb53_Ixi.js 12-Feb-16';

// exports:
//   Ixi.Version()
//	 Ixi.init( canvasID )
//	 xw = Ixi.ixiWorld( worldname )
//   xsp = xw.ixiSpace( spacenm )
//   xo = xw.ixiObj( typename )
//   xo = xsp.ixiObj( typename ) 
//   xo.defType( typename, { attributes } );
//   xo.defTypes( spacename, 'chain1top:c1nxt:c1bot,typ2,t31:t32' )

/** get Version string
 * @returns {string} version as 'filename.js date'
 */
export function Version(){ 
		return Version; 
}

/** initialize Ixi
 */
var ixiCanvSel, ixiContext, ixiRectangle;
export function ixiCtx(){ return ixiContext; }
export function ixiRect(){ return ixiRectangle; }

/** initialize Ixi module
 *  module static method
 *    e.g. Ixi = require('gb53_Ixi');  Ixi.init('ixiCanvas');
 * @parm {string} [identifier of Html canvas element for display]
 */
export function init(canvasID) {
		Log.i("version: %s -- gb53.net Ixi", Version);
		
		if (canvasID!==undefined){
			var canvEl = document.getElementById(canvasID);
			if (!canvEl) return;
			ixiCanvSel = '#' + canvasID;
			
			ixiContext = canvEl.getContext('2d');
			canvEl.width = canvEl.clientWidth;
			canvEl.height = canvEl.clientHeight;
			
			ixiRectangle = { lx:0, ty:0, w: canvEl.width, h: canvEl.height };
		}
	}


var IXI_Worlds = {  };  // allow for alternate worlds later

function IxiError(message){
	this.message = message;
	this.name = 'IxiError';
}

/** fetch or allocate an ixi 'world'
 *  module static method
 *    e.g. Ixi = require('gb53_Ixi');  xP1 = Ixi.World('plan1');
 *    no 'new' keyword required
 * @parm {string} name of Ixi world ['default']
 * @returns {world} ixiObject of type 'world'
 */
export function ixiWorld( worldname ){
		worldname =	worldname || 'default';
		if ( IXI_Worlds[worldname] === undefined ) {
			IXI_Worlds[worldname] = { w: addWorld(worldname), comments: [] }; }
		return IXI_Worlds[worldname].w;
	}
export function worldNames(){
		var nms = 'default';
		for (var i in IXI_Worlds)
			if (i!=='default')
				nms += ',' + i;
		return nms;
}

/** allocate and initialize a new ixiObject world object named 'nm'
 * @parm {string} name of Ixi world ['default']
 * @returns {world} object
 */
function addWorld( worldname, kind){
	var w;
	if (worldname=='default'){
		w = new ixiObjCLS();	// initialize just enough so defType will work
		IXI_Worlds['default'] = w
		w.ixiID = 'World_0';
		w.ixiWorld = w;
		w.types = {	type_Type: { instances: [], nextID: 1, formats: [] },
					type_Space: { instances: [], nextID: 1, formats: [] } };
		w.types.type_Type.attributes = { instances: [], nextID: 1, formats: [] };
		w.spaces = {};
		
		w.defType('Type', { instances: [], nextID: 1, formats: [] } );
		var ixityp = w.types['type_Type']; // newly created one
		ixityp.instances.push(ixityp);
		ixityp.nextID = 2;
		w.defType('Space', { chains: [] }, '' );
		w.defType('World', { types: {}, spaces: {}, kind: 'real|fictional|plan' }, '' );
		var nw = allocIxiObject(w, 'World', worldname);  // replace with properly allocated ixiObj
		nw.types = w.types;
	//	nw.ixiSpace = nw.gSpace('gl');
		nw.ixiWorld = nw;					// then fix links to the temporary one
		nw.types.type_Type.ixiWorld = nw;
		nw.types.type_Space.ixiWorld = nw;
		nw.types.type_World.ixiWorld = nw;
		IXI_Worlds['default'] = nw;
		w = nw;
	}
	else
		w = allocIxiObject(w, 'World', worldname);  // to get prototypes
	
	// w.ixiID, w.ixiType & prototypes are now defined
	// initialization
	w.nm = worldname; 
	w.IXI = Ixi;
	w.defType('Time',  { moment: 'moment' }, '');
	w.defType('Place', { latitude: 'range(-90,90)', longitude: 'range(-180,180)', boundary: '' }, '' );
	w.defType('Event', { begin: 'Time', end: 'Time', location: 'Place' }, '' );
	w.setAttribute('kind', kind || 'real' );
	
//	w.defTypes('geo', 'Planet:Continent,Nation:State:County:City:Neighborhood,Metro' );
//	w.defTypes('tm', 'Century:Decade:Year:Month:Week:Day:Hour:Minute:Second' );
	return w;
}

var ixiJqSel, ixiJqTextSel,ixiW, uxWorld='default', uxType='Type', uxInstance='Type_1', uxLevel='1';
function onIxiUxChange(){
	uxWorld = UX.selectVal('ixi_world');
	uxType = UX.selectVal('ixi_type');
	uxInstance = UX.selectVal('ixi_inst');
	uxLevel = UX.selectVal('ixi_lev');
		genIxiUX();
	}

export function genIxiUX(w, jqSel, jqTextSel){
		$('.a_ixi').off('change', '');
	if (w!=undefined) ixiW = w;
	var html = '';
	if (uxWorld==undefined)
		uxWorld = 'default';
	var w = IXI_Worlds[uxWorld].w;
	html += UX.genSelect('World: ', 'ixi_world', 'ixi a_ixi', worldNames(), uxWorld );
	html += UX.genSelect('Type: ', 'ixi_type', 'ixi a_ixi', w.typeNames(), uxType );
	var instances = w.instanceNames(uxType)
	html += UX.genSelect('Instances: ', 'ixi_inst', 'ixi a_ixi', instances, uxInstance );
	html += UX.genSelect('Level: ', 'ixi_lev', 'ixi a_ixi', '0,1,2,3,4,5,6,7,8,9', uxLevel);
	html += UX.genButton('Save', 'ixi_load', 'ixi a_ixiload');
	html += UX.genButton('Load', 'ixi_save', 'ixi a_ixiload') + '<br>';
	if (jqSel != undefined) ixiJqSel = jqSel;
	if (jqTextSel != undefined) ixiJqTextSel = jqTextSel;
	$(ixiJqSel).html( html );
	if (uxInstance!=undefined)
		$(ixiJqTextSel).val( ixiW.as(uxInstance).asS(uxLevel));
	$('.a_ixi').on('change', '', onIxiUxChange);
	$('.a_ixiload').on('click', '', onIxiUxButton);
}

function onIxiUxButton(ev){
	var cmd = $(ev.target).text();
	if (cmd=='Save'){
		var wrld = IXI_Worlds[uxWorld];
		if (wrld==undefined || wrld.w.ixiID != 'World_1') 
		{ 
			UX.msg('Select World to save first'); 
			return; 
		}
		var w = wrld.w;
		var dt = moment().format('DD-MMM-YYYY');
		var text = sprintf('// IxiWorld "%1$s" saved on %2$s as %1$s-%2$s.ixi\r\n', uxWorld, dt);
		for (var i=0; i<wrld.comments.length; i++) text += '//' + wrld.comments[i] + '\r\n';
		for (var t in w.types){
			text += '\r\n';
			var inst = w.types[t].instances;
			for (var i=0; i<inst.length; i++)
				text += sprintf('%s\r\n%s\r\n', inst[i].ixiID, w.asText(inst[i]));
		}
		$(ixiJqTextSel).val( text );
	}
	if (cmd=='Load') 
	  loadIxi('world.ixi');
}

export function loadIxi(url){
		//$('#nfli_url').text( url );
	UX.msg('loading %s...', url)
	$.get( url, function(data, status, jqXHR){ 
		var lines = data.split('\n');
		var worldObjs = {};
		var idx=0;
		var comments = [];
		while (idx < lines.length){
			if (lines[idx].trim()=='')
				idx++;
			else if (lines[idx].startsWith('//')){
				comments.push(lines[idx].substr(2));
				idx++;
			} else {
				var ixiID = lines[idx].trim();   // strip off \r 
				var ixiJSON = lines[idx+1].trim();
				var ixiObj = new ixiObjCLS();
				var ixiVal = JSON.parse(ixiJSON);
				ixiObj.merge(ixiVal);
				if (ixiID!=ixiObj.ixiID)
					UX.msg('LoadIxi: instance '+ixiID+' ixiID did not match');
				worldObjs[ixiID] = ixiObj;
				idx += 2;
			}
		}
		var ixiw  = worldObjs['World_1'];	// object that will be the new ixiWorld
		for (var io in worldObjs){
			worldObjs[io] = fixLinks(worldObjs, worldObjs[io]);
			worldObjs[io].ixiWorld = ixiw;
		}
		ixiw.IXI = Ixi;	
		IXI_Worlds['loaded_'+moment().format('HH:MM')] = { w: ixiw, comments: comments };
	});
}
function fixLinks(iximap, ixiobj){
    if (ixiobj instanceof Array) {
        for (var i = 0; i<ixiobj.length;  i++)
            ixiobj[i] = fixLinks(iximap, ixiobj[i]);
        return ixiobj;
    }
    if (ixiobj instanceof Object) {
        for (var attr in ixiobj) 
            if (ixiobj.hasOwnProperty(attr) && attr!='ixiID')
	            ixiobj[attr] = fixLinks(iximap, ixiobj[attr]);
        return ixiobj;
    }
    if (typeof ixiobj == 'string'){
    	var parts = ixiobj.split(',');
    	if (parts[0]=='ixiIDs:'){
	    	var ixiarray = [];
	    	for (var i = 1; i<parts.length; i++)
	    		ixiarray.push(iximap[parts[i]]);
	    	return ixiarray;
    	}
    	if (iximap[parts[0]]!=undefined) 
    		return iximap[parts[0]];
    	return ixiobj;
    }
	return ixiobj;
}
var allocIxiObject =
	function allocIxiObject( w, typename, objname, initialvalues ){
		var obj = new ixiObjCLS();	// get ixiObjCLS prototypes
		if (w.typName()=='Space'){
			 typename = w.nm + typename;
			 w = w.ixiWorld;
		}
		obj.ixiWorld = w;
		var typ = w.gType( typename );
		if (typ==undefined) throw new IxiError('typename "'+typename+'" -- not a defined Ixi type')
		obj.ixiID = sprintf('%s_%d', typename, typ.nextID);
		typ.nextID++;
		typ.instances.push(obj);
		if (objname!=undefined) obj.nm = objname;
		obj.merge( typ.attributes );
		obj.merge( initialvalues );
		return obj;
	}
function ixiObjCLS(){ } // just for 'new' call -- to get prototypes
	

function initVal(s){
	// given definition of attribute, return value to initialize an instance
	if (typeof s == 'string' && s.indexOf('|') >= 0) 
		return s.substr(0,s.indexOf('|'));
	return s;
}

ixiObjCLS.prototype.merge = function merge(obj){
	if (obj == undefined) return;
	for (var i in obj)
		this[i] = simple_clone(obj[i], this.ixiWorld);
}
function isIxiObj(o, w){
	if (typeof o.ixiID != 'string') return false;
	if (o.ixiWorld != w) return false;
	return true;
}
function simple_clone(obj, w) {  // objects, arrays, literals
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0; i<obj.length;  i++) {
            copy[i] = simple_clone(obj[i], w);
        }
        return copy;
    }
    if (obj instanceof Object) {
    	if (isIxiObj(obj, w)) return obj;	// don't copy ixiObjs
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
        		copy[attr] = simple_clone(obj[attr], w);
            }
        }
        return copy;
    }
    return obj;
}

ixiObjCLS.prototype.defType = function defType(typename, attrs){
	attrs = attrs || {};	// fields to be copied to each instance
	var w = this.ixiWorld;
	var typ = allocIxiObject(w, 'Type', typename );
	w.types['type_'+typename] = typ;
	typ.attributes = attrs;
//	w.types['type_'+typename] = { nm: typename, attributes: attrs, nextID: 1, formats: {}, instances: {} };
	// w().defType(defn)
	// eg: 'game[ home: type_team, away: type_team, kickoff: type_time, location: type_stadium, plays: type_play }' );
	// eg: 'team[ home: type_team, away: type_team, kickoff: type_time, location: type_stadium, plays: type_play }' );
//		return w.types['type_'+tname];  //?
}
ixiObjCLS.prototype.addTypeFormat = function addTypeFormat(tname, level, fmt){
	var typ = gType(tname);
	typ.formats[level] = fmt;
	// w().addTypeFormat('game', 0, '%(homeTeam.id)s');
	// w().addTypeFormat('game', 1, '%(homeTeam.id)s %(homeScore)d @ %(awayTeam.id)s %(awayScore)d');
}

ixiObjCLS.prototype.typName = function typName(typeNmOrID){
	if (typeNmOrID==undefined) typeNmOrID = this.ixiID;
	return typeNmOrID.split('_')[0];
}
ixiObjCLS.prototype.typNum = function typNum(typeNmOrID){
	if (typeNmOrID==undefined) typeNmOrID = this.ixiID;
	return typeNmOrID.split('_')[1];
}


ixiObjCLS.prototype.gType = function gType(typeNmOrID){
	var typename = this.typName(typeNmOrID);
	var typ = this.ixiWorld.types['type_'+typename];
	if (typ==undefined)
		throw new IxiError('gType: "'+typename+'" is not defined.');
	return typ;
}

ixiObjCLS.prototype.setAttribute = function setAttribute(attr, val){
	this[attr] = val;
}

/** find ixiObject of type 'ixiSpace' named 'spacename'  -- or create it
 *  module static method
 *    e.g. Ixi = require('gb53_Ixi');  xNfl = Ixi.ixiWorld().ixiSpace( 'Nfl' );
 *    no 'new' keyword required
 * @parm {string} name of Ixi space [ 'gl' ] 
 * @returns {ixiSpace} object  (with ixiID)
 */
ixiObjCLS.prototype.gSpace =
	function gSpace( spaceOrTypeName ){
		if (typeof spaceOrTypeName == 'object' && spaceOrTypeName.ixiType == 'Space')
			return spaceOrTypeName;
		var typ = this.ixiWorld.gType(spaceOrTypeName);
		return typ.ixiSpace;
//			
//			var w = this.ixiWorld;
//			if (spaceOrTypeName=='') return null;
//			if (spaceOrName==undefined) spaceOrName = 'gl';
//			var sp = (typeof spaceOrName=='object')? spaceOrName : w.spaces[spaceOrName];
//			if (sp==undefined){
//				sp = allocIxiObject(w, 'ixiSpace', '', spaceOrName);  // explicitly NOT in a space: ''
//				sp.ixiSpace = sp;
//				w.spaces[spaceOrName] = sp;
//			}
//			return sp;
	}


ixiObjCLS.prototype.defTypes = function defTypes(ixiSpaceName, definitions){
	// xNfl = Ixi.World().defTypes('Nfl', 
	//    	'League:Conference:Division:Team,Season:Game:Possession:Series:Play');
	var sp = this.ixiWorld.spaces[ixiSpaceName];
	if (sp==undefined){
		//sp = this.gSpace( ixiSpaceName );
		sp = allocIxiObject(this.ixiWorld, 'Space', ixiSpaceName);  // explicitly NOT in a space: ''
//			sp.ixiSpace = sp;
//			w.spaces[spaceOrName] = sp;
	}
	var chains = definitions.split(',');
	for (var ch in chains){
		sp.chains.push( chains[ch] );
		var ixitypes = chains[ch].split(':');
		var prevTypnm = null;
		for (var i = 0; i<ixitypes.length; i++){
			var typnm = ixiSpaceName + ixitypes[i];	// e.g. 'NflGame'
			if (this.ixiWorld.types['type_'+typnm]==undefined)
				this.defType( typnm );
			this.ixiWorld.types['type_'+typnm].inType = prevTypnm;
			prevTypnm = typnm;
		}
	}
	return sp;
}

/** method to fetch ixiObject
 *  as ixiWorld instance method
 *    e.g. us = Ixi.world().as('Nation_17'); 
 * @parm {string} ixi object identifier 
 * @returns {object} named ixiObject or undefined if it doesn't exist
 */
ixiObjCLS.prototype.as = ixiObjCLS.prototype.asObj = function asObj(ixiID){
	if (ixiID==undefined || ixiID==null || ixiID=='') return undefined;
	var typ = this.gType(ixiID);
	if (typ==undefined) return undefined;
	return typ.instances[this.typNum(ixiID)-1];
	// p1 = Ixi.world('plan1'); loc = p1.as('glPlace_198');
}
ixiObjCLS.prototype.asA = ixiObjCLS.prototype.asArr =	function asA(ids, filterfn){ 
	var typ = this.gType(typName);
	var res = [];
	var idlst = ids.split(',');
	for (var i in idlst){
		var o = this.asObj(idlst[i]);
		if (filterfn==undefined || filterfn(o))
			res.push( o );
	}
	return res;
}

ixiObjCLS.prototype.asNew = function asNew(ixiTypeName, objNameOrNames, objInitialValue){
	// cGame = xNfl.asNew('Game'); cGame.homeTeam = xNfl.find('Team', 'id:SEA');  
	//   or
	// cGame = xNfl.asNew('Game', '', { homeTeam:  xNfl.find('Team', 'id:SEA') } );
	// tms = xNfl.asNew('Team', 'SEA,ARI,SF,STL' );
	// cPos = xNfl.asNew('Possession', undefined, { offense: 'SEA', defense: 'STL' } );
	// cSeries = xNfl.asNew('Series', '', { inPossession: cPos.ixiID } ); 
//		if (this.typName()=='ixiSpace') ixiTypeName = this.nm + ixiTypeName;
	var obj = objInitialValue || {};
	if (typeof objNameOrNames=='object') { obj = objNameOrNames; objNameOrNames = ''; }
	var nms = objNameOrNames || '';
	if (this.typName()=='Space')
	  ixiTypeName = this.nm + ixiTypeName;
	nms = nms.split(',');
	if (nms.length==1)
		return allocIxiObject(this.ixiWorld, ixiTypeName, nms[0], obj);
	
	var o = {};
	for (var i in nms)
		o[nms[i]] = allocIxiObject(this.world, ixiTypeName, nms[i], obj);
	return o;
}
function filterObj(obj, filter){
	if (typeof filter=='function') return filter(obj);
	if (typeof filter!='object') return false;
	for (var i in filter)
		if ( obj[i] != filter[i] ) // TODO: ?? allow ops other than == ?
			return false;
	return true;
}
ixiObjCLS.prototype.getInstances = function getInstances(ixiTypeName){
	return this.gType(ixiTypeName).instances;
}
ixiObjCLS.prototype.gIxi = function gIxi(ixiArray, filter, asArray){
	if (typeof ixiArray == 'string')
		ixiArray = this.getInstances(ixiArray);
	var res = [];
	for (var i in ixiArray){
		if ( filterObj(ixiArray[i], filter) )
				res.push(ixiArray[i]);
	}
	if (asArray)
		return res;
	return res.length==0? null : (res.length==1? res[0] : res);
}

/** return string for object
 *  as class instance method
 *    e.g. Ixi = require('gb53_ixi');  o=Ixi.world(); res = o.toString();
 * @returns {string} for object
 */
ixiObjCLS.prototype.asString = ixiObjCLS.prototype.asS = 
	function asString(level){
		var typ = this.gType(this.ixiID);
		var fmt = typ.formats[level];
		if (fmt!=undefined){
			if (typeof fmt == 'string') return sprintf(fmt, this);
			if (typeof fmt == 'function') return fmt(this);
		}
		if (level==0) 
			return this.nm==undefined? this.ixiID : this.nm;
		if (level==1)
			return sprintf(' %s:%s{%s}',this.nm==undefined? '':this.nm, this.ixiID, Object.keys(this).join(','));
		return this.asText(this);
}
ixiObjCLS.prototype.asText = 
	function asText(obj){
		var txt = '';
		if (obj==undefined) return 'undefined';
		if (obj instanceof Array) {
			if (obj.length==0) 
				return '[ ]';
			var ixiArr = true;
			for (var i = 0; i<obj.length;  i++)
				if (!(obj[i] instanceof Object && obj[i].ixiID!=undefined)) ixiArr = false;
			if (ixiArr){
				txt += '"ixiIDs:,' + obj[0].ixiID;
				for (var i = 1; i<obj.length; i++)
					txt += ',' + obj[i].ixiID;
				return txt + '"';
			}
			txt += '[ ';
			for (var i=0; i<obj.length; i++)
				txt += (i==0? '':', ') + this.asText( obj[i] );
			return txt + ' ]';
		}
	    if (obj instanceof Object) {
	    	var first = '';
	    	txt += '{ ';
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr) && attr!='ixiWorld'){
	            	if (obj[attr] instanceof Object && obj[attr].ixiID!=undefined)
	            		txt += first + '"' + attr + '": "' + obj[attr].ixiID + '"';
	            	else
	            		txt += first + '"' + attr + '": ' + this.asText(obj[attr]);
	            	first = ', ';
	            }
	        }
	        return txt + ' }';
	    }
	    if (obj===null) return '"null"';
	    return '"' + obj.toString() + '"';
}
ixiObjCLS.prototype.asLink = 
	function asLink(obj){
		if (obj instanceof ixiObjCLS) return (obj.nm? obj.nm : obj.ixiID) + '|' + obj.ixiID;
		return '';
	}
ixiObjCLS.prototype.asLinks = 
	function asLinks(obj){
		var txt = '';
		if (obj==undefined || obj==null) return '';
		if (obj instanceof Array) {
			for (var i=0; i<obj.length; i++)
				txt += obj[i] instanceof ixiObjCLS? ','+this.asLink(obj[i]) : this.asLinks( obj[i] );
			return txt;
		}
	    if (obj instanceof Object) {
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr) && attr!='ixiWorld')
	            	txt += obj[attr] instanceof ixiObjCLS? ','+this.asLink(obj[attr]) : this.asLinks( obj[attr] );
	        }
	        return txt;
	    }
	    return '';
	}

ixiObjCLS.prototype.typeNames = function typeNames(){ 
	var typ = this.gType();
	var prefix = 'type_';
	if (typ.ixiSpace!=undefined)  // just return types in this ixiSpace
		prefix += typ.ixiSpace;
	var nms = '';
	var plen = prefix.length;
	for (var i in this.ixiWorld.types)
		if (i.startsWith(prefix))
			nms += (nms==''? '':',') + i.substr(plen); // + '|'+typ.asS();
	return nms;
}

ixiObjCLS.prototype.instanceNames =	function instanceNames(ixiTypeName, filterFn){ 
	var typ = this.gType(ixiTypeName);
	var nms = '';
	for (var i in typ.instances){
		var o = typ.instances[i];
		if (filterFn==undefined || filterFn(o))
			nms += (nms==''? '':',') + o.ixiID + '|' + o.asS(0);
	}
	return nms;
}
