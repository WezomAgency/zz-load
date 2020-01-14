declare module 'zz-load/src/events' {
	interface ZZLoadEvents {
		observed: string;
		processed: string;
		loaded: string;
		failed: string;
		inView: string;
		outOfView: string;
	}

	export const events: ZZLoadEvents;
}
