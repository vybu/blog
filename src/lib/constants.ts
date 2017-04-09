import nodeSass = require('node-sass');
import path = require('path');
import fs = require('fs');


export const dist = path.join(__dirname, '../../../dist');
export const stylesEntryFile = path.join(__dirname, '../../styles/main.scss');
