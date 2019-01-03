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
const _defaultOptions = {
	rootMargin: '0px',
	threshold: 0,
	onLoad () {},
	onError () {}
};

/**
 * @param {Object} userOptions
 * @return {Object}
 * @private
 */
const _extend = (userOptions = {}) => {
	let options = {};
	for (let key in _defaultOptions) {
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
const _load = (element, onLoad, onError, asPromise) => {
	/**
	 * @param {Function} [resolve]
	 * @param {Function} [reject]
	 * @return
	 */
	let load = (resolve, reject) => {
		_markAs.processed(element);
		let img = document.createElement('img');

		img.onload = () => {
			const src = img.src;
			_markAs.loaded(element, src);
			onLoad(element, src);
			if (resolve) {
				resolve(element, src);
			}
		};

		img.onerror = () => {
			const src = img.src;
			_markAs.failed(element, src);
			onError(element, src);
			if (reject) {
				reject(element, src);
			}
		};

		let source = element.getAttribute('data-zzload-source-img');
		if (source) {
			img.src = source;
			element.src = source;
			return null;
		}

		source = element.getAttribute('data-zzload-source-background-img');
		if (source) {
			img.src = source;
			element.style.backgroundImage = `url(${source})`;
			return null;
		}

		source = element.getAttribute('data-zzload-source-image');
		if (source) {
			let image = element.querySelector('image');
			if (image instanceof window.SVGImageElement) {
				img.src = source;
				image.setAttribute('href', source);
				return null;
			}
		}

		console.log(element);
		console.log('▲ element has no zz-load source');
	};

	if (asPromise && window.Promise) {
		return new Promise((resolve, reject) => {
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
const _createEvent = (name, detail = {}) => {
	return new window.CustomEvent(`zzload:${name}`, { detail });
};

/**
 * @private
 */
const _markAs = {
	observed (element) {
		element.setAttribute('data-zzload-is-observed', '');
		element.dispatchEvent(_createEvent('observed', { element }));
	},
	processed (element) {
		element.setAttribute('data-zzload-is-processed', '');
		element.dispatchEvent(_createEvent('processed', { element }));
	},
	loaded (element, source) {
		element.setAttribute('data-zzload-is-loaded', '');
		element.dispatchEvent(_createEvent('loaded', { element, source }));
	},
	failed (element, source) {
		element.setAttribute('data-zzload-is-failed', '');
		element.dispatchEvent(_createEvent('failed', { element, source }));
	}
};

/**
 * @private
 */
const _checkIs = {
	observed (element) {
		return element.hasAttribute('data-zzload-is-observed');
	},
	processed (element) {
		return element.hasAttribute('data-zzload-is-processed');
	},
	loaded (element) {
		return element.hasAttribute('data-zzload-is-loaded');
	},
	failed (element) {
		return element.hasAttribute('data-zzload-is-failed');
	}
};

/**
 * @param {Object} options
 * @return {Function}
 * @private
 */
const _onIntersection = options => (entries, observer) => {
	entries.forEach(entry => {
		if (entry.intersectionRatio > 0 || entry.isIntersecting) {
			/** @type {Element} */
			let element = entry.target;
			observer.unobserve(element);
			_load(element, options.onLoad, options.onError);
		}
	});
};

/**
 * @param {string|Element|NodeList|jQuery} element
 * @return {Array|NodeList}
 * @private
 */
const _getElements = (element) => {
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
};

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param elements
 * @param userOptions
 * @return {*}
 */
function zzLoad (elements, userOptions) {
	let options = _extend(userOptions);
	let observer = null;

	if (window.IntersectionObserver) {
		observer = new window.IntersectionObserver(_onIntersection(options), {
			rootMargin: options.rootMargin,
			threshold: options.threshold
		});
	}

	return {
		observe () {
			let list = _getElements(elements);
			for (let i = 0; i < list.length; i++) {
				let element = list[i];
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
		triggerLoad (element) {
			if (_checkIs.processed(element)) {
				return;
			}
			_markAs.observed(element);
			return _load(element, options.onLoad, options.onError, true);
		}
	};
}

// ----------------------------------------
// Exports
// ----------------------------------------

export default zzLoad;
