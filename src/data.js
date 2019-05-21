'use strict';

/**
 * @module
 * @licence MIT
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Exports
// ----------------------------------------

export const attrs = {
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

export const events = {
	observed: 'zzload:observed',
	processed: 'zzload:processed',
	loaded: 'zzload:loaded',
	failed: 'zzload:failed',
	inView: 'zzload:inView',
	outOfView: 'zzload:outOfView'
};
