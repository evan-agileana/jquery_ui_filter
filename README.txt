CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Usage
 * Features
 * Installation
 * Similar Modules
 * Issues

INTRODUCTION
------------

The jQueryUI filter converts static HTML to a jQuery UI accordion or tabs widget.

For example, this module converts the below HTML code into a
collapsed jQueryUI accordion widget.

<p>[accordion collapsed]</p>

  <h3>Section I</h3>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>

  <h3>Section II</h3>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>

  <h3>Section III</h3>
  <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>

<p>[/accordion]</p>

Learn more about jQueryUI's accordion and tabs widget.
- http://jqueryui.com/demos/accordion/
- http://jqueryui.com/demos/tabs/

Roll your own custom jQueryUI theme
- http://jqueryui.com/themeroller/


USAGE
-----

Use [accordion] and [/accordion] or [tabs] and [/tabs] to create a jQuery UI
Accordion or tabs. Using [accordion collapsed] will start with the accordion
closed.


FEATURES
--------

- Supports all jQuery UI accordion and tabs options.

- Adds bookmark support to accordions and tabs.

- Scrolls to bookmarked accordion or tab.

- Gracefully degrades when JavaScript is disabled.


INSTALLATION
------------

1. Copy/upload the jquery_ui_filter.module to the modules directory of your
   Drupal installation.

2. Enable the 'jQueryUI filter' modules in 'Extend'. (admin/modules)

3. Visit the 'Configuration > Content authoring > Text formats and editors'
   (admin/config/content/formats).

4. Enable (check) the jQueryUI filter under the list of filters and save
   the configuration.

5. IMPORTANT: In 'Filter processing order', the 'jQuery UI accordion and
   tabs widgets' filter must be after the 'Correct faulty and chopped off HTML' filter.

6. (optional) Visit the 'Configuration > Content authoring > Text formats and editors > jQuery UI filter'
   (admin/config/content/formats/jquery_ui_filter).



SIMILAR MODULES
---------------

Tabs

- Quick tabs: Create blocks of tabbed views and blocks.
  http://drupal.org/project/quicktabs


AUTHOR/MAINTAINER
-----------------

- Jacob Rockowitz
  http://drupal.org/user/371407
