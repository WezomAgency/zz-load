# zz-load

[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/WezomAgency/zz-load/blob/master/LICENSE)
[![npm](https://img.shields.io/badge/npm-install-orange.svg)](https://www.npmjs.com/package/zz-load)
[![WezomAgency](https://img.shields.io/badge/wezom-agency-red.svg)](https://github.com/WezomAgency)
[![Javascript Style Guide](https://img.shields.io/badge/code_style-wezom_relax-red.svg)](https://github.com/WezomAgency/eslint-config-wezom-relax)

> _**Project inspired by [lozad.js](https://github.com/ApoorvSaxena/lozad.js)**_  
> _**Big thx to [ApoorvSaxena](https://github.com/ApoorvSaxena) and community for their work on `lozad.js`**_  
> _(We also participated a little bit in the development [#80](https://github.com/ApoorvSaxena/lozad.js/pull/80))_

## So why do we need a `zz-load` when there are `lozad.js`?

| Features                                               | lozad.js  | zz-load   |
| ------------------------------------------------------ | :-------: | :-------: |
| pure JavaScript                                        | _**Yes**_ | _**Yes**_ |
| ES6                                                    | _**Yes**_ | _**Yes**_ |
| No dependencies                                        | _**Yes**_ | _**Yes**_ |
| Transpiled ES5 + `.min`                                | _**Yes**_ | _**Yes**_ |
| IntersectionObserver                                   | _**Yes**_ | _**Yes**_ |
| Custom `load()` method                                 | _**Yes**_ | _No_      |
| Callback on fully loaded source                        | _No_      | _**Yes**_ |
| Callback on error loading source                       | _No_      | _**Yes**_ |
| Dispatch events `onload` and `onerror`                 | _No_      | _**Yes**_ |
| `triggerLoad()` method return Promise _(if supports)_  | _No_      | _**Yes**_ |


--- 


## Install

#### NPM

```bash
npm i zz-load
```

#### CDN (unpkg.com)

```html
<script src="https://unpkg.com/zz-load@latest/dist/zz-load.js"></script>
<!-- or minimized version -->
<script src="https://unpkg.com/zz-load@latest/dist/zz-load.min.js"></script>
```

#### Download

- [zz-load.es.js](https://unpkg.com/zz-load@latest/zz-load.es.js)
- [dist/zz-load.js](https://unpkg.com/zz-load@latest/dist/zz-load.js)
- [dist/zz-load.min.js](https://unpkg.com/zz-load@latest/dist/zz-load.min.js)

---

## Simple usage

Prepare markup

```html
<img class="zzload custom-image" 
    width="150" height="150"
    src="./some-low-quality-placeholder.jpg"
    data-zzload-source-img="./path/to/image.jpg">
```

CSS for transition

```css
.custom-image {
    opacity: 0;
}

/* zz-load will add `data-zzload-is-loaded` attribute
   after fully resource loaded */
.custom-image[data-zzload-is-loaded] {
    opacity: 1;
    transition: opacity .3s ease;
}
```


import js module

```js
import zzLoad from 'zz-load';
```

or include as external file

```html
<script src="your/path/to/zz-load.min.js"></script>
<!-- will be added to Window, as global object zzLoad -->
```

then fire up

```js
const observer = zzLoad();
observer.observe();
```

---

### More Examples

---

## API

## `zzLoad([elements][, options]): observer`

### `elements`

_type_: `string | Element | NodeList | jQuery<Element>`  
_default value_: `'.zzload'`

Can be elements or string selector for find elements.




#### `options`



type: `Object` 



##### `options.rootMargin`

_default value:_ `'20px 10px'`  
read more: [IntersectionObserver.rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)




##### `options.threshold`

_default value:_ `0`  
read more: [IntersectionObserver.thresholds](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds)





##### `options.onLoad(elemen, source): void`

_default value:_ `empty function`  
Callback executed on fully success loaded source.  
Has two arguments:

- `element: Element` - current element
- `source: string` - loaded source url 

example:

```js
import zzLoad from 'zz-load';
const observer = zzLoad('.zzload', {
	onLoad (element, source) {
		element.classList.add('is-fully-loaded');
		console.log('Source successfully loaded:\n' + source);
	}
})
```


> _Note! zzLoad automatically will add own attribute to elements,_  
> _for marking them as loaded, even without setting custom `onLoad()` method._   
> _So you can use this approach for custom styling._  
> _Read more in [Auto marking elements](#auto-marking-elements) section_






##### `options.onError(elemen, source): void`

_default value:_ `empty function`  
Callback executed on error loading source.  
Has two arguments:

- `element: Element` - current element
- `source: string` - failed source url 

example:

```js
import zzLoad from 'zz-load';
const observer = zzLoad('.zzload', {
	onError (element, source) {
		element.classList.add('is-damaged');
		console.warn('Something went wrong with source:\n' + source);
	}
})
```


> _Note! zzLoad automatically will add own attribute to elements,_  
> _for marking them as failed, even without setting custom `onLoad()` method._   
> _So you can use this approach for custom styling._  
> _Read more in [Auto marking elements](#auto-marking-elements) section_

### `observer`

#### `observer.observe()`

##### `observer.triggerLoad(): Promise`

---

## Auto marking elements


