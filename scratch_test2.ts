function makeSchemaStrict(schema: any): any {
    if (typeof schema !== 'object' || schema === null) return schema;
    const newSchema = { ...schema };
    
    delete newSchema.default;
    
    if (newSchema.type === 'object') {
        if (newSchema.additionalProperties === true || newSchema.additionalProperties === undefined) {
            newSchema.additionalProperties = false;
        } else if (typeof newSchema.additionalProperties === 'object') {
            newSchema.additionalProperties = makeSchemaStrict(newSchema.additionalProperties);
        }

        if (newSchema.properties) {
            for (const key in newSchema.properties) {
                newSchema.properties[key] = makeSchemaStrict(newSchema.properties[key]);
            }
        }
    } else if (newSchema.type === 'array' && newSchema.items) {
        newSchema.items = makeSchemaStrict(newSchema.items);
    } else if (newSchema.anyOf) {
        newSchema.anyOf = newSchema.anyOf.map((s: any) => makeSchemaStrict(s));
    } else if (newSchema.allOf) {
        newSchema.allOf = newSchema.allOf.map((s: any) => makeSchemaStrict(s));
    } else if (newSchema.oneOf) {
        newSchema.oneOf = newSchema.oneOf.map((s: any) => makeSchemaStrict(s));
    }
    return newSchema;
}

const inputSchema = {"type":"object","properties":{"properties":{"type":"object","additionalProperties":{"type":"object","properties":{},"additionalProperties":false}}},"required":["properties"],"additionalProperties":false};
console.log(JSON.stringify(makeSchemaStrict(inputSchema), null, 2));
