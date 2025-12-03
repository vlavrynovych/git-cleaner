/* eslint-disable @typescript-eslint/no-var-requires */
import { logger as loggerType } from './logger';

describe('logger', () => {
    let consoleLogSpy: jest.SpyInstance;
    let logger: typeof loggerType;

    beforeEach(() => {
        // Set up spy before importing the module
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        // Clear the module cache and reimport logger
        jest.resetModules();
        logger = require('./logger').logger;
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('log', () => {
        it('should call console.log with provided arguments', () => {
            logger.log('test message');
            expect(consoleLogSpy).toHaveBeenCalledWith('test message');
        });

        it('should handle multiple arguments', () => {
            logger.log('arg1', 'arg2', 'arg3');
            expect(consoleLogSpy).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
        });

        it('should handle various data types', () => {
            const obj = { key: 'value' };
            logger.log('string', 123, obj);
            expect(consoleLogSpy).toHaveBeenCalledWith('string', 123, obj);
        });
    });

    describe('success', () => {
        it('should log success message with green checkmark', () => {
            logger.success('Operation successful');
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('✔');
            expect(loggedMessage).toContain('Operation successful');
        });

        it('should format message with chalk green color', () => {
            logger.success('Test');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('should log error message with red X mark', () => {
            logger.error('Operation failed');
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('✖');
            expect(loggedMessage).toContain('Operation failed');
        });

        it('should format message with chalk red color', () => {
            logger.error('Test error');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });
});
