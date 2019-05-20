# API

[◄ Home](../index.md)

----

## zzLoad()

`zzLoad([elements][, options]): observer`

### elements

_type_: `string | Element | NodeList | jQuery<Element>`  
_default value_: `'.zzload'`

Can be elements or string selector for find elements.


### options

_type:_ `Object`


#### options.rootMargin

_type:_ `string`    
_default value:_ `'0px'`  
read more: [IntersectionObserver.rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)




#### options.threshold

_type:_ `number`    
_default value:_ `0`  
read more: [IntersectionObserver.thresholds](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds)






#### options.clearSourceAttrs

_type:_ `boolean`    
_default value:_ `false`  
remove `data-zzload-source-*` attributes after successfully load






#### options.setSourcesOnlyOnLoad

_type:_ `boolean`    
_default value:_ `true`  
change element's sources only if loaded successfully





#### options.onLoad

`onLoad(element, loadedSource): void`

_default value:_ `empty function`  
Callback executed on fully success loaded source.  
Has two arguments:

- `element: Element` - current element
- `loadedSource: string` - loaded source url 

example:

```js
zzLoad('.zzload', {
    onLoad (element, loadedSource) {
        element.classList.add('is-fully-loaded');
        console.log('Source successfully loaded:\n' + loadedSource);
    }
})
```


> _Note! zzLoad automatically will add own attribute to elements,_  
> _for marking them as loaded, even without setting custom `onLoad()` method._   
> _So you can use this approach for custom styling._  






##### options.onError

`onError(element, failedSource): void`

_default value:_ `empty function`  
Callback executed on error loading source.  
Has two arguments:

- `element: Element` - current element
- `failedSource: string` - failed source url 

example:

```js
zzLoad('.zzload', {
    onError (element, failedSource) {
        element.classList.add('is-damaged');
        console.warn('Something went wrong with source:\n' + failedSource);
    }
})
```


> _Note! zzLoad automatically will add own attribute to elements,_  
> _for marking them as failed, even without setting custom `onError()` method._   
> _So you can use this approach for custom styling._  

### `observer`

_documentation in progress_

#### `observer.observe()`

_documentation in progress_

#### `observer.triggerLoad(): Promise`

_documentation in progress_

----


[◄ Home](../index.md) | [▲ Top](#readme)
