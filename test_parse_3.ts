import { DataParser } from './src/core/DataParser';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/data/b10/B10_GK_QK_BF_5_Build10_Raw_Graph_2026-07-18T06-44-40-073Z.json'));
try {
    DataParser.parse(data);
    console.log('Parsed successfully');
} catch (e: any) {
    console.error('Error parsing:', e.message);
}
