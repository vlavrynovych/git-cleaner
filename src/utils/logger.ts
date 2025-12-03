import * as chalk from 'chalk';

const _logger = console.log; // eslint-disable-line

export const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    log: (...args: any): void => {
        _logger(...args);
    },

    success: (message: string): void => {
        _logger(chalk.green('✔ ') + message);
    },

    error: (message: string): void => {
        _logger(chalk.red('✖ ') + message);
    },
};
