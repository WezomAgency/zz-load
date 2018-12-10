'use strict';

/**
 * @module
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const rollupPluginBabel = require('rollup-plugin-babel');

// ----------------------------------------
// Exports
// ----------------------------------------

export default {
	input: './zz-load.es.js',
	output: {
		file: './dist/zz-load.js',
		format: 'iife',
		name: 'zzLoad'
	},
	plugins: [
		rollupPluginBabel({
			babelrc: false,
			presets: [
				['env', { modules: false }]
			]
		})
	]
};
