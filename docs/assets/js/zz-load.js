var zzLoad = (function () {
	'use strict';

	/**
	 * @module
	 * @licence MIT
	 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
	 */
	// ----------------------------------------
	// Exports
	// ----------------------------------------

	var attrs = {
	  isObserved: 'data-zzload-is-observed',
	  isProcessed: 'data-zzload-is-processed',
	  isLoaded: 'data-zzload-is-loaded',
	  isFailed: 'data-zzload-is-failed',
	  isInView: 'data-zzload-is-inview',
	  sourceImg: 'data-zzload-source-img',
	  sourceSrcSet: 'data-zzload-source-srcset',
	  sourceBgImg: 'data-zzload-source-background-img',
	  sourceImage: 'data-zzload-source-image',
	  sourceIframe: 'data-zzload-source-iframe',
	  sourceContainer: 'data-zzload-container',
	  sourceInview: 'data-zzload-inview'
	};
	var events = {
	  observed: 'zzload:observed',
	  processed: 'zzload:processed',
	  loaded: 'zzload:loaded',
	  failed: 'zzload:failed',
	  inView: 'zzload:inView',
	  outOfView: 'zzload:outOfView'
	};

	// Private
	// ----------------------------------------

	/**
	 * @type {zzLoadOptions}
	 * @private
	 */

	var _defaultOptions = {
	  rootMargin: '0px',
	  threshold: 0,
	  clearSourceAttrs: false,
	  setSourcesOnlyOnLoad: true,
	  onProcessStart: function onProcessStart() {},
	  onLoad: function onLoad() {},
	  onError: function onError() {}
	};
	/**
	 * @param {Object} userOptions
	 * @return {Object}
	 * @private
	 */

	var _extend = function _extend() {
	  var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var options = {};

	  for (var key in _defaultOptions) {
	    options[key] = userOptions.hasOwnProperty(key) ? userOptions[key] : _defaultOptions[key];
	  }

	  return options;
	};
	/**
	 * @param {HTMLElement} element
	 * @private
	 */


	var _sanitaze = function _sanitaze(element) {
	  element.removeAttribute(attrs.sourceImg);
	  element.removeAttribute(attrs.sourceSrcSet);
	  element.removeAttribute(attrs.sourceBgImg);
	  element.removeAttribute(attrs.sourceImage);
	  element.removeAttribute(attrs.sourceIframe);
	  element.removeAttribute(attrs.sourceContainer);
	};
	/**
	 * @param {Element} element
	 * @param {zzLoadOptions} options
	 * @param {boolean} [asPromise]
	 * @return {null|Promise}
	 * @private
	 */


	var _load = function _load(element, options, asPromise) {
	  /**
	   * @param {Function} [resolve]
	   * @param {Function} [reject]
	   * @return
	   */
	  var load = function load(resolve, reject) {
	    _markAs.processed(element);

	    options.onProcessStart(element);
	    var img = document.createElement('img');

	    var loadActions = function loadActions(src) {
	      if (options.clearSourceAttrs) {
	        _sanitaze(element);
	      }

	      _markAs.loaded(element, src);

	      options.onLoad(element, src);

	      if (resolve) {
	        resolve(element, src);
	      }
	    };

	    function onload() {
	      loadActions(this.src);
	    }

	    function onerror() {
	      var src = this.src;

	      _markAs.failed(element, src);

	      options.onError(element, src);

	      if (reject) {
	        reject(element, src);
	      }
	    }

	    img.onerror = onerror; // img

	    var source = element.getAttribute(attrs.sourceImg);

	    if (source) {
	      var srcset = element.getAttribute(attrs.sourceSrcSet);

	      img.onload = function () {
	        if (options.setSourcesOnlyOnLoad) {
	          if (srcset) {
	            element.srcset = srcset;
	          }

	          element.src = source;
	        }

	        loadActions(img.currentSrc);
	      };

	      if (srcset) {
	        img.srcset = srcset;

	        if (options.setSourcesOnlyOnLoad !== true) {
	          element.srcset = srcset;
	        }
	      }

	      img.src = source;

	      if (options.setSourcesOnlyOnLoad !== true) {
	        element.src = source;
	      }

	      return null;
	    } // style="background-image: url(...)"


	    source = element.getAttribute(attrs.sourceBgImg);

	    if (source) {
	      img.onload = function () {
	        if (options.setSourcesOnlyOnLoad) {
	          element.style.backgroundImage = "url(".concat(source, ")");
	        }

	        loadActions(img.currentSrc);
	      };

	      img.src = source;

	      if (options.setSourcesOnlyOnLoad !== true) {
	        element.style.backgroundImage = "url(".concat(source, ")");
	      }

	      return null;
	    } // SVG image


	    source = element.getAttribute(attrs.sourceImage);

	    if (source) {
	      var image = element.querySelector('image');

	      if (image instanceof window.SVGImageElement) {
	        img.onload = function () {
	          if (options.setSourcesOnlyOnLoad) {
	            image.setAttribute('href', source);
	          }

	          loadActions(img.currentSrc);
	        };

	        img.src = source;

	        if (options.setSourcesOnlyOnLoad !== true) {
	          image.setAttribute('href', source);
	        }

	        return null;
	      }
	    } // iframe


	    source = element.getAttribute(attrs.sourceIframe);

	    if (source) {
	      element.onload = onload;
	      element.onerror = onerror;
	      element.src = source;
	      return null;
	    } // picture


	    if (element.nodeName.toLowerCase() === 'picture') {
	      var pitureImg = element.getElementsByTagName('img')[0];

	      if (pitureImg instanceof window.HTMLImageElement) {
	        var clear = function clear(str) {
	          return str.replace(/^\/\//i, '').replace(window.location.origin, '');
	        };

	        var currentSrc = clear(pitureImg.currentSrc);
	        var src = null;
	        var _srcset = null;

	        for (var i = 0; i < element.children.length; i++) {
	          var child = element.children[i];
	          var isSource = child.nodeName.toLowerCase() === 'source';
	          var isImg = child.nodeName.toLowerCase() === 'img';
	          var childSrc = clear(isSource ? child.srcset : isImg ? child.src : '');

	          if (currentSrc === childSrc) {
	            src = child.getAttribute(attrs.sourceImg) || null;
	            _srcset = child.getAttribute(attrs.sourceSrcSet);
	          }
	        }

	        if (src === null) {
	          console.warn('Must provide `data-zzload-source-picture` on all children elements');
	          console.warn(element);
	          return null;
	        }

	        img.onload = function onload() {
	          for (var _i = 0; _i < element.children.length; _i++) {
	            var _child = element.children[_i];

	            var _src = _child.getAttribute(attrs.sourceImg);

	            var _srcset2 = _child.getAttribute(attrs.sourceSrcSet);

	            if (_child.nodeName.toLowerCase() === 'source') {
	              if (_srcset2) {
	                _src += ', ' + _srcset2;
	              }

	              _child.srcset = _src;
	            } else if (_child.nodeName.toLowerCase() === 'img') {
	              if (_srcset2) {
	                _child.srcset = _srcset2;
	              }

	              _child.src = _src;
	            }

	            _sanitaze(_child);
	          }

	          var src = img.currentSrc;
	          loadActions(src);
	        };

	        if (_srcset) {
	          img.srcset = _srcset;
	        }

	        img.src = src;
	        return null;
	      }

	      console.warn('No `img` in `picture`!');
	    } // container


	    if (element.hasAttribute(attrs.sourceContainer)) {
	      _markAs.loaded(element);

	      options.onLoad(element);

	      if (resolve) {
	        resolve(element);
	      }

	      return null;
	    }

	    console.log(element);
	    console.log('▲ element has no zz-load source');
	  };

	  if (asPromise && window.Promise) {
	    return new Promise(function (resolve, reject) {
	      load(resolve, reject);
	    });
	  }

	  load();
	  return null;
	};
	/**
	 * @param {string} name
	 * @param {Object} [detail={}]
	 * @return {CustomEvent}
	 * @private
	 */


	var _createEvent = function _createEvent(name) {
	  var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  return new window.CustomEvent(name, {
	    detail: detail
	  });
	};
	/**
	 * @private
	 */


	var _markAs = {
	  observed: function observed(element) {
	    element.setAttribute(attrs.isObserved, '');
	    element.dispatchEvent(_createEvent(events.observed, {
	      element: element
	    }));
	  },
	  processed: function processed(element) {
	    element.setAttribute(attrs.isProcessed, '');
	    element.dispatchEvent(_createEvent(events.processed, {
	      element: element
	    }));
	  },
	  loaded: function loaded(element, source) {
	    element.setAttribute(attrs.isLoaded, '');
	    element.dispatchEvent(_createEvent(events.loaded, {
	      element: element,
	      source: source
	    }));
	  },
	  failed: function failed(element, source) {
	    element.setAttribute(attrs.isFailed, '');
	    element.dispatchEvent(_createEvent(events.failed, {
	      element: element,
	      source: source
	    }));
	  },
	  inView: function inView(element, source) {
	    element.setAttribute(attrs.isInView, '');
	    element.dispatchEvent(_createEvent(events.inView, {
	      element: element,
	      source: source
	    }));
	  },
	  outOfView: function outOfView(element, source) {
	    element.removeAttribute(attrs.isInView, '');
	    element.dispatchEvent(_createEvent(events.outOfView, {
	      element: element,
	      source: source
	    }));
	  }
	};
	/**
	 * @private
	 */

	var _checkIs = {
	  observed: function observed(element) {
	    return element.hasAttribute(attrs.isObserved);
	  },
	  processed: function processed(element) {
	    return element.hasAttribute(attrs.isProcessed);
	  },
	  loaded: function loaded(element) {
	    return element.hasAttribute(attrs.isLoaded);
	  },
	  failed: function failed(element) {
	    return element.hasAttribute(attrs.isFailed);
	  },
	  inView: function inView(element) {
	    return element.hasAttribute(attrs.isInView);
	  }
	};
	/**
	 * @param {Object} options
	 * @return {Function}
	 * @private
	 */

	var _onIntersection = function _onIntersection(options) {
	  return function (entries, observer) {
	    entries.forEach(function (entry) {
	      /** @type {Element} */
	      var element = entry.target;
	      var inViewType = element.hasAttribute(attrs.sourceInview);

	      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
	        if (inViewType) {
	          _markAs.inView(element, null);
	        } else {
	          observer.unobserve(element);

	          _load(element, options);
	        }
	      } else {
	        if (inViewType && _checkIs.inView(element)) {
	          _markAs.outOfView(element, null);
	        }
	      }
	    });
	  };
	};
	/**
	 * @param {string|Element|NodeList|jQuery} element
	 * @return {Array|NodeList}
	 * @private
	 */


	var _getElements = function _getElements(element) {
	  if (element instanceof window.Element) {
	    return [element];
	  }

	  if (element instanceof window.NodeList) {
	    return element;
	  }

	  if (element && element.jquery) {
	    return element.toArray();
	  }

	  if (typeof element !== 'string') {
	    element = '.zzload';
	  }

	  return document.querySelectorAll(element);
	}; // ----------------------------------------
	// Public
	// ----------------------------------------

	/**
	 * @param elements
	 * @param userOptions
	 * @return {*}
	 */


	function zzLoad(elements, userOptions) {
	  var options = _extend(userOptions);

	  var observer = null;

	  if (window.IntersectionObserver) {
	    observer = new window.IntersectionObserver(_onIntersection(options), {
	      rootMargin: options.rootMargin,
	      threshold: options.threshold
	    });
	  }

	  return {
	    observe: function observe() {
	      var list = _getElements(elements);

	      for (var i = 0; i < list.length; i++) {
	        var element = list[i];

	        if (_checkIs.observed(element)) {
	          continue;
	        }

	        _markAs.observed(element);

	        if (observer) {
	          observer.observe(element);
	          continue;
	        }

	        _load(element, options);
	      }
	    },
	    triggerLoad: function triggerLoad(element) {
	      if (_checkIs.processed(element)) {
	        return;
	      }

	      _markAs.observed(element);

	      return _load(element, options, true);
	    }
	  };
	} // ----------------------------------------
	// Definitions
	// ----------------------------------------

	/**
	 * @typedef {Object} zzLoadOptions
	 * @property {string} [rootMargin] - '0px'
	 * @property {number} [threshold] - 0
	 * @property {boolean} [clearSourceAttrs] - false
	 * @property {boolean} [setSourcesOnlyOnLoad] - true
	 * @property {function} [onProcessStart] - element: HTMLElement
	 * @property {function} [onLoad] - element: HTMLElement, source: string
	 * @property {function} [onError] - element: HTMLElement, source: string
	 */

	return zzLoad;

}());
