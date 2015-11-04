<?php

/**
 * @file
 * Contains \Drupal\jquery_ui_filter\Plugin\Filter\jQueryUiFilter.
 */

namespace Drupal\jquery_ui_filter\Plugin\Filter;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Template\Attribute;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;

/**
 * Provides a filter to generate jQuery UI accordion and tabs widgets.
 *
 * @Filter(
 *   id = "jquery_ui_filter",
 *   module = "jquery_ui_filter",
 *   title = @Translation("jQuery UI accordion and tabs widgets"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_MARKUP_LANGUAGE
 * )
 */
class jQueryUiFilter extends FilterBase {

  /**
   * Supported jQuery UI widgets
   *
   * @var array
   */
  public static $widgets = [
    'accordion' => [
      'title' => 'Accordion',
      'api' => 'https://api.jqueryui.com/accordion/',
      'options' => [
        'headerTag' => 'h2',
        'scrollTo' => TRUE,
        'scrollToDuration' => 500,
        'scrollToOffset' => 0,
      ],
    ],
    'tabs' => [
      'title' => 'Tabs',
      'api' => 'https://api.jqueryui.com/tabs/',
      'options' => [
        'headerTag' => 'h3',
        'scrollTo' => TRUE,
        'scrollToDuration' => 500,
        'scrollToOffset' => 0,
      ],
    ],
  ];

  /**
   * {@inheritdoc}
   */
  public function process($text, $langcode) {
    $result = new FilterProcessResult($text);

    // Track if widget has been found so that we can attached the
    // jquery_ui_filter library and settings.
    $has_widget = FALSE;
    foreach (jQueryUiFilter::$widgets as $name => $widget) {
      if (strpos($text, '[' . $name) === FALSE) {
        continue;
      }
      $has_widget = TRUE;

      // Remove block tags around tokens.
      $text = preg_replace('#<(p|div)[^>]*>\s*(\[/?' . $name . '[^]]*\])\s*</\1>#', '\2', $text);

      // Convert tokens to <div>'s with data-ui-* attributes.
      $text = preg_replace_callback('#\[' . $name . '([^]]*)?\](.*?)\[/' . $name . '\]#is',  function ($match) use ($name) {
        // Set data-ui-* attributes from role and options.
        $attributes = ['data-ui-role' => $name];
        $options = $this->parseOptions($match[1]);
        foreach ($options as $name => $value) {
          $attributes['data-ui-' . $name] = $value;
        }

        $build = [
          '#prefix' => new FormattableMarkup('<div@attributes>', ['@attributes' => new Attribute($attributes)]),
          '#markup' => $match[2],
          '#suffix' => '</div>',
        ];
        return \Drupal::service('renderer')->renderPlain($build);
      }, $text);
    }

    // Associate assets to be attached.
    if ($has_widget) {
      $result->setAttachments(array(
        'library' => ['jquery_ui_filter/jquery_ui_filter'],
        'drupalSettings' => ['jquery_ui_filter' => \Drupal::config('jquery_ui_filter.settings')->get()],
      ));
    }

    return $result->setProcessedText($text);
  }

  /**
   * {@inheritdoc}
   */
  public function tips($long = FALSE) {
    $build = [];
    foreach ($this->widgets as $name => $widget) {
      $t_args = [
        '@title' => $widget['title'],
        '@name' => $name,
        '@tag' => \Drupal::config('jquery_ui_filter.settings')->get($name . '.options.headerTag') ?: 'h3',
        '@href' => "http://jqueryui.com/demos/$name/",
      ];
      $build[$name] = [
        '#markup' => $this->t('Use [@name] and [/@name] with @tag header tags to create a jQuery UI <a href="@href">@title</a> widget.', $t_args),
      ];
    }
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['settings'] = [
      '#markup' => $this->t('See the <a href="@href">jQuery UI filter</a> settings form to modify the accordion and tabs widget\'s global settings', ['@href' => \Drupal::url('jquery_ui_filter.settings')]),
    ];
    return $form;
  }

  /**
   * Parse options from an attributes string.
   *
   * @param string $text
   *   A string of options.
   *
   * @return array
   *   An associative array of parsed name/value pairs.
   */
  public function parseOptions($text) {
    // Create a DomElement so that we can parse its attributes as options.
    $html = Html::load('<div ' . html_entity_decode($text) . ' />');
    $dom_node = $html->getElementsByTagName('div')->item(0);

    $options = [];
    foreach ($dom_node->attributes as $attribute_name => $attribute_node) {
      $options[$attribute_name] = $attribute_node->nodeValue ?: 'true';
    }
    return $options;
  }

}
