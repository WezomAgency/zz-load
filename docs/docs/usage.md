# Usage

[◄ Home](../index.md)

### Prepare markup

```html
<img class="zzload custom-image" 
    width="150" height="150"
    src="./some-low-quality-placeholder.jpg"
    data-zzload-source-img="./path/to/image.jpg">
```

### CSS for transition

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

### Initialize zzload

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

----

[◄ Home](../README.md) | [▲ Top](#readme)
