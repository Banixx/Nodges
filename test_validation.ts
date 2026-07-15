import { readFileSync } from 'fs';
import { GraphDataSchema } from './src/types.ts';

const fileContent = readFileSync('./public/data/b10/b10_none_none_llm_2026-07-15T07-25-55-666Z_06_raw_graph.json', 'utf8');
const data = JSON.parse(fileContent);

const result = GraphDataSchema.safeParse(data);
if (!result.success) {
    console.log("Validation failed:");
    console.log(JSON.stringify(result.error.format(), null, 2));
} else {
    console.log("Validation successful!");
}
