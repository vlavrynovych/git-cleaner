import { confirmPrompt } from './confirmPrompt';
import * as prompts from 'prompts';

jest.mock('prompts');

describe('confirmPrompt', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display confirmation prompt with default initial value false', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: true });

        const result = await confirmPrompt();

        expect(prompts).toHaveBeenCalledWith({
            type: 'confirm',
            name: 'value',
            message: 'You confirm the action?',
            initial: false,
        });
        expect(result).toBe(true);
    });

    it('should accept custom initial value', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: false });

        const result = await confirmPrompt(true);

        expect(prompts).toHaveBeenCalledWith({
            type: 'confirm',
            name: 'value',
            message: 'You confirm the action?',
            initial: true,
        });
        expect(result).toBe(false);
    });

    it('should return true when user confirms', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: true });

        const result = await confirmPrompt();

        expect(result).toBe(true);
    });

    it('should return false when user rejects', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: false });

        const result = await confirmPrompt();

        expect(result).toBe(false);
    });
});
