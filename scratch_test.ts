import { readFileSync } from 'fs';
import { GraphDataSchema } from './src/types.js';

const data = JSON.parse(readFileSync('./public/data/generated/AI_Generation_2026-07-12T11-13-51.json', 'utf8'));
const result = GraphDataSchema.safeParse(data);

if (!result.success) {
    console.error(result.error);
} else {
    console.log("Success!");
}
