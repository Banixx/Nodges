import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../core/StateManager';

describe('StateManager Edge-based Group Management', () => {
    let stateManager: StateManager;

    beforeEach(() => {
        stateManager = new StateManager();
        stateManager.setGraphData(
            [
                { id: 'bundesrat', label: 'Bundesrat', type: 'group' },
                { id: 'roesti', label: 'Albert Roesti' },
                { id: 'baume', label: 'Elisabeth Baume-Schneider' }
            ],
            []
        );
    });

    it('sollte isGroupNode fuer einen expliziten Gruppen-Knoten als true erkennen', () => {
        expect(stateManager.isGroupNode('bundesrat')).toBe(true);
        expect(stateManager.isGroupNode('roesti')).toBe(false);
    });

    it('sollte einen neuen Gruppen-Knoten mit createGroupNode erstellen', () => {
        const newGroup = stateManager.createGroupNode('Parlament');
        expect(newGroup.id).toBeDefined();
        expect(newGroup.label).toBe('Parlament');
        expect(newGroup.type).toBe('group');
        expect(stateManager.isGroupNode(newGroup.id)).toBe(true);
    });

    it('sollte Knoten mit addNodeToGroup zu einer Gruppe hinzufuegen', () => {
        const edge = stateManager.addNodeToGroup('roesti', 'bundesrat');
        expect(edge).toBeDefined();
        expect(edge.source).toBe('roesti');
        expect(edge.target).toBe('bundesrat');
        expect(edge.relation).toBe('belongs_to');

        expect(stateManager.isGroupNode('bundesrat')).toBe(true);
    });

    it('sollte getGroupMembers korrekt fuer eine Gruppe zurueckgeben', () => {
        stateManager.addNodeToGroup('roesti', 'bundesrat');
        stateManager.addNodeToGroup('baume', 'bundesrat');

        const members = stateManager.getGroupMembers('bundesrat');
        expect(members.length).toBe(2);
        const memberIds = members.map(m => m.id);
        expect(memberIds).toContain('roesti');
        expect(memberIds).toContain('baume');
    });

    it('sollte getNodeGroups korrekt fuer ein Mitglied zurueckgeben', () => {
        stateManager.addNodeToGroup('roesti', 'bundesrat');

        const groups = stateManager.getNodeGroups('roesti');
        expect(groups.length).toBe(1);
        expect(groups[0].id).toBe('bundesrat');
    });

    it('sollte removeNodeFromGroup die Mitgliedschafts-Edge entfernen', () => {
        stateManager.addNodeToGroup('roesti', 'bundesrat');
        expect(stateManager.getGroupMembers('bundesrat').length).toBe(1);

        stateManager.removeNodeFromGroup('roesti', 'bundesrat');
        expect(stateManager.getGroupMembers('bundesrat').length).toBe(0);
    });

    it('sollte getAllGroups alle Gruppen-Knoten auflisten', () => {
        stateManager.addNodeToGroup('roesti', 'bundesrat');
        const groups = stateManager.getAllGroups();
        expect(groups.length).toBeGreaterThanOrEqual(1);
        expect(groups.some(g => g.id === 'bundesrat')).toBe(true);
    });

    it('sollte Undo/Redo fuer addNodeToGroup unterstuetzen', () => {
        stateManager.addNodeToGroup('roesti', 'bundesrat');
        expect(stateManager.getGroupMembers('bundesrat').length).toBe(1);

        stateManager.undo();
        expect(stateManager.getGroupMembers('bundesrat').length).toBe(0);

        stateManager.redo();
        expect(stateManager.getGroupMembers('bundesrat').length).toBe(1);
    });
});
