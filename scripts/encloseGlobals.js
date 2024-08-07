/**
 * Enclose global variables defined before an IIFE into it.
 * Workaround for [the issue of Vite](https://github.com/vitejs/vite/issues/16443).
 * 
 * usage: node ./scripts/encloseGlobals.js path/to/target/script.js
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const IIFE_PROLOGUE = '(function(){"use strict";'

const filepath = path.resolve(process.argv[2]);
const dirpath = path.dirname(filepath);

const code = await fs.readFile(filepath, { encoding: 'utf-8'});
const split =  code.split(IIFE_PROLOGUE);

const tmppath = path.join(dirpath, "tmp");
await fs.writeFile(tmppath, [IIFE_PROLOGUE, ...split]);
await fs.rename(tmppath, filepath);
