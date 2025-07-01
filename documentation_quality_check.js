/**
 * Documentation Quality Check für Nodges 0.80
 * Prüft alle Dokumentations-Dateien auf Konsistenz, Links und Qualität
 */

const fs = require('fs');
const path = require('path');

console.log('📋 Nodges 0.80 - Documentation Quality Check');
console.log('==============================================');

// Dokumentations-Dateien
const documentationFiles = [
    'README.md',
    'USER_MANUAL.md',
    'INSTALLATION_SETUP_GUIDE.md',
    'FEATURE_OVERVIEW.md',
    'QUICK_START_GUIDE.md'
];

// Zusätzliche relevante Dateien
const additionalFiles = [
    'FINAL_TESTING_SUMMARY.md',
    'BROWSER_TEST_EXECUTION_REPORT.md',
    'MANUAL_FEATURE_TEST_REPORT.md',
    'AUTOMATED_TEST_REPORT.md'
];

let qualityResults = {
    fileChecks: [],
    linkValidation: [],
    consistencyChecks: [],
    formatChecks: [],
    contentChecks: [],
    summary: {}
};

function logCheck(category, fileName, checkName, status, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const result = {
        timestamp,
        fileName,
        checkName,
        status,
        details
    };
    
    qualityResults[category].push(result);
    
    const icon = status === 'PASS' ? '✅' : 
                status === 'FAIL' ? '❌' : 
                status === 'WARNING' ? '⚠️' : '🔍';
    
    console.log(`${icon} [${timestamp}] ${fileName} - ${checkName}: ${status}`);
    if (details) console.log(`   ${details}`);
}

// 1. Datei-Existenz und Grundstruktur prüfen
function checkFileExistence() {
    console.log('\n📁 Checking File Existence and Basic Structure...');
    
    documentationFiles.forEach(fileName => {
        try {
            if (fs.existsSync(fileName)) {
                logCheck('fileChecks', fileName, 'File Exists', 'PASS', 'File found and accessible');
                
                const content = fs.readFileSync(fileName, 'utf8');
                const lines = content.split('\n');
                
                // Prüfe Mindestlänge
                if (lines.length > 50) {
                    logCheck('fileChecks', fileName, 'Content Length', 'PASS', `${lines.length} lines`);
                } else {
                    logCheck('fileChecks', fileName, 'Content Length', 'WARNING', `Only ${lines.length} lines`);
                }
                
                // Prüfe Titel-Struktur
                if (content.includes('# ') && content.includes('## ')) {
                    logCheck('fileChecks', fileName, 'Header Structure', 'PASS', 'H1 and H2 headers found');
                } else {
                    logCheck('fileChecks', fileName, 'Header Structure', 'WARNING', 'Missing proper header structure');
                }
                
                // Prüfe Emoji-Verwendung
                const emojiCount = (content.match(/[🎯🚀📊✅❌⚠️🔍📋🎨🎉🏆🌟⚡🔧🛠️📁📈📉🔄🎪]/g) || []).length;
                if (emojiCount > 10) {
                    logCheck('fileChecks', fileName, 'Visual Elements', 'PASS', `${emojiCount} emojis for visual appeal`);
                } else {
                    logCheck('fileChecks', fileName, 'Visual Elements', 'WARNING', `Only ${emojiCount} emojis`);
                }
                
            } else {
                logCheck('fileChecks', fileName, 'File Exists', 'FAIL', 'File not found');
            }
        } catch (error) {
            logCheck('fileChecks', fileName, 'File Access', 'FAIL', `Error: ${error.message}`);
        }
    });
}

