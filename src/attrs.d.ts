declare module 'zz-load/src/attrs' {
	interface ZZLoadAttrs {
		isObserved: string;
		isProcessed: string;
		isLoaded: string;
		isFailed: string;
		isInView: string;
		sourceImg: string;
		sourceSrcSet: string;
		sourceBgImg: string;
		sourceImage: string;
		sourceIframe: string;
		sourceContainer: string;
		sourceInview: string;
	}

	export const attrs: ZZLoadAttrs;
}
