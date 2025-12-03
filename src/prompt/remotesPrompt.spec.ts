import { remotesPrompt } from './remotesPrompt';
import * as prompts from 'prompts';

jest.mock('prompts');

describe('remotesPrompt', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display select prompt with remotes', async () => {
        const remotes = ['origin', 'upstream', 'fork'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: 'origin' });

        const result = await remotesPrompt(remotes);

        expect(prompts).toHaveBeenCalledWith({
            type: 'select',
            name: 'value',
            message: 'Select remote',
            choices: [
                { title: 'origin', value: 'origin' },
                { title: 'upstream', value: 'upstream' },
                { title: 'fork', value: 'fork' },
            ],
            initial: 0,
        });
        expect(result).toBe('origin');
    });

    it('should return selected remote', async () => {
        const remotes = ['origin', 'upstream'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: 'upstream' });

        const result = await remotesPrompt(remotes);

        expect(result).toBe('upstream');
    });

    it('should set initial selection to first item (index 0)', async () => {
        const remotes = ['remote1', 'remote2'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: 'remote1' });

        await remotesPrompt(remotes);

        expect(prompts).toHaveBeenCalledWith(
            expect.objectContaining({
                initial: 0,
            }),
        );
    });

    it('should map remotes to choice objects with title and value', async () => {
        const remotes = ['test-remote'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: 'test-remote' });

        await remotesPrompt(remotes);

        expect(prompts).toHaveBeenCalledWith(
            expect.objectContaining({
                choices: [{ title: 'test-remote', value: 'test-remote' }],
            }),
        );
    });

    it('should handle single remote', async () => {
        const remotes = ['origin'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: 'origin' });

        const result = await remotesPrompt(remotes);

        expect(result).toBe('origin');
        expect(prompts).toHaveBeenCalledWith(
            expect.objectContaining({
                choices: [{ title: 'origin', value: 'origin' }],
            }),
        );
    });
});