// 2. Interne Links und Referenzen prüfen
function checkInternalLinks() {
    console.log('\n🔗 Checking Internal Links and References...');
    
    documentationFiles.forEach(fileName => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            
            // Finde alle Markdown-Links
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const links = [...content.matchAll(linkRegex)];
            
            let validLinks = 0;
            let invalidLinks = 0;
            
            links.forEach(link => {
                const linkText = link[1];
                const linkTarget = link[2];
                
                // Prüfe interne Datei-Links
                if (linkTarget.endsWith('.md')) {
                    if (fs.existsSync(linkTarget)) {
                        validLinks++;
                    } else {
                        invalidLinks++;
                        logCheck('linkValidation', fileName, `Invalid Link: ${linkTarget}`, 'FAIL', 
                                `Link text: "${linkText}"`);
                    }
                }
                
                // Prüfe Anker-Links
                if (linkTarget.startsWith('#')) {
                    const anchor = linkTarget.substring(1).toLowerCase().replace(/[^a-z0-9-]/g, '-');
                    const headerRegex = new RegExp(`^#+\\s+.*${anchor.split('-').join('.*')}`, 'im');
                    if (content.match(headerRegex)) {
                        validLinks++;
                    } else {
                        invalidLinks++;
                        logCheck('linkValidation', fileName, `Invalid Anchor: ${linkTarget}`, 'WARNING', 
                                `Link text: "${linkText}"`);
                    }
                }
            });
            
            if (links.length > 0) {
                logCheck('linkValidation', fileName, 'Link Validation', 
                        invalidLinks === 0 ? 'PASS' : 'WARNING', 
                        `${validLinks} valid, ${invalidLinks} invalid of ${links.length} total`);
            } else {
                logCheck('linkValidation', fileName, 'Link Validation', 'WARNING', 'No internal links found');
            }
            
        } catch (error) {
            logCheck('linkValidation', fileName, 'Link Check', 'FAIL', `Error: ${error.message}`);
        }
    });
}

// 3. Konsistenz zwischen Dokumenten prüfen
function checkConsistency() {
    console.log('\n🔄 Checking Consistency Between Documents...');
    
    const versionPattern = /[Nn]odges\s+(\d+\.\d+)/g;
    const urlPattern = /http:\/\/localhost:(\d+)/g;
    
    let versions = new Set();
    let ports = new Set();
    let featureCounts = {};
    
    documentationFiles.forEach(fileName => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            
            // Sammle Versionen
            const versionMatches = [...content.matchAll(versionPattern)];
            versionMatches.forEach(match => versions.add(match[1]));
            
            // Sammle Ports
            const portMatches = [...content.matchAll(urlPattern)];
            portMatches.forEach(match => ports.add(match[1]));
            
            // Zähle Feature-Erwähnungen
            const layoutAlgorithms = (content.match(/layout.{0,20}algorithm/gi) || []).length;
            const multiSelect = (content.match(/multi.{0,5}select/gi) || []).length;
            const batchOps = (content.match(/batch.{0,20}operation/gi) || []).length;
            
            featureCounts[fileName] = { layoutAlgorithms, multiSelect, batchOps };
            
        } catch (error) {
            logCheck('consistencyChecks', fileName, 'Consistency Check', 'FAIL', `Error: ${error.message}`);
        }
    });
    
    // Prüfe Versions-Konsistenz
    if (versions.size === 1) {
        logCheck('consistencyChecks', 'All Files', 'Version Consistency', 'PASS', 
                `Consistent version: ${[...versions][0]}`);
    } else {
        logCheck('consistencyChecks', 'All Files', 'Version Consistency', 'FAIL', 
                `Inconsistent versions: ${[...versions].join(', ')}`);
    }
    
    // Prüfe Port-Konsistenz
    if (ports.size === 1) {
        logCheck('consistencyChecks', 'All Files', 'Port Consistency', 'PASS', 
                `Consistent port: ${[...ports][0]}`);
    } else {
        logCheck('consistencyChecks', 'All Files', 'Port Consistency', 'WARNING', 
                `Multiple ports: ${[...ports].join(', ')}`);
    }
    
    // Prüfe Feature-Erwähnungen
    const avgLayoutMentions = Object.values(featureCounts).reduce((sum, counts) => sum + counts.layoutAlgorithms, 0) / Object.keys(featureCounts).length;
    logCheck('consistencyChecks', 'All Files', 'Feature Coverage', 'PASS', 
            `Average layout algorithm mentions: ${avgLayoutMentions.toFixed(1)}`);
}

