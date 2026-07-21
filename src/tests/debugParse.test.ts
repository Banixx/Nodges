import { describe, it } from 'vitest';
import * as fs from 'fs';
import { DataParser } from '../core/DataParser';
import * as path from 'path';

describe('DataParser Debug', () => {
    it('should parse the B10 json', () => {
        const filePath = path.join(__dirname, '../../public/data/b10/B10_T08_P1_K0_GK_QK_BF_5_Build10_Raw_Graph_2026-07-20T16-07-52-119Z.json');
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        try {
            DataParser.parse(json);
            console.log("Parse Success!");
        } catch (e: any) {
            console.error("Parse Error:", e.errors || e.message);
            throw e;
        }
    });
});
