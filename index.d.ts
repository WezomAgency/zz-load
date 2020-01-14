declare module 'zz-load' {
	function zzLoad(
		elements: string | NodeList | Element,
		options: {
			rootMargin?: string;
			threshold?: number;
			onLoad?(): void;
			onError?(): void;
		}
	): {
		observe(): void;
		triggerLoad<TElement = HTMLElement>(element: TElement): void;
	};

	export = zzLoad;
}
