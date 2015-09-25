/*! ResponsiveList 0.0.1-dev
 */

/**
 * @summary     ResponsiveList
 * @description The HTML table to list style in the case if the screen width is narrow, and the other will be on the table style.
 * @version     0.0.1-dev
 * @file        dataTables.responsiveList.js
 * @author      Shingo Sugimoto
 * @contact     http://
 *
 * This source file is free software, available under the following license:
 *   MIT license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 */

(function(window, document, undefined) {

var factory = function($, DataTable) {
"use strict";

var ResponsiveList = function(settings, opts) {

	if (!DataTable.versionCheck || !DataTable.versionCheck('1.10.8')) {
		throw 'DataTables ResponsiveList requires DataTables 1.10.8 or newer';
	}

	this.s = {
		dt: new DataTable.Api(settings),
    sortAscOption: '&#x25B2; %s',
    sortDescOption: '&#x25BC; %s',
    //sortAsc: '&#x25B4; %s',
    //sortDesc: '&#x25BE; %s',
    sortSelectClass: 'form-control input-sm'
	};

	if (this.s.dt.settings()[0].responsiveList) {
		return;
	}

	if (opts && typeof opts.details === 'string') {
		opts.details = { type: opts.details };
	}

	this.c = $.extend(true, {}, ResponsiveList.defaults, DataTable.defaults.responsiveList, opts);
	settings.responsiveList = this;

	this._constructor();
};

$.extend(ResponsiveList.prototype, {

	_constructor: function ()
	{
    var self = this;
    var dt = this.s.dt;

		dt.settings()[0]._responsiveList = this;

    var $table = $('table', dt.table().container()).addClass('dt-reslist');

    var $tableSortSelect = $('<select class="form-control input-sm" />')
      .bind('change', function(e) {
        var colidx = parseInt($(this).val(), 10);
        var colord = $('OPTION:selected', this).attr('data-order');
        dt.order([colidx, colord]).draw();
      })
    ;

    var cols = 0, coltitles = [];
    var order = dt.order();
    if (Object.prototype.toString.call(order) !== '[object Array]') order = [];

    dt.columns().every(function (i) {
      var col = this;
      if (!col.visible()) return;

      var label = $(col.header()).text();
      coltitles.push(label);

    	var selasc = (order.length && order[0][0] == i && order[0][1] == 'asc') ? ' selected' : '';
    	var seldesc = (order.length && order[0][0] == i && order[0][1] == 'desc') ? ' selected' : '';

    	$tableSortSelect
    		.append(
    			$('<option '+selasc+' />').val(i).attr('data-col-index', i).attr('data-order', 'asc').html(self.s.sortAscOption.replace('%s', label))
    		)
    		.append(
    			$('<option '+seldesc+' />').val(i).attr('data-col-index', i).attr('data-order', 'desc').html(self.s.sortDescOption.replace('%s', label))
    		)
    	;

    } );

    var $thead = $('<thead class="dt-reslist-sort-select dt-reslist-none"><tr><th colspan="'+cols+'"></th></tr></thead>');
    $('th', $thead).eq(0).append($tableSortSelect);

    $('thead.dt-reslist-sort-select', $table).remove();
    $table.prepend($thead);

    $('tbody>tr', $table).each(function(r) {
      var $row = $(this);
      $('td, th', $row).each(function(c) {
        $(this).attr('data-title', coltitles[c]);
      } );
    } );

    dt.on('order.dt', function () {
      var order = dt.order();
      $('OPTION:selected', $tableSortSelect).prop('selected', false);
      $('OPTION[value='+order[0][0]+'][data-order='+order[0][1]+']', $tableSortSelect).prop('selected', true);
    } );
	}
} );

ResponsiveList.defaults = {
};

var Api = $.fn.dataTable.Api;

Api.register('responsiveList()', function () {
	return this;
} );

ResponsiveList.version = '0.0.1-dev';

$.fn.dataTable.ResponsiveList = ResponsiveList;
$.fn.DataTable.ResponsiveList = ResponsiveList;

$(document).on('init.dt.dtr', function (e, settings, json) {
	if (e.namespace !== 'dt') return;

	if ($(settings.nTable).hasClass('responsiveList') ||
		 $(settings.nTable).hasClass('dt-responsiveList') ||
		 settings.oInit.responsiveList ||
		 DataTable.defaults.responsiveList
	) {
		var init = settings.oInit.responsiveList;

		if (init !== false) {
			new ResponsiveList(settings, $.isPlainObject(init) ? init : {});
		}
	}
} );

return ResponsiveList;
}; // /factory


	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'datatables'], factory);
	}
	else if (typeof exports === 'object') {
		factory(require('jquery'), require('datatables'));
	}
	else if (jQuery && !jQuery.fn.dataTable.ResponsiveList) {
		factory(jQuery, jQuery.fn.dataTable);
	}

})(window, document);
