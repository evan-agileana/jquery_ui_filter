/**
 * @file
 * jQueryUiFilter widgets.
 */

(function ($, Drupal, drupalSettings) {

  "use strict";

  /**
   * The jQueryUiFilter represents an abstract instance of a jQuery UI filter accordion or tabs widget wrapper.
   *
   * @constructor Drupal.jQueryUiFilter
   *
   * @param {HTMLElement} node
   */
  function jQueryUiFilter(node) {
    if (!node) {
      return null;
    }

    this.$widget = $(node);
    this.role = this.$widget.attr('data-ui-role');
    this.options = this.getOptions();

    // DEBUG:
    // if (window.console) {console.log(node); console.log(this.role); console.log(this.options);}

    // Don't initialize the widget if there are no instances of the header tag.
    if (!this.$widget.find(this.options.headerTag).length) {
      return false;
    }

    this.init();

    if (this.setActive() && this.options.scrollTo) {
      this.scrollTo();
    }

    return true;
  }

  /**
   * Extend the jQueryUiFilter constructor.
   */
  $.extend(jQueryUiFilter, /** @lends Drupal.jQueryUiFilter */ {

    /**
     * Holds references to jQueryUiFilter accordion and tabs widget objects.
     *
     * @type {Array.<Drupal.jQueryUiFilter>}
     */
    widgets: [],

    /**
     * Holds references to instantiated jQueryUiFilter objects.
     *
     * @type {Array.<Drupal.jQueryUiFilter>}
     */
    instances: [],

    setActive: function () {
      $.each(jQueryUiFilter.instances, function () {
        this.setActive();
      })
    },

    setDefaultOptions: function () {
      for (var widgetName in jQueryUiFilter.widgets) {
        if (drupalSettings.jquery_ui_filter[widgetName].options.global) {
          $.extend(
            $.ui[widgetName].prototype.options,
            jQueryUiFilter.customOptions(drupalSettings.jquery_ui_filter[widgetName].options)
          );
        }
      }
    },

    customOptions: function(options) {
      if (options.collapsed) {
        options.collapsible = true;
        options.active = false;
      }

      if (options.scrollToOffset == 'auto') {
        options.scrollToOffset = parseInt($('body').css('padding-top')) + parseInt($('body').css('margin-top'));
      }
      return options;
    }

  });

  /**
   * Extend the jQueryUiFilter prototype.
   */
  $.extend(jQueryUiFilter.prototype, /** @lends Drupal.jQueryUiFilter# */ {

    /**
     * @method
     */
    init: function () {return false},

    /**
     * @method
     */
    setActive: function () {return false},

    /**
     * @method
     */
    scrollTo: function () {
      var offset = this.options.scrollToOffset;
      if (offset == 'auto') {
        offset = parseInt($('body').css('padding-top')) + parseInt($('body').css('margin-top'));
      }
      var top = this.$widget.offset().top - offset;
      $('html, body').animate({
        scrollTop: top
      }, this.options.scrollToDuration);
    },

    /**
     * @method
     */
    getOptions: function () {
      // Note: headerTag is the only required option.
      var options = $.extend({}, {headerTag: 'h3'}, drupalSettings.jquery_ui_filter[this.role].options);

      var widget = this.$widget[0];
      for (var i = 0; i < widget.attributes.length; i++) {
        if (widget.attributes[i].nodeName.indexOf('data-ui-') !== 0) {
          continue;
        }

        // Convert hyphen delimited to camel case which is used for jQuery UI option.
        // See: \Drupal\jquery_ui_filter\Plugin\Filter\jQueryUiFilter::parseOptions
        var name = widget.attributes[i].nodeName.substring(8).replace(/-([a-z])/g, function (i) { return i[1].toUpperCase(); });
        var value = widget.attributes[i].nodeValue;
        // Convert JSON to JavaScript array, object, boolean, number.
        if (value.match(/^(\[.*\]|\{.*\}|true|false|\d+)$/)) {
          try {
            value = JSON.parse(value);
          } catch (error) {
            if (window.console) {
              window.console.warning(error.message);
            }
          }
        }
        options[name] = value;
      }

      return jQueryUiFilter.customOptions(options);
    }
  });

  /**
   * Inherit the jQueryUiFilter class.
   */
  jQueryUiFilter.widgets.accordion = function () {
    // Call the parent jQueryUiFilter constructor.
    jQueryUiFilter.apply(this, arguments);
  };

  /**
   * Inherit the jQueryUiFilter prototype.
   */
  jQueryUiFilter.widgets.accordion.prototype = new jQueryUiFilter();

  /**
   * Extend the jQueryUiFilter.widgets.accordion prototype.
   */
  $.extend(jQueryUiFilter.widgets.accordion.prototype, /** @lends Drupal.jQueryUiFilter.widgets.accordion# */ {
    /**
     * @method
     */
    init: function () {
      var $widget = this.$widget,
        options = this.options,
        $container;

      $widget.children().each(function () {
        if (this.tagName.toLowerCase() == options.headerTag.toLowerCase()) {
          this.id = this.id || $(this).text().toLowerCase().replace(/[^-a-z0-9]+/gm, '-');
          $container = $('<div></div>').insertAfter(this);
        } else if ($container) {
          $container.append(this);
        }
      });

      $widget.accordion(options);
    },

    /**
     * @method
     */
    setActive: function (scrollTo) {
      if (!location.hash) {
        return false;
      }

      var $container = $(location.hash + '[role="tab"]', this.$widget);
      if (!$container.length) {
        return false;
      }

      var active = this.$widget.find(this.$widget.accordion('option', 'header')).index($container);

      this.$widget.accordion('option', 'active', active);
      return true;
    },

    getOptions: function () {
      // Call the parent jQueryUiFilter getOptions.
      var options = jQueryUiFilter.prototype.getOptions.call(this);

      // Set accordion header selector to the custom header tag.
      // This allows the accordion's default H3 header selector to be overridden.
      options.header = options.headerTag.toLowerCase();
      return options;
    }

  });

  /**
   * Inherit the jQueryUiFilter class.
   */
  jQueryUiFilter.widgets.tabs = function () {
    // Call the parent jQueryUiFilter constructor.
    jQueryUiFilter.apply(this, arguments);
  };

  /**
   * Inherit the jQueryUiFilter prototype.
   */
  jQueryUiFilter.widgets.tabs.prototype = new jQueryUiFilter();

  /**
   * Extend the jQueryUiFilter.widgets.tabs prototype.
   */
  $.extend(jQueryUiFilter.widgets.tabs.prototype, /** @lends Drupal.jQueryUiFilter.widgets.tabs# */ {
    /**
     * @method
     */
    init: function () {
      var $widget = this.$widget,
        options = this.options,
        id,
        $ul,
        $container;

      $widget.children().each(function () {
        if (this.tagName.toLowerCase() == options.headerTag.toLowerCase()) {
          // Get/define (current) tab id.
          id = this.id || $(this).text().toLowerCase().replace(/[^-a-z0-9]+/gm, '-');

          // Initialize tab (panel) container.
          $container = $('<div id="' + id + '"></div>').appendTo($widget);

          // Initialize tab list.
          if (!$ul) {
            $ul = $('<ul></ul>').insertBefore(this);
          }

          // Append header as an item (aka  tab) to the list
          $ul.append('<li><a href="#' + id + '">' + this.innerHTML + '</a></li>');

          // Destroy the header
          $(this).remove();

        } else if ($container) {

          // If a header tab has been found append this element to it's panel container.
          $($container).append(this);

        }
      });
      $widget.tabs(options);
    },

    /**
     * @method
     */
    setActive: function () {
      if (!location.hash) {
        return false;
      }

      var $container = $('li[role="tab"] a[href="' + location.hash + '"]', this.$widget);
      if (!$container.length) {
        return false;
      }

      var active = $container.parent().index();
      this.$widget.tabs('option', 'active', active);
      return true;
    }
  });

  // Expose constructor in the public space.
  Drupal.jQueryUiFilter = jQueryUiFilter;

  /**
   * jQuery UI filter behavior for accordion and tabs.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.jQueryUiFilter = {
    attach: function (context) {
      var initialize = function () {
        var role = $(this).attr('data-ui-role');
        var instance = new jQueryUiFilter.widgets[role](this);
        if (instance) {
          jQueryUiFilter.instances.push(instance);
        }
      };

      // Initialize nested widgets first
      // See: http://stackoverflow.com/questions/1542161/jquery-ui-accordions-within-tabs
      $('[data-ui-role="accordion"] [data-ui-role="tabs"]', context).each(initialize);
      $('[data-ui-role]', context).each(initialize);
    }
  };

  // Set default options.
  jQueryUiFilter.setDefaultOptions();

  // Hashchange event handler
  $(window).on('hashchange', jQueryUiFilter.setActive);

})(jQuery, Drupal, drupalSettings);
