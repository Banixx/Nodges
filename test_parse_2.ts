import { DataParser } from './src/core/DataParser';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/data/b10/B10_GW_QG_BF_6_Build10_Critic_Corrected_Graph_2026-07-18T08-03-06-552Z.json'));
try {
    DataParser.parse(data);
    console.log('Parsed BF_6 successfully');
} catch (e: any) {
    console.error('Error parsing BF_6:', e.message);
}
