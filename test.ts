import * as fs from 'fs';
import { DataParser } from './src/core/DataParser';
const json = fs.readFileSync('./public/data/test_build3_step1_1.json', 'utf8');
const data = JSON.parse(json);
const parser = new DataParser();
const res = parser.parseGraphData(data);
console.log(res ? 'Success' : 'Fail');
