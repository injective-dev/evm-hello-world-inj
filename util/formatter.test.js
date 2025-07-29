import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import formatter from './formatter.js';

test('formatter.forTerminal', async (t) => {
    await t.test('formatForTerminal - START message type', async () => {
        const result = formatter.forTerminal('START', 'Test message');
        assert.deepEqual(result, [
            '🏁\x1b[1m\x1b[32m',
            'Test message',
            '\x1b[0m',
            '…'
        ], 'START formatting should include start character, bright green, and hellip');
    });

    await t.test('formatForTerminal - SECTION message type', async () => {
        const result = formatter.forTerminal('SECTION', 'Section title');
        assert.deepEqual(result, [
            '🟣\x1b[1m\x1b[35m',
            'Section title',
            '\x1b[0m',
            '…'
        ], 'SECTION formatting should include section character, bright purple, and hellip');
    });

    await t.test('formatForTerminal - REMINDER message type', async () => {
        const result = formatter.forTerminal('REMINDER', 'Remember this');
        assert.deepEqual(result, [
            '🧐\x1b[1m\x1b[36m',
            'Remember this',
            '\x1b[0m',
            '…'
        ], 'REMINDER formatting should include reminder character, bright cyan, and hellip');
    });

    await t.test('formatForTerminal - COMPLETE message type', async () => {
        const result = formatter.forTerminal('COMPLETE', 'Task done');
        assert.deepEqual(result, [
            '🎉\x1b[1m\x1b[32m',
            'Task done',
            '\x1b[0m',
            '…'
        ], 'COMPLETE formatting should include complete character, bright green, and hellip');
    });

    await t.test('formatForTerminal - ERROR message type', async () => {
        const result = formatter.forTerminal('ERROR', 'Error occurred');
        assert.deepEqual(result, [
            '❌\x1b[1m\x1b[31m',
            'Error occurred',
            '\x1b[0m',
            '…'
        ], 'ERROR formatting should include error character, bright red, and hellip');
    });

    await t.test('formatForTerminal - SUMMARY message type', async () => {
        const result = formatter.forTerminal('SUMMARY', 'Summary text');
        assert.deepEqual(result, [
            '🔢\x1b[1m\x1b[33m',
            'Summary text',
            '\x1b[0m',
            '…'
        ], 'SUMMARY formatting should include summary character, bright yellow, and hellip');
    });

    await t.test('formatForTerminal - BOLD message type', async () => {
        const result = formatter.forTerminal('BOLD', 'Bold text');
        assert.deepEqual(result, [
            '\x1b[1m',
            'Bold text',
            '\x1b[0m'
        ], 'BOLD formatting should include bright and reset codes');
    });

    await t.test('formatForTerminal - URL message type with single string', async () => {
        const result = formatter.forTerminal('URL', 'https://example.com');
        assert.deepEqual(result, [
            '\x1b[4m\x1b[36mhttps://example.com\x1b[39m\x1b[24m'
        ], 'URL formatting should include underline and cyan color');
    });

    await t.test('formatForTerminal - URL message type with multiple strings', async () => {
        const result = formatter.forTerminal('URL', 'https://example.com', 'https://test.org');
        assert.deepEqual(result, [
            '\x1b[4m\x1b[36mhttps://example.com\x1b[39m\x1b[24m',
            '\x1b[4m\x1b[36mhttps://test.org\x1b[39m\x1b[24m'
        ], 'URL formatting should apply to each string separately');
    });

    await t.test('formatForTerminal - default case (unknown message type)', async () => {
        const result = formatter.forTerminal('UNKNOWN', 'Default text');
        assert.deepEqual(result, ['Default text'], 'Unknown message types should return strings unchanged');
    });

    await t.test('formatForTerminal - undefined message type', async () => {
        const result = formatter.forTerminal(undefined, 'Test text');
        assert.deepEqual(result, ['Test text'], 'Undefined message type should return strings unchanged');
    });

    await t.test('formatForTerminal - null message type', async () => {
        const result = formatter.forTerminal(null, 'Test text');
        assert.deepEqual(result, ['Test text'], 'Null message type should return strings unchanged');
    });

    await t.test('formatForTerminal - empty string message type', async () => {
        const result = formatter.forTerminal('', 'Test text');
        assert.deepEqual(result, ['Test text'], 'Empty string message type should return strings unchanged');
    });

    await t.test('formatForTerminal - case insensitive message types', async () => {
        const result1 = formatter.forTerminal('start', 'Test message');
        const result2 = formatter.forTerminal('START', 'Test message');
        assert.deepEqual(result1, result2, 'Message types should be case insensitive');
    });

    await t.test('formatForTerminal - multiple strings with START type', async () => {
        const result = formatter.forTerminal('START', 'First', 'Second', 'Third');
        assert.deepEqual(result, [
            '🏁\x1b[1m\x1b[32m',
            'First',
            'Second',
            'Third',
            '\x1b[0m',
            '…'
        ], 'Multiple strings should be included in the formatted output');
    });

    await t.test('formatForTerminal - empty strings array', async () => {
        const result = formatter.forTerminal('START');
        assert.deepEqual(result, [
            '🏁\x1b[1m\x1b[32m',
            '\x1b[0m',
            '…'
        ], 'Should handle empty strings array');
    });
});