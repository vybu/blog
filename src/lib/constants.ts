import * as path from 'path';
// TODO: this file should be in upper dirs, since it's used by server, templates, generator
export const dist = path.join(__dirname, '../../dist');
export const stylesEntryFile = path.join(__dirname, '../../src/styles/main.scss');
export const stylesPaths = path.join(__dirname, '../styles');
export const jsEntryFile = path.join(__dirname, '../../src/client/index.ts');
export const swFile = path.join(__dirname, '../../src/client/sw/sw.ts');
export const staticFilesPath = path.join(__dirname, '../static');
export const isDevMode = process.env.NODE_ENV === 'development';
export const isTestMode = process.env.NODE_ENV === 'test';
export const serverPort = process.env.PORT || 3006;
export const triggerBuildHookUrl = process.env.buildTriggerHook;