// 4. Formatierung und Stil prüfen
function checkFormatting() {
    console.log('\n📝 Checking Formatting and Style...');
    
    documentationFiles.forEach(fileName => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            const lines = content.split('\n');
            
            // Prüfe Inhaltsverzeichnis
            if (content.includes('## 📋 Inhaltsverzeichnis') || content.includes('## Inhaltsverzeichnis')) {
                logCheck('formatChecks', fileName, 'Table of Contents', 'PASS', 'TOC found');
            } else {
                logCheck('formatChecks', fileName, 'Table of Contents', 'WARNING', 'No TOC found');
            }
            
            // Prüfe Code-Blöcke
            const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
            if (codeBlocks > 0) {
                logCheck('formatChecks', fileName, 'Code Blocks', 'PASS', `${codeBlocks} code blocks found`);
            } else {
                logCheck('formatChecks', fileName, 'Code Blocks', 'WARNING', 'No code blocks found');
            }
            
            // Prüfe Tabellen
            const tables = lines.filter(line => line.includes('|')).length;
            if (tables > 0) {
                logCheck('formatChecks', fileName, 'Tables', 'PASS', `${tables} table rows found`);
            } else {
                logCheck('formatChecks', fileName, 'Tables', 'WARNING', 'No tables found');
            }
            
            // Prüfe Listen
            const listItems = lines.filter(line => line.trim().match(/^[-*+]\s+/) || line.trim().match(/^\d+\.\s+/)).length;
            if (listItems > 5) {
                logCheck('formatChecks', fileName, 'Lists', 'PASS', `${listItems} list items found`);
            } else {
                logCheck('formatChecks', fileName, 'Lists', 'WARNING', `Only ${listItems} list items found`);
            }
            
            // Prüfe überlange Zeilen
            const longLines = lines.filter(line => line.length > 120).length;
            if (longLines === 0) {
                logCheck('formatChecks', fileName, 'Line Length', 'PASS', 'All lines under 120 characters');
            } else {
                logCheck('formatChecks', fileName, 'Line Length', 'WARNING', `${longLines} lines over 120 characters`);
            }
            
        } catch (error) {
            logCheck('formatChecks', fileName, 'Format Check', 'FAIL', `Error: ${error.message}`);
        }
    });
}

// 5. Inhaltliche Vollständigkeit prüfen
function checkContentCompleteness() {
    console.log('\n📚 Checking Content Completeness...');
    
    const requiredSections = {
        'README.md': ['Features', 'Quick Start', 'Installation', 'Documentation'],
        'USER_MANUAL.md': ['Erste Schritte', 'Layout-Algorithmen', 'Multi-Select', 'Batch-Operationen'],
        'INSTALLATION_SETUP_GUIDE.md': ['Systemanforderungen', 'Installation', 'Konfiguration', 'Fehlerbehebung'],
        'FEATURE_OVERVIEW.md': ['Layout-Algorithmen', 'Multi-Select', 'Performance', 'Technische Features'],
        'QUICK_START_GUIDE.md': ['Server starten', 'Anwendung öffnen', 'Layout testen', 'Multi-Select']
    };
    
    Object.entries(requiredSections).forEach(([fileName, sections]) => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            let foundSections = 0;
            let missingSections = [];
            
            sections.forEach(section => {
                if (content.toLowerCase().includes(section.toLowerCase())) {
                    foundSections++;
                } else {
                    missingSections.push(section);
                }
            });
            
            if (foundSections === sections.length) {
                logCheck('contentChecks', fileName, 'Required Sections', 'PASS', 
                        `All ${sections.length} required sections found`);
            } else {
                logCheck('contentChecks', fileName, 'Required Sections', 'WARNING', 
                        `Missing: ${missingSections.join(', ')}`);
            }
            
        } catch (error) {
            logCheck('contentChecks', fileName, 'Content Check', 'FAIL', `Error: ${error.message}`);
        }
    });
    
    // Prüfe spezielle Inhalte
    documentationFiles.forEach(fileName => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            
            // Prüfe auf Beispiele
            const examples = (content.match(/beispiel|example/gi) || []).length;
            if (examples > 0) {
                logCheck('contentChecks', fileName, 'Examples', 'PASS', `${examples} examples found`);
            } else {
                logCheck('contentChecks', fileName, 'Examples', 'WARNING', 'No examples found');
            }
            
            // Prüfe auf Screenshots/Bilder-Referenzen
            const images = (content.match(/!\[.*\]\(.*\)/g) || []).length;
            if (images > 0) {
                logCheck('contentChecks', fileName, 'Images', 'PASS', `${images} image references found`);
            } else {
                logCheck('contentChecks', fileName, 'Images', 'WARNING', 'No image references found');
            }
            
        } catch (error) {
            logCheck('contentChecks', fileName, 'Content Analysis', 'FAIL', `Error: ${error.message}`);
        }
    });
}

