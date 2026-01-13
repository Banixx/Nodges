/**
 * JSON-Funktionalitätstest für Nodges
 * 
 * Testet alle JSON-Dateien in public/data gegen das GraphDataSchema
 * und führt zusätzliche Konsistenzprüfungen durch.
 * 
 * Ausführung: npx tsx src/tests/json_test.ts
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Schema-Definitionen (aus types.ts kopiert für Standalone-Betrieb)
// ============================================================================

const PropertySchemaSchema = z.object({
    type: z.enum(['continuous', 'categorical', 'vector', 'spatial', 'temporal']),
    range: z.tuple([z.number(), z.number()]).optional(),
    unit: z.string().optional(),
    dimensions: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    coordinates: z.array(z.string()).optional(),
    default: z.any().optional(),
});

const EntityTypeSchemaSchema = z.object({
    properties: z.record(PropertySchemaSchema).optional().default({}),
});

const RelationshipTypeSchemaSchema = z.object({
    properties: z.record(PropertySchemaSchema).optional().default({}),
});

const DataModelSchema = z.object({
    entities: z.record(EntityTypeSchemaSchema),
    relationships: z.record(RelationshipTypeSchemaSchema),
});

const MappingFunctionSchema = z.enum([
    'linear', 'exponential', 'logarithmic', 'heatmap',
    'bipolar', 'pulse', 'geographic', 'sphereComplexity',
    'categorical', 'constant'
]);

const VisualMappingSchema = z.object({
    source: z.string(),
    function: MappingFunctionSchema,
    range: z.tuple([z.number(), z.number()]).optional(),
    palette: z.string().optional(),
    params: z.record(z.any()).optional(),
});

const EntityVisualPresetSchema = z.object({
    position: VisualMappingSchema.optional(),
    size: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    geometry: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
});

const RelationshipVisualPresetSchema = z.object({
    thickness: VisualMappingSchema.optional(),
    color: VisualMappingSchema.optional(),
    curvature: VisualMappingSchema.optional(),
    glow: VisualMappingSchema.optional(),
    opacity: VisualMappingSchema.optional(),
    animation: VisualMappingSchema.optional(),
});

const VisualMappingsSchema = z.object({
    defaultPresets: z.record(z.union([EntityVisualPresetSchema, RelationshipVisualPresetSchema])),
});

const EntityDataSchema = z.object({
    id: z.string(),
    type: z.string(),
    label: z.string().optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }).optional(),
}).passthrough();

const RelationshipDataSchema = z.object({
    id: z.string().optional(),
    type: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
}).passthrough();

const GraphDataSchema = z.object({
    system: z.string(),
    metadata: z.object({
        created: z.string().optional(),
        version: z.string().optional(),
        author: z.string().optional(),
        description: z.string().optional(),
    }).passthrough(),
    dataModel: DataModelSchema.optional(),
    visualMappings: VisualMappingsSchema.optional(),
    data: z.object({
        entities: z.array(EntityDataSchema),
        relationships: z.array(RelationshipDataSchema),
    }),
});

// ============================================================================
// Test-Ergebnis-Typen
// ============================================================================

interface TestError {
    type: 'json_syntax' | 'zod_validation' | 'duplicate_id' | 'missing_reference' | 'type_mismatch' | 'warning';
    message: string;
    path?: string;
}

interface FileTestResult {
    filename: string;
    success: boolean;
    errors: TestError[];
    warnings: TestError[];
    stats: {
        entities: number;
        relationships: number;
        entityTypes: string[];
        relationshipTypes: string[];
    } | null;
}

interface TestReport {
    timestamp: string;
    totalFiles: number;
    successCount: number;
    failCount: number;
    warningCount: number;
    results: FileTestResult[];
    errorSummary: Record<string, number>;
}

// ============================================================================
// Test-Funktionen
// ============================================================================

function testJSONSyntax(content: string): { success: boolean; data: any; error?: string } {
    try {
        const data = JSON.parse(content);
        return { success: true, data };
    } catch (e: any) {
        return { success: false, data: null, error: e.message };
    }
}

function testZodSchema(data: any): { success: boolean; errors: string[] } {
    const result = GraphDataSchema.safeParse(data);
    if (result.success) {
        return { success: true, errors: [] };
    } else {
        const errors = result.error.errors.map(err =>
            `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
    }
}

function testDuplicateEntityIds(data: any): string[] {
    const duplicates: string[] = [];
    if (!data?.data?.entities) return duplicates;

    const seen = new Set<string>();
    for (const entity of data.data.entities) {
        if (entity.id) {
            if (seen.has(entity.id)) {
                duplicates.push(entity.id);
            }
            seen.add(entity.id);
        }
    }
    return duplicates;
}

function testMissingReferences(data: any): string[] {
    const missing: string[] = [];
    if (!data?.data?.entities || !data?.data?.relationships) return missing;

    const entityIds = new Set(data.data.entities.map((e: any) => e.id));

    for (const rel of data.data.relationships) {
        if (rel.source && !entityIds.has(rel.source)) {
            missing.push(`Relationship "${rel.id || 'unknown'}": source "${rel.source}" existiert nicht`);
        }
        if (rel.target && !entityIds.has(rel.target)) {
            missing.push(`Relationship "${rel.id || 'unknown'}": target "${rel.target}" existiert nicht`);
        }
    }
    return missing;
}

function testTypeMismatch(data: any): string[] {
    const mismatches: string[] = [];
    if (!data?.dataModel?.entities || !data?.data?.entities) return mismatches;

    const definedTypes = new Set(Object.keys(data.dataModel.entities));
    const usedTypes = new Set(data.data.entities.map((e: any) => e.type));

    for (const type of usedTypes) {
        if (!definedTypes.has(type)) {
            mismatches.push(`Entity-Typ "${type}" ist nicht in dataModel.entities definiert`);
        }
    }

    // Relationship-Types prüfen
    if (data?.dataModel?.relationships && data?.data?.relationships) {
        const definedRelTypes = new Set(Object.keys(data.dataModel.relationships));
        const usedRelTypes = new Set(data.data.relationships.map((r: any) => r.type));

        for (const type of usedRelTypes) {
            if (!definedRelTypes.has(type)) {
                mismatches.push(`Relationship-Typ "${type}" ist nicht in dataModel.relationships definiert`);
            }
        }
    }

    return mismatches;
}

function collectStats(data: any): FileTestResult['stats'] | null {
    if (!data?.data?.entities) return null;

    const entityTypes = [...new Set(data.data.entities.map((e: any) => e.type))] as string[];
    const relationshipTypes = data.data.relationships
        ? [...new Set(data.data.relationships.map((r: any) => r.type))] as string[]
        : [];

    return {
        entities: data.data.entities.length,
        relationships: data.data.relationships?.length || 0,
        entityTypes,
        relationshipTypes
    };
}

function testFile(filepath: string): FileTestResult {
    const filename = path.basename(filepath);
    const result: FileTestResult = {
        filename,
        success: true,
        errors: [],
        warnings: [],
        stats: null
    };

    // 1. Datei lesen
    let content: string;
    try {
        content = fs.readFileSync(filepath, 'utf-8');
    } catch (e: any) {
        result.success = false;
        result.errors.push({ type: 'json_syntax', message: `Datei nicht lesbar: ${e.message}` });
        return result;
    }

    // 2. JSON-Syntax prüfen
    const jsonResult = testJSONSyntax(content);
    if (!jsonResult.success) {
        result.success = false;
        result.errors.push({ type: 'json_syntax', message: jsonResult.error! });
        return result;
    }

    const data = jsonResult.data;

    // 3. Zod-Schema validieren
    const zodResult = testZodSchema(data);
    if (!zodResult.success) {
        result.success = false;
        for (const error of zodResult.errors) {
            result.errors.push({ type: 'zod_validation', message: error });
        }
    }

    // 4. Statistiken sammeln (auch bei Fehlern)
    result.stats = collectStats(data);

    // 5. Duplikate prüfen
    const duplicates = testDuplicateEntityIds(data);
    for (const dup of duplicates) {
        result.success = false;
        result.errors.push({ type: 'duplicate_id', message: `Doppelte Entity-ID: "${dup}"` });
    }

    // 6. Referenzen prüfen
    const missing = testMissingReferences(data);
    for (const msg of missing) {
        result.success = false;
        result.errors.push({ type: 'missing_reference', message: msg });
    }

    // 7. Type-Mismatch prüfen (nur als Warnung, wenn dataModel vorhanden)
    if (data?.dataModel) {
        const mismatches = testTypeMismatch(data);
        for (const msg of mismatches) {
            result.warnings.push({ type: 'type_mismatch', message: msg });
        }
    }

    return result;
}

function generateReport(results: FileTestResult[]): TestReport {
    const errorSummary: Record<string, number> = {};
    let warningCount = 0;

    for (const result of results) {
        for (const error of result.errors) {
            errorSummary[error.type] = (errorSummary[error.type] || 0) + 1;
        }
        warningCount += result.warnings.length;
    }

    return {
        timestamp: new Date().toISOString(),
        totalFiles: results.length,
        successCount: results.filter(r => r.success).length,
        failCount: results.filter(r => !r.success).length,
        warningCount,
        results,
        errorSummary
    };
}

function formatReport(report: TestReport): string {
    const lines: string[] = [];

    lines.push('# JSON-Funktionalitätstest - Bericht');
    lines.push('');
    lines.push(`**Zeitstempel**: ${report.timestamp}`);
    lines.push('');
    lines.push('## Zusammenfassung');
    lines.push('');
    lines.push(`| Metrik | Wert |`);
    lines.push(`|--------|------|`);
    lines.push(`| Getestete Dateien | ${report.totalFiles} |`);
    lines.push(`| Erfolgreiche Tests | ${report.successCount} |`);
    lines.push(`| Fehlgeschlagene Tests | ${report.failCount} |`);
    lines.push(`| Warnungen | ${report.warningCount} |`);
    lines.push('');

    if (Object.keys(report.errorSummary).length > 0) {
        lines.push('## Fehlerübersicht');
        lines.push('');
        lines.push('| Fehlertyp | Anzahl |');
        lines.push('|-----------|--------|');
        for (const [type, count] of Object.entries(report.errorSummary)) {
            lines.push(`| ${type} | ${count} |`);
        }
        lines.push('');
    }

    // Fehlgeschlagene Tests zuerst
    const failed = report.results.filter(r => !r.success);
    if (failed.length > 0) {
        lines.push('## Fehlgeschlagene Tests');
        lines.push('');
        for (const result of failed) {
            lines.push(`### ${result.filename}`);
            lines.push('');
            if (result.stats) {
                lines.push(`- Entities: ${result.stats.entities}, Relationships: ${result.stats.relationships}`);
            }
            lines.push('');
            lines.push('**Fehler:**');
            for (const error of result.errors) {
                lines.push(`- \`${error.type}\`: ${error.message}`);
            }
            if (result.warnings.length > 0) {
                lines.push('');
                lines.push('**Warnungen:**');
                for (const warning of result.warnings) {
                    lines.push(`- \`${warning.type}\`: ${warning.message}`);
                }
            }
            lines.push('');
        }
    }

    // Erfolgreiche Tests mit Warnungen
    const withWarnings = report.results.filter(r => r.success && r.warnings.length > 0);
    if (withWarnings.length > 0) {
        lines.push('## Erfolgreiche Tests mit Warnungen');
        lines.push('');
        for (const result of withWarnings) {
            lines.push(`### ${result.filename}`);
            lines.push('');
            if (result.stats) {
                lines.push(`- Entities: ${result.stats.entities}, Relationships: ${result.stats.relationships}`);
            }
            lines.push('');
            lines.push('**Warnungen:**');
            for (const warning of result.warnings) {
                lines.push(`- \`${warning.type}\`: ${warning.message}`);
            }
            lines.push('');
        }
    }

    // Vollständig erfolgreiche Tests
    const perfect = report.results.filter(r => r.success && r.warnings.length === 0);
    if (perfect.length > 0) {
        lines.push('## Vollständig erfolgreiche Tests');
        lines.push('');
        lines.push('| Datei | Entities | Relationships | Entity-Typen |');
        lines.push('|-------|----------|---------------|--------------|');
        for (const result of perfect) {
            const stats = result.stats;
            if (stats) {
                lines.push(`| ${result.filename} | ${stats.entities} | ${stats.relationships} | ${stats.entityTypes.join(', ')} |`);
            } else {
                lines.push(`| ${result.filename} | - | - | - |`);
            }
        }
        lines.push('');
    }

    return lines.join('\n');
}

// ============================================================================
// Hauptprogramm
// ============================================================================

function main() {
    // Pfad zu public/data ermitteln
    const scriptDir = path.dirname(process.argv[1]);
    const dataDir = path.resolve(scriptDir, '../../public/data');

    console.log(`\n========================================`);
    console.log(`JSON-Funktionalitätstest für Nodges`);
    console.log(`========================================\n`);
    console.log(`Datenverzeichnis: ${dataDir}\n`);

    // JSON-Dateien finden
    if (!fs.existsSync(dataDir)) {
        console.error(`FEHLER: Verzeichnis ${dataDir} existiert nicht!`);
        process.exit(1);
    }

    const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(dataDir, f));

    console.log(`Gefundene JSON-Dateien: ${files.length}\n`);

    // Tests durchführen
    const results: FileTestResult[] = [];
    for (const file of files) {
        const filename = path.basename(file);
        process.stdout.write(`Testing ${filename}... `);
        const result = testFile(file);
        results.push(result);
        console.log(result.success ? 'OK' : 'FEHLER');
    }

    // Bericht generieren
    const report = generateReport(results);
    const reportText = formatReport(report);

    // Bericht ausgeben
    console.log('\n' + reportText);

    // Bericht speichern
    const reportPath = path.resolve(scriptDir, 'json_test_report.md');
    fs.writeFileSync(reportPath, reportText, 'utf-8');
    console.log(`\nBericht gespeichert unter: ${reportPath}`);

    // Exit-Code basierend auf Testergebnis
    process.exit(report.failCount > 0 ? 1 : 0);
}

main();
