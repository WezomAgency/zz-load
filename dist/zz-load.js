(function () {
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
	    var ZZloadEvent = window.CustomEvent;

	    img.onload = function () {
	      var src = img.src;
	      var loadEvent = new ZZloadEvent('zzload:load', {
	        detail: {
	          element: element,
	          src: src
	        }
	      });

	      _markAs.loaded(element);

	      element.dispatchEvent(loadEvent);
	      onLoad(element, img.src);

	      if (resolve) {
	        resolve(element, img.src);
	      }
	    };

	    img.onerror = function () {
	      var src = img.src;
	      var errorEvent = new ZZloadEvent('zzload:error', {
	        detail: {
	          element: element,
	          src: src
	        }
	      });

	      _markAs.failed(element);

	      element.dispatchEvent(errorEvent);
	      onError(element, src);

	      if (reject) {
	        reject(element, src);
	      }
	    };

	    var dataImg = element.getAttribute('data-zzload-source-img');

	    if (dataImg) {
	      img.src = dataImg;
	      element.src = dataImg;
	      return null;
	    }

	    var dataBgImg = element.getAttribute('data-zzload-source-background-img');

	    if (dataBgImg) {
	      img.src = dataBgImg;
	      element.style.backgroundImage = "url(".concat(dataBgImg, ")");
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
	 * @private
	 */


	var _markAs = {
	  observed: function observed(element) {
	    element.setAttribute('data-zzload-is-observed', '');
	  },
	  processed: function processed(element) {
	    element.setAttribute('data-zzload-is-processed', '');
	  },
	  loaded: function loaded(element) {
	    element.setAttribute('data-zzload-is-loaded', '');
	  },
	  failed: function failed(element) {
	    element.setAttribute('data-zzload-is-failed', '');
	  }
	};
	/**
	 * @private
	 */

	var _checkIs = {
	  observed: function observed(element) {
	    return element.hasAttribute('data-zzload-is-observed');
	  },
	  processed: function processed(element) {
	    return element.hasAttribute('data-zzload-is-processed');
	  },
	  loaded: function loaded(element) {
	    return element.hasAttribute('data-zzload-is-loaded');
	  },
	  failed: function failed(element) {
	    return element.hasAttribute('data-zzload-is-failed');
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
	      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
	        /** @type {Element} */
	        var element = entry.target;
	        observer.unobserve(element);

	        _load(element, options.onLoad, options.onError);
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
	// Exports
	// ----------------------------------------


	window.zzLoad = zzLoad; // export default zzLoad;

}());
