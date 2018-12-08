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
 * @private
 */
const _load = (element, onLoad, onError) => {
	_markAs.processed(element);

	let img = document.createElement('img');

	img.onload = () => {
		_markAs.loaded(element);
		onLoad(element, img.src);
	};

	img.onerror = () => {
		_markAs.failed(element);
		onError(element, img.src);
	};

	let dataImg = element.getAttribute('data-zzload-img');
	if (dataImg) {
		img.src = dataImg;
		element.src = dataImg;
		return null;
	}

	let dataBgImg = element.getAttribute('data-zzload-background-img');
	if (dataBgImg) {
		img.src = dataBgImg;
		element.style.backgroundImage = `url(${dataBgImg})`;
		return null;
	}

	// if (element.nodeName.toLowerCase() === 'picture') {
	// 	if (isIE && element.getAttribute('data-iesrc')) {
	// 		img.src = element.getAttribute('data-iesrc');
	// 	}
	// 	if (element.getAttribute('data-alt')) {
	// 		img.alt = element.getAttribute('data-alt');
	// 	}
	// 	element.appendChild(img);
	// }
	// if (element.getAttribute('data-src')) {
	// 	element.src = element.getAttribute('data-src');
	// }
	// if (element.getAttribute('data-srcset')) {
	// 	element.setAttribute('srcset', element.getAttribute('data-srcset'));
	// }
	// if (element.getAttribute('data-background-image')) {
	// 	element.style.backgroundImage = `url('${element.getAttribute('data-background-image')}')`;
	// }
	// if (element.getAttribute('data-toggle-class')) {
	// 	element.classList.toggle(element.getAttribute('data-toggle-class'));
	// }
};

/**
 * @private
 */
const _markAs = {
	processed (element) {
		element.setAttribute('data-zzload-processed', true);
	},
	loaded (element) {
		element.setAttribute('data-zzload-loaded', true);
	},
	failed (element) {
		element.setAttribute('data-zzload-failed', true);
	}
};

/**
 * @private
 */
const _checkIs = {
	processed (element) {
		return element.getAttribute('data-zzload-processed') === 'true';
	},
	loaded (element) {
		return element.getAttribute('data-zzload-loaded') === 'true';
	},
	failed (element) {
		return element.getAttribute('data-zzload-failed') === 'true';
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
			/**
			 * @type {Element}
			 */
			let element = entry.target;
			observer.unobserve(element);
			if (!_checkIs.processed(element)) {
				_load(element, options.onLoad, options.onError);
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
 * @param {string|Element|NodeList|jQuery} [elements=".zz-load"]
 * @param {Object} [userOptions={}]
 * @return {{observe(): void, triggerLoad(): void}}
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
			_load(element, options.onLoad, options.onError);
		}
	};
}

// ----------------------------------------
// Exports
// ----------------------------------------

export default zzLoad;
