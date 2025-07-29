import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs/promises';
import path from 'node:path';
import url from 'url';
import util from 'node:util';
import child_process from 'node:child_process';

import { Logger } from './logger.js';

const { fileURLToPath } = url;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const childProcessExec = util.promisify(child_process.exec);

test('Logger', async (t) => {
    const configFile = path.resolve(__dirname, '../config.json');
    const packageJsonFile = path.resolve(__dirname, '../package.json');
    const dotEnvFile = path.resolve(__dirname, '../.env');

    let logger = null;

    await t.before(async () => {
        // swap config and dotenv files with dummy ones for tests
        await childProcessExec(`mv ${configFile} ${configFile}.test.bak`);
        await childProcessExec(`mv ${dotEnvFile} ${dotEnvFile}.test.bak`);
        await childProcessExec(`cp ${configFile}.sample ${configFile}`);
        await childProcessExec(`cp ${dotEnvFile}.sample ${dotEnvFile}`);
    });

    await t.before(async () => {
        // swap dummy config and dotenv files back for the real ones
        await childProcessExec(`cp ${configFile}.test.bak ${configFile}`);
        await childProcessExec(`cp ${dotEnvFile}.test.bak ${dotEnvFile}`);
    });

    await t.test('version stamp contains package.json version', async () => {
        const versionStamp = await Logger.getVersionStamp();
        assert.match(versionStamp.split('-')[0], /^\d+\.\d+\.\d+$/, 'semver pattern match');
    });

    await t.test('version stamp contains git commit hash', async () => {
        const versionStamp = await Logger.getVersionStamp();
        assert.match(versionStamp.split('-')[1], /^[0-9a-f]+$/, 'hexadecimal pattern match');
    });

    await t.test('generates anonymous ID', async () => {
        const anonId = await Logger.generateAnonId(7);
        assert.match(anonId, /^[0-9a-f]{7}$/, 'hexadecimal pattern match');
    });

    await t.test('anonymous ID is not yet stored in config file', async () => {
        const configJsonStr = await fs.readFile(
            packageJsonFile,
        );
        const configJson = JSON.parse(configJsonStr || '{}');
        assert.equal(configJson.anonId, undefined, 'should not be present');
    });

    await t.test('create new Logger instance', async () => {
        logger = new Logger();
        await logger.init();
        assert.ok(logger, 'logger instance created');
    });

    await t.test('anonymous ID is now stored in config file', async () => {
        const configJsonStr = await fs.readFile(
            configFile,
        );
        const configJson = JSON.parse(configJsonStr || '{}');
        assert.match(configJson.anonId, /^[0-9a-f]{7}$/, 'hexadecimal pattern match');
    });

    await t.test('logger initialised with empty steps', async () => {
        assert.equal(logger.steps.length, 0, 'array is empty');
    });

    await t.test('logger log', async () => {
        await logger.log('foo', { bar: 123 });
        assert.equal(logger.steps.length, 1, 'array has 1 elements');
    });

    await t.test('logger steps has an insertion following log', async () => {
        const logData = logger.steps[0];
        assert.ok(logData);
        assert.equal(logData.m, 'foo', 'message matches');
        assert.equal(logData.i, logger.anonId, 'anonID matches');
        assert.equal(logData.c, 'log', 'category matches');
        assert.ok(logData.t <= Date.now(), 'timestamp is set');
        const versionStamp = await Logger.getVersionStamp();
        assert.equal(logData.v, versionStamp, 'version stamp is set');
    });

    await t.test('formatForTerminal - ANSI enabled behaviour (default)', async () => {
        const result = logger.formatForTerminal('START', 'Test message');
        // Should return formatted output since this.configJson would be undefined in static context
        assert.deepEqual(result, [
            '🏁\x1b[1m\x1b[32m',
            'Test message',
            '\x1b[0m',
            '…'
        ], 'apply formatting when ansiDisabled is default (false)');
    });

    await t.test('formatForTerminal - ANSI disabled behaviour', async () => {
        t.before(() => {
            logger.configJson.ansiDisabled = true;
        });

        t.after(() => {
            logger.configJson.ansiDisabled = false;
        });

        // TODO replicate this test with ANSI disable
        const result = logger.formatForTerminal('START', 'Test message');
        // Should return formatted output since this.configJson would be undefined in static context
        assert.deepEqual(result, [
            'Test message',
        ], 'do NOT apply formatting when ansiDisabled is true');
    });
});
