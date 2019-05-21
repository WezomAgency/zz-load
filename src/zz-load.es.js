'use strict';

/**
 * @module
 * @licence MIT
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Imports
// ----------------------------------------

import { attrs, events } from './data';

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * @type {zzLoadOptions}
 * @private
 */
const _defaultOptions = {
	rootMargin: '0px',
	threshold: 0,
	clearSourceAttrs: false,
	setSourcesOnlyOnLoad: true,
	onProcessStart () {},
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
 * @param {HTMLElement} element
 * @private
 */
const _sanitaze = element => {
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
const _load = (element, options, asPromise) => {
	/**
	 * @param {Function} [resolve]
	 * @param {Function} [reject]
	 * @return
	 */
	let load = (resolve, reject) => {
		_markAs.processed(element);
		options.onProcessStart(element);
		let img = document.createElement('img');

		const loadActions = (src) => {
			if (options.clearSourceAttrs) {
				_sanitaze(element);
			}
			_markAs.loaded(element, src);
			options.onLoad(element, src);
			if (resolve) {
				resolve(element, src);
			}
		};

		function onload () {
			loadActions(this.src);
		}

		function onerror () {
			const src = this.src;
			_markAs.failed(element, src);
			options.onError(element, src);
			if (reject) {
				reject(element, src);
			}
		}

		img.onerror = onerror;

		// img
		let source = element.getAttribute(attrs.sourceImg);
		if (source) {
			let srcset = element.getAttribute(attrs.sourceSrcSet);
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
		}

		// style="background-image: url(...)"
		source = element.getAttribute(attrs.sourceBgImg);
		if (source) {
			img.onload = function () {
				if (options.setSourcesOnlyOnLoad) {
					element.style.backgroundImage = `url(${source})`;
				}
				loadActions(img.currentSrc);
			};
			img.src = source;
			if (options.setSourcesOnlyOnLoad !== true) {
				element.style.backgroundImage = `url(${source})`;
			}
			return null;
		}

		// SVG image
		source = element.getAttribute(attrs.sourceImage);
		if (source) {
			let image = element.querySelector('image');
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
		}

		// iframe
		source = element.getAttribute(attrs.sourceIframe);
		if (source) {
			element.onload = onload;
			element.onerror = onerror;
			element.src = source;
			return null;
		}

		// picture
		if (element.nodeName.toLowerCase() === 'picture') {
			const pitureImg = element.getElementsByTagName('img')[0];
			if (pitureImg instanceof window.HTMLImageElement) {
				const clear = str => str.replace(/^\/\//i, '').replace(window.location.origin, '');
				const currentSrc = clear(pitureImg.currentSrc);
				let src = null;
				let srcset = null;
				for (let i = 0; i < element.children.length; i++) {
					const child = element.children[i];
					const isSource = child.nodeName.toLowerCase() === 'source';
					const isImg = child.nodeName.toLowerCase() === 'img';
					const childSrc = clear(isSource ? child.srcset : isImg ? child.src : '');
					if (currentSrc === childSrc) {
						src = child.getAttribute(attrs.sourceImg) || null;
						srcset = child.getAttribute(attrs.sourceSrcSet);
					}
				}

				if (src === null) {
					console.warn('Must provide `data-zzload-source-picture` on all children elements');
					console.warn(element);
					return null;
				}

				img.onload = function onload () {
					for (let i = 0; i < element.children.length; i++) {
						let child = element.children[i];
						let src = child.getAttribute(attrs.sourceImg);
						let srcset = child.getAttribute(attrs.sourceSrcSet);

						if (child.nodeName.toLowerCase() === 'source') {
							if (srcset) {
								src += (', ' + srcset);
							}
							child.srcset = src;
						} else if (child.nodeName.toLowerCase() === 'img') {
							if (srcset) {
								child.srcset = srcset;
							}
							child.src = src;
						}
						_sanitaze(child);
					}
					const src = img.currentSrc;
					loadActions(src);
				};

				if (srcset) {
					img.srcset = srcset;
				}

				img.src = src;
				return null;
			}
			console.warn('No `img` in `picture`!');
		}

		// container
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
	return new window.CustomEvent(name, { detail });
};

/**
 * @private
 */
const _markAs = {
	observed (element) {
		element.setAttribute(attrs.isObserved, '');
		element.dispatchEvent(_createEvent(events.observed, { element }));
	},
	processed (element) {
		element.setAttribute(attrs.isProcessed, '');
		element.dispatchEvent(_createEvent(events.processed, { element }));
	},
	loaded (element, source) {
		element.setAttribute(attrs.isLoaded, '');
		element.dispatchEvent(_createEvent(events.loaded, { element, source }));
	},
	failed (element, source) {
		element.setAttribute(attrs.isFailed, '');
		element.dispatchEvent(_createEvent(events.failed, { element, source }));
	},
	inView (element, source) {
		element.setAttribute(attrs.isInView, '');
		element.dispatchEvent(_createEvent(events.inView, { element, source }));
	},
	outOfView (element, source) {
		element.removeAttribute(attrs.isInView, '');
		element.dispatchEvent(_createEvent(events.outOfView, { element, source }));
	}
};

/**
 * @private
 */
const _checkIs = {
	observed (element) {
		return element.hasAttribute(attrs.isObserved);
	},
	processed (element) {
		return element.hasAttribute(attrs.isProcessed);
	},
	loaded (element) {
		return element.hasAttribute(attrs.isLoaded);
	},
	failed (element) {
		return element.hasAttribute(attrs.isFailed);
	},
	inView (element) {
		return element.hasAttribute(attrs.isInView);
	}
};

/**
 * @param {Object} options
 * @return {Function}
 * @private
 */
const _onIntersection = options => (entries, observer) => {
	entries.forEach(entry => {
		/** @type {Element} */
		let element = entry.target;
		let inViewType = element.hasAttribute(attrs.sourceInview);

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
				_load(element, options);
			}
		},
		triggerLoad (element) {
			if (_checkIs.processed(element)) {
				return;
			}
			_markAs.observed(element);
			return _load(element, options, true);
		}
	};
}

// ----------------------------------------
// Exports
// ----------------------------------------

export default zzLoad;

// ----------------------------------------
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
