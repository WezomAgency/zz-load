declare module 'zz-load/src/data-set' {
	interface ZZLoadDataSet {
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

	export const dataSet: ZZLoadDataSet;
}
