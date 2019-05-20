var zzLoad = (function () {
	'use strict';

	/**
	 * @module
	 * @licence MIT
	 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
	 */
	// ----------------------------------------
	// Private
	// ----------------------------------------

	/**
	 * @type {Object}
	 * @private
	 */

	var _defaultOptions = {
	  rootMargin: '0px',
	  threshold: 0,
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
	 * @private
	 */


	var _attrs = {
	  isObserved: 'data-zzload-is-observed',
	  isProcessed: 'data-zzload-is-processed',
	  isLoaded: 'data-zzload-is-loaded',
	  isFailed: 'data-zzload-is-failed',
	  isInView: 'data-zzload-is-inview',
	  sourceImg: 'data-zzload-source-img',
	  sourceBgImg: 'data-zzload-source-background-img',
	  sourceImage: 'data-zzload-source-image',
	  sourceIframe: 'data-zzload-source-iframe',
	  sourceContainer: 'data-zzload-container',
	  sourceInview: 'data-zzload-inview'
	};
	/**
	 * @param {Element} element
	 * @param {Function} onLoad
	 * @param {Function} onError
	 * @param {boolean} [asPromise]
	 * @return {null|Promise}
	 * @private
	 */

	var _load = function _load(element, onLoad, onError, asPromise) {
	  /**
	   * @param {Function} [resolve]
	   * @param {Function} [reject]
	   * @return
	   */
	  var load = function load(resolve, reject) {
	    _markAs.processed(element);

	    var img = document.createElement('img');

	    function onload() {
	      var src = this.src;

	      _markAs.loaded(element, src);

	      onLoad(element, src);

	      if (resolve) {
	        resolve(element, src);
	      }
	    }

	    function onerror() {
	      var src = this.src;

	      _markAs.failed(element, src);

	      onError(element, src);

	      if (reject) {
	        reject(element, src);
	      }
	    }

	    img.onload = onload;
	    img.onerror = onerror; // img

	    var source = element.getAttribute(_attrs.sourceImg);

	    if (source) {
	      img.src = source;
	      element.src = source;
	      return null;
	    } // style="background-image: url(...)"


	    source = element.getAttribute(_attrs.sourceBgImg);

	    if (source) {
	      img.src = source;
	      element.style.backgroundImage = "url(".concat(source, ")");
	      return null;
	    } // SVG image


	    source = element.getAttribute(_attrs.sourceImage);

	    if (source) {
	      var image = element.querySelector('image');

	      if (image instanceof window.SVGImageElement) {
	        img.src = source;
	        image.setAttribute('href', source);
	        return null;
	      }
	    } // iframe


	    source = element.getAttribute(_attrs.sourceIframe);

	    if (source) {
	      element.onload = onload;
	      element.onerror = onerror;
	      element.src = source;
	      return null;
	    } // picture


	    if (element.nodeName.toLowerCase() === 'picture') {
	      var pitureImg = element.getElementsByTagName('img')[0];
	      var patter = /^(http(s)?:)?\/\//i;

	      if (pitureImg instanceof window.HTMLImageElement) {
	        var currentSrc = pitureImg.currentSrc.replace(patter, '');
	        var sources = null;

	        for (var i = 0; i < element.children.length; i++) {
	          var child = element.children[i];
	          var childSrc = child.nodeName.toLowerCase() === 'source' ? child.srcset : child.src;

	          if (currentSrc === childSrc.replace(patter, '')) {
	            sources = child.dataset.zzloadSourcePicture || null;
	          }
	        }

	        if (sources === null) {
	          console.warn('Must provide `data-zzload-source-picture` on all children elements');
	          console.warn(element);
	          return null;
	        }

	        img.onload = function onload() {
	          for (var _i = 0; _i < element.children.length; _i++) {
	            var _child = element.children[_i];

	            if (_child.nodeName.toLowerCase() === 'source') {
	              _child.srcset = _child.dataset.zzloadSourcePicture;
	            } else {
	              _child.src = _child.dataset.zzloadSourcePicture;
	            }
	          }

	          var src = img.currentSrc;

	          _markAs.loaded(element, src);

	          onLoad(element, src);

	          if (resolve) {
	            resolve(element, src);
	          }
	        };

	        sources = sources.split(',');
	        var src = sources.shift();
	        var srcset = sources.join(',').replace(/^\s+/m, '');

	        if (srcset) {
	          img.srcset = srcset;
	        }

	        img.src = src;
	        return null;
	      }

	      console.warn('No `img` in `picture`!');
	    } // container


	    if (element.hasAttribute(_attrs.sourceContainer)) {
	      _markAs.loaded(element);

	      onLoad(element);

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
	  return new window.CustomEvent("zzload:".concat(name), {
	    detail: detail
	  });
	};
	/**
	 * @private
	 */


	var _markAs = {
	  observed: function observed(element) {
	    element.setAttribute(_attrs.isObserved, '');
	    element.dispatchEvent(_createEvent('observed', {
	      element: element
	    }));
	  },
	  processed: function processed(element) {
	    element.setAttribute(_attrs.isProcessed, '');
	    element.dispatchEvent(_createEvent('processed', {
	      element: element
	    }));
	  },
	  loaded: function loaded(element, source) {
	    element.setAttribute(_attrs.isLoaded, '');
	    element.dispatchEvent(_createEvent('loaded', {
	      element: element,
	      source: source
	    }));
	  },
	  failed: function failed(element, source) {
	    element.setAttribute(_attrs.isFailed, '');
	    element.dispatchEvent(_createEvent('failed', {
	      element: element,
	      source: source
	    }));
	  },
	  inView: function inView(element, source) {
	    element.setAttribute(_attrs.isInView, '');
	    element.dispatchEvent(_createEvent('inView', {
	      element: element,
	      source: source
	    }));
	  },
	  outOfView: function outOfView(element, source) {
	    element.removeAttribute(_attrs.isInView, '');
	    element.dispatchEvent(_createEvent('outOfView', {
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
	    return element.hasAttribute(_attrs.isObserved);
	  },
	  processed: function processed(element) {
	    return element.hasAttribute(_attrs.isProcessed);
	  },
	  loaded: function loaded(element) {
	    return element.hasAttribute(_attrs.isLoaded);
	  },
	  failed: function failed(element) {
	    return element.hasAttribute(_attrs.isFailed);
	  },
	  inView: function inView(element) {
	    return element.hasAttribute(_attrs.isInView);
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
	      var inViewType = element.hasAttribute(_attrs.sourceInview);

	      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
	        if (inViewType) {
	          _markAs.inView(element, null);
	        } else {
	          observer.unobserve(element);

	          _load(element, options.onLoad, options.onError);
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

	        _load(element, options.onLoad, options.onError);
	      }
	    },
	    triggerLoad: function triggerLoad(element) {
	      if (_checkIs.processed(element)) {
	        return;
	      }

	      _markAs.observed(element);

	      return _load(element, options.onLoad, options.onError, true);
	    }
	  };
	} // ----------------------------------------

	return zzLoad;

}());