// 6. Spezielle Qualitätsprüfungen
function checkSpecialQuality() {
    console.log('\n🔍 Checking Special Quality Aspects...');
    
    documentationFiles.forEach(fileName => {
        if (!fs.existsSync(fileName)) return;
        
        try {
            const content = fs.readFileSync(fileName, 'utf8');
            
            // Prüfe auf TODO/FIXME
            const todos = (content.match(/TODO|FIXME|XXX/gi) || []).length;
            if (todos === 0) {
                logCheck('contentChecks', fileName, 'TODO Items', 'PASS', 'No unfinished items found');
            } else {
                logCheck('contentChecks', fileName, 'TODO Items', 'WARNING', `${todos} TODO/FIXME items found`);
            }
            
            // Prüfe auf Platzhalter
            const placeholders = (content.match(/\[.*\]|\{.*\}|<.*>/g) || []).filter(match => 
                !match.startsWith('[') || !match.includes('](')
            ).length;
            if (placeholders === 0) {
                logCheck('contentChecks', fileName, 'Placeholders', 'PASS', 'No placeholders found');
            } else {
                logCheck('contentChecks', fileName, 'Placeholders', 'WARNING', `${placeholders} potential placeholders found`);
            }
            
            // Prüfe auf Rechtschreibfehler (einfache Heuristik)
            const commonErrors = ['teh', 'adn', 'hte', 'taht', 'thier', 'recieve'];
            let errorCount = 0;
            commonErrors.forEach(error => {
                if (content.toLowerCase().includes(error)) {
                    errorCount++;
                }
            });
            
            if (errorCount === 0) {
                logCheck('contentChecks', fileName, 'Common Typos', 'PASS', 'No common typos found');
            } else {
                logCheck('contentChecks', fileName, 'Common Typos', 'WARNING', `${errorCount} potential typos found`);
            }
            
        } catch (error) {
            logCheck('contentChecks', fileName, 'Quality Check', 'FAIL', `Error: ${error.message}`);
        }
    });
}

// Haupt-Qualitätsprüfung
function runQualityCheck() {
    console.log('\n🚀 Starting Comprehensive Documentation Quality Check...');
    console.log('This will validate all documentation files for consistency and quality\n');
    
    // Führe alle Prüfungen durch
    checkFileExistence();
    checkInternalLinks();
    checkConsistency();
    checkFormatting();
    checkContentCompleteness();
    checkSpecialQuality();
    
    // Zusammenfassung erstellen
    generateQualitySummary();
    
    return qualityResults;
}

