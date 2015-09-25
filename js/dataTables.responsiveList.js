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
	};

	if (this.s.dt.settings()[0].responsiveList) {
		return;
	}

	if (opts && typeof opts.details === 'string') {
		opts.details = { type: opts.details };
	}

	this.c = $.extend(true, {}, ResponsiveList.defaults, DataTable.defaults.responsiveList, opts);
	settings.responsiveList = this;

	this.dom = {
    table: null,
    sortSelect: null
  };

  var dtSettings = this.s.dt.settings()[0];
  dtSettings._colTitles = [];

	this._constructor();
};

$.extend(ResponsiveList.prototype, {

	_constructor: function ()
	{
    var self = this;
    var dt = this.s.dt;

		dt.settings()[0]._responsiveList = this;

    this.dom.table = $('table', dt.table().container()).addClass('dt-reslist');

    this.dom.sortSelect = $('<select />')
      .addClass(this.c.sortSelectClass)
      .on('change', function(e) {
        var colidx = parseInt($(this).val(), 10);
        var colord = $('OPTION:selected', this).attr('data-order');
        dt.order([colidx, colord]).draw();
      })
    ;

    var $thead = $('<thead class="dt-reslist-sort-select dt-reslist-none"><tr><th colspan="0"></th></tr></thead>');
    $('th', $thead).eq(0).append(this.dom.sortSelect);

    $('thead.dt-reslist-sort-select', this.dom.table).remove();
    this.dom.table.prepend($thead);

    self._initSortSelect();
    self._drawTable();

    dt.on('column-visibility.dt', function (e, settings, column, state) {
      self._initSortSelect();
    } );

    dt.on('page.dt', function () {
      self._drawTable();
    } );

    dt.on('draw.dt', function () {
      self._drawTable();
    } );

    dt.on('order.dt', function () {
      self._orderChanged();
    } );
	},

	_orderChanged: function ()
	{
    var order = this.s.dt.order();
    $('OPTION:selected', this.dom.sortSelect).prop('selected', false);
    $('OPTION[value='+order[0][0]+'][data-order='+order[0][1]+']', this.dom.sortSelect).prop('selected', true);
  },

	_initSortSelect: function ()
	{
    var self = this;
    var order = self.s.dt.order();
    var dtSettings = self.s.dt.settings()[0];
    dtSettings._colTitles = [];

    $('thead.dt-reslist-sort-select tr th', this.dom.table)
      .attr('colspan', this.s.dt.columns().visible().length)
    ;
    this.dom.sortSelect.empty();

    this.s.dt.columns().every(function (i) {
      var col = this;
      if (!col.visible()) return;

      var label = $(col.header()).text();
      dtSettings._colTitles.push(label);

    	var selasc = (order.length && order[0][0] == i && order[0][1] == 'asc') ? ' selected' : '';
    	var seldesc = (order.length && order[0][0] == i && order[0][1] == 'desc') ? ' selected' : '';

    	self.dom.sortSelect
    		.append(
    			$('<option '+selasc+' />')
            .val(i)
            .attr('data-col-index', i)
            .attr('data-order', 'asc')
            .html(self.c.sortAscOption.replace('%s', label))
    		)
    		.append(
    			$('<option '+seldesc+' />')
            .val(i)
            .attr('data-col-index', i)
            .attr('data-order', 'desc')
            .html(self.c.sortDescOption.replace('%s', label))
    		)
    	;
    } );
  },

	_drawTable: function ()
	{
    var dtSettings = this.s.dt.settings()[0];

    $('tbody>tr', this.dom.table).each(function(r) {
      var $row = $(this);
      $('td, th', $row).each(function(c) {
        $(this).attr('data-title', dtSettings._colTitles[c]);
      } );
    } );
  }

} );

ResponsiveList.defaults = {
  sortAscOption: '&#x25B2; %s',
  sortDescOption: '&#x25BC; %s',
  //sortAsc: '&#x25B4; %s',
  //sortDesc: '&#x25BE; %s',
  sortSelectClass: ''
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
