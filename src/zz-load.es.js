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
 * @private
 */
const _attrs = {
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

/**
 * @param {HTMLElement} element
 * @private
 */
const _sanitaze = element => {
	element.removeAttribute(_attrs.sourceImg);
	element.removeAttribute(_attrs.sourceSrcSet);
	element.removeAttribute(_attrs.sourceBgImg);
	element.removeAttribute(_attrs.sourceImage);
	element.removeAttribute(_attrs.sourceIframe);
	element.removeAttribute(_attrs.sourceContainer);
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

		const loadActions = (src) => {
			_markAs.loaded(element, src);
			onLoad(element, src);
			if (resolve) {
				resolve(element, src);
			}
		};

		function onload () {
			_sanitaze(element);
			loadActions(this.src);
		}

		function onerror () {
			const src = this.src;
			_markAs.failed(element, src);
			onError(element, src);
			if (reject) {
				reject(element, src);
			}
		}

		img.onload = onload;
		img.onerror = onerror;

		// img
		let source = element.getAttribute(_attrs.sourceImg);
		if (source) {
			let srcset = element.getAttribute(_attrs.sourceSrcSet);
			if (srcset) {
				img.srcset = srcset;
				element.srcset = srcset;
			}
			img.src = source;
			element.src = source;
			return null;
		}

		// style="background-image: url(...)"
		source = element.getAttribute(_attrs.sourceBgImg);
		if (source) {
			img.src = source;
			element.style.backgroundImage = `url(${source})`;
			return null;
		}

		// SVG image
		source = element.getAttribute(_attrs.sourceImage);
		if (source) {
			let image = element.querySelector('image');
			if (image instanceof window.SVGImageElement) {
				img.src = source;
				image.setAttribute('href', source);
				return null;
			}
		}

		// iframe
		source = element.getAttribute(_attrs.sourceIframe);
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
						src = child.getAttribute(_attrs.sourceImg) || null;
						srcset = child.getAttribute(_attrs.sourceSrcSet);
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
						let src = child.getAttribute(_attrs.sourceImg);
						let srcset = child.getAttribute(_attrs.sourceSrcSet);

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
		element.setAttribute(_attrs.isObserved, '');
		element.dispatchEvent(_createEvent('observed', { element }));
	},
	processed (element) {
		element.setAttribute(_attrs.isProcessed, '');
		element.dispatchEvent(_createEvent('processed', { element }));
	},
	loaded (element, source) {
		element.setAttribute(_attrs.isLoaded, '');
		element.dispatchEvent(_createEvent('loaded', { element, source }));
	},
	failed (element, source) {
		element.setAttribute(_attrs.isFailed, '');
		element.dispatchEvent(_createEvent('failed', { element, source }));
	},
	inView (element, source) {
		element.setAttribute(_attrs.isInView, '');
		element.dispatchEvent(_createEvent('inView', { element, source }));
	},
	outOfView (element, source) {
		element.removeAttribute(_attrs.isInView, '');
		element.dispatchEvent(_createEvent('outOfView', { element, source }));
	}
};

/**
 * @private
 */
const _checkIs = {
	observed (element) {
		return element.hasAttribute(_attrs.isObserved);
	},
	processed (element) {
		return element.hasAttribute(_attrs.isProcessed);
	},
	loaded (element) {
		return element.hasAttribute(_attrs.isLoaded);
	},
	failed (element) {
		return element.hasAttribute(_attrs.isFailed);
	},
	inView (element) {
		return element.hasAttribute(_attrs.isInView);
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
		let inViewType = element.hasAttribute(_attrs.sourceInview);

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