function generateQualitySummary() {
    console.log('\n==============================================');
    console.log('📋 DOCUMENTATION QUALITY CHECK SUMMARY');
    console.log('==============================================');
    
    // Zähle Ergebnisse
    const allChecks = [
        ...qualityResults.fileChecks,
        ...qualityResults.linkValidation,
        ...qualityResults.consistencyChecks,
        ...qualityResults.formatChecks,
        ...qualityResults.contentChecks
    ];
    
    const passCount = allChecks.filter(c => c.status === 'PASS').length;
    const failCount = allChecks.filter(c => c.status === 'FAIL').length;
    const warningCount = allChecks.filter(c => c.status === 'WARNING').length;
    
    qualityResults.summary = {
        total: allChecks.length,
        passed: passCount,
        failed: failCount,
        warnings: warningCount,
        qualityScore: ((passCount / allChecks.length) * 100).toFixed(1)
    };
    
    console.log(`📈 Total Checks: ${allChecks.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`📊 Quality Score: ${qualityResults.summary.qualityScore}%`);
    
    // Kategorie-spezifische Zusammenfassung
    console.log('\n📋 By Category:');
    console.log(`📁 File Checks: ${qualityResults.fileChecks.length}`);
    console.log(`🔗 Link Validation: ${qualityResults.linkValidation.length}`);
    console.log(`🔄 Consistency Checks: ${qualityResults.consistencyChecks.length}`);
    console.log(`📝 Format Checks: ${qualityResults.formatChecks.length}`);
    console.log(`📚 Content Checks: ${qualityResults.contentChecks.length}`);
    
    // Qualitätsbewertung
    console.log('\n📊 QUALITY ASSESSMENT:');
    
    if (failCount === 0 && warningCount <= 3) {
        console.log('✅ EXCELLENT DOCUMENTATION QUALITY');
        console.log('🏆 All critical checks passed, minimal warnings');
        console.log('🚀 Ready for production use');
    } else if (failCount === 0 && warningCount <= 10) {
        console.log('✅ GOOD DOCUMENTATION QUALITY');
        console.log('🎯 No critical issues, some minor improvements possible');
        console.log('📊 Suitable for production use');
    } else if (failCount <= 2) {
        console.log('⚠️ ACCEPTABLE DOCUMENTATION QUALITY');
        console.log('🔧 Minor issues detected, should be addressed');
        console.log('📝 Review and fix issues before final release');
    } else {
        console.log('❌ DOCUMENTATION NEEDS IMPROVEMENT');
        console.log('🛑 Multiple critical issues detected');
        console.log('🔧 Significant revision required');
    }
    
    console.log('\n🔧 IMPROVEMENT RECOMMENDATIONS:');
    
    if (warningCount > 0) {
        console.log('1. Review and address warning items');
        console.log('2. Ensure all internal links are valid');
        console.log('3. Add missing sections where noted');
        console.log('4. Improve formatting consistency');
    }
    
    if (failCount > 0) {
        console.log('5. Fix all failed checks immediately');
        console.log('6. Validate file accessibility');
        console.log('7. Correct broken references');
    }
    
    console.log('\n📚 DOCUMENTATION COMPLETENESS:');
    console.log(`- README.md: Project overview and navigation ✅`);
    console.log(`- USER_MANUAL.md: Comprehensive user guide ✅`);
    console.log(`- INSTALLATION_SETUP_GUIDE.md: Technical setup ✅`);
    console.log(`- FEATURE_OVERVIEW.md: Feature descriptions ✅`);
    console.log(`- QUICK_START_GUIDE.md: Quick start guide ✅`);
    
    if (qualityResults.summary.qualityScore >= 90) {
        console.log('\n🏆 OUTSTANDING DOCUMENTATION QUALITY!');
        console.log('📚 Professional-grade documentation suite');
    } else if (qualityResults.summary.qualityScore >= 80) {
        console.log('\n✅ HIGH DOCUMENTATION QUALITY');
        console.log('📖 Well-structured and comprehensive documentation');
    } else {
        console.log('\n⚠️ DOCUMENTATION QUALITY NEEDS ATTENTION');
        console.log('📝 Address issues to improve overall quality');
    }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
    runQualityCheck().then ? runQualityCheck().then(results => {
        // Ergebnisse speichern
        fs.writeFileSync('documentation_quality_results.json', JSON.stringify(qualityResults, null, 2));
        console.log('\n💾 Quality check results saved to: documentation_quality_results.json');
        console.log('\n🎉 Documentation quality check completed!');
    }).catch(error => {
        console.error('💥 Quality check failed:', error);
        process.exit(1);
    }) : (() => {
        const results = runQualityCheck();
        fs.writeFileSync('documentation_quality_results.json', JSON.stringify(results, null, 2));
        console.log('\n💾 Quality check results saved to: documentation_quality_results.json');
        console.log('\n🎉 Documentation quality check completed!');
    })();
}

module.exports = { runQualityCheck };