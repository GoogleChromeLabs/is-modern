'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var clone = _interopDefault(require('clone'));
var deepMerge = _interopDefault(require('deepmerge'));
var xtype = _interopDefault(require('toybox-js-xtype'));
var renderNestedComponents = _interopDefault(require('toybox-js-render-nested-components'));
var parseVariables = _interopDefault(require('toybox-js-parse-variables'));
var jp = _interopDefault(require('jsonpath/jsonpath'));

/**
 * Renders a single component
 *
 * @export
 * @param {Object|Array} data Structured data to render into a component
 * @param {Object|Function} templates A template function or hash of template functions
 * used to render components
 * @param {Object} defaults An object with default values for the component
 * @param {String} [contextPath='$'] A JSONPath string for the location of the current context
 * @returns {String} A string with the rendered component
 */
function renderComponent(data, templates, defaults, contextPath) {
  if ( contextPath === void 0 ) contextPath = '$';

  // Return data if it is not an object or array
  if (!xtype.is(data, 'obj, arr') || !templates) { return data; }

  var _data = data;
  var _contextData = jp.value(data, contextPath);

  // Merge the component data with a clone of defaults
  if (xtype.is(defaults, 'obj')) {
    var defaultsClone = clone(defaults);
    _contextData = deepMerge(defaultsClone, _contextData);
    if (contextPath === '$') {
      _data = _contextData;
    } else {
      jp.apply(_data, contextPath, function () { return _contextData; });
    }
  }
  
  // Parse the variables in _data and interpolate them using the current contextPath
  _contextData = parseVariables(_data, templates, defaults, contextPath);

  // Render any nested components within _contextData
  for (var key in _contextData) {
    if (!_contextData.hasOwnProperty(key)) { return undefined; }
    if (_contextData[key]) {
      var childContextPath = contextPath + "." + key;
      _contextData[key] = renderNestedComponents(_data, templates, defaults, childContextPath);
    }
  }

  // If templates is a function, use it to render data
  if (typeof templates === 'function') { return templates(_contextData); }

  // If templates is an object, find the matching template function for the
  // __render key in data and return that template rendered with data
  if (xtype.is(templates, 'obj') && typeof _contextData.__render === 'string') {
    if (typeof templates[_contextData.__render] === 'function') {
      var templateFunction = templates[_contextData.__render];
      return templateFunction(_contextData);
    }
  }

  return _contextData;
}

module.exports = renderComponent;
