import { DataParser } from './src/core/DataParser';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/data/b6/1_SingleStep_Graph_2026-07-17T08-20-17.json', 'utf-8'));

try {
    DataParser.parse(data);
    console.log("Success");
} catch (e: any) {
    console.error("Error:", e.message);
}
