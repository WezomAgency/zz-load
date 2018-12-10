# zz-load

[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/WezomAgency/zz-load/blob/master/LICENSE)
[![npm](https://img.shields.io/badge/npm-install-orange.svg)](https://www.npmjs.com/package/zz-load)
[![WezomAgency](https://img.shields.io/badge/wezom-agency-red.svg)](https://github.com/WezomAgency)

> _**Project inspired by [lozad.js](https://github.com/ApoorvSaxena/lozad.js)**_  
> _**Big thx to [ApoorvSaxena](https://github.com/ApoorvSaxena) and community for their work on `lozad.js`**_  
> _(We also participated a little bit in the development [#80](https://github.com/ApoorvSaxena/lozad.js/pull/80))_

## So why do we need a `zz-load` when there are `lozad.js`?

|                                                        | lozad.js  | zz-load   |
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
