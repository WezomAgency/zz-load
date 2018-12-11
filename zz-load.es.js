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
	rootMargin: '20px 10px',
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
		let ZZloadEvent = window.CustomEvent;

		img.onload = () => {
			const src = img.src;
			const loadEvent = new ZZloadEvent('zzload:load', {
				detail: {
					element,
					src
				}
			});
			_markAs.loaded(element);
			element.dispatchEvent(loadEvent);
			onLoad(element, img.src);
			if (resolve) {
				resolve(element, img.src);
			}
		};

		img.onerror = () => {
			const src = img.src;
			const errorEvent = new ZZloadEvent('zzload:error', {
				detail: {
					element,
					src
				}
			});
			_markAs.failed(element);
			element.dispatchEvent(errorEvent);
			onError(element, src);
			if (reject) {
				reject(element, src);
			}
		};

		let dataImg = element.getAttribute('data-zzload-source-img');
		if (dataImg) {
			img.src = dataImg;
			element.src = dataImg;
			return null;
		}

		let dataBgImg = element.getAttribute('data-zzload-source-background-img');
		if (dataBgImg) {
			img.src = dataBgImg;
			element.style.backgroundImage = `url(${dataBgImg})`;
			return null;
		}
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
 * @private
 */
const _markAs = {
	processed (element) {
		element.setAttribute('data-zzload-is-processed', true);
	},
	loaded (element) {
		element.setAttribute('data-zzload-is-loaded', true);
	},
	failed (element) {
		element.setAttribute('data-zzload-is-failed', true);
	}
};

/**
 * @private
 */
const _checkIs = {
	processed (element) {
		return element.getAttribute('data-zzload-is-processed') === 'true';
	},
	loaded (element) {
		return element.getAttribute('data-zzload-is-loaded') === 'true';
	},
	failed (element) {
		return element.getAttribute('data-zzload-is-failed') === 'true';
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
				if (_checkIs.processed(element)) {
					continue;
				}
				_markAs.processed(element);
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
			return _load(element, options.onLoad, options.onError, true);
		}
	};
}

// ----------------------------------------
// Exports
// ----------------------------------------

export default zzLoad;
