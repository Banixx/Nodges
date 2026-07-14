import { test, expect } from 'vitest';
import { writeFileSync } from 'fs';
import { GraphDataSchema } from '../types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { resolve } from 'path';

test('export json schema', () => {
    const jsonSchema = zodToJsonSchema(GraphDataSchema, 'GraphDataSchema');
    const outputPath = resolve(__dirname, '../../public/data/nodges_schema.json');
    writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));
    console.log('JSON Schema successfully written to:', outputPath);
    expect(true).toBe(true);
});
