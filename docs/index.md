# zz-load docs

## *Table of contents*

1. [Install](./docs/install.md)
1. [Usage](./docs/usage.md)
1. [API](./docs/api.md)
1. Examples
    - [`<img>`](./examples/img.html)

---

## More Examples

_documentation in progress_

---

# API

### `zzLoad([elements][, options]): observer`

#### `elements`

_type_: `string | Element | NodeList | jQuery<Element>`  
_default value_: `'.zzload'`

Can be elements or string selector for find elements.




#### `options`

_type:_ `Object`

##### `options.rootMargin`

_default value:_ `'0px'`  
read more: [IntersectionObserver.rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)




##### `options.threshold`

_default value:_ `0`  
read more: [IntersectionObserver.thresholds](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds)





##### `options.onLoad(element, source): void`

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






##### `options.onError(element, source): void`

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

_documentation in progress_

#### `observer.observe()`

_documentation in progress_

#### `observer.triggerLoad(): Promise`

_documentation in progress_

---

# Auto marking elements

_documentation in progress_
