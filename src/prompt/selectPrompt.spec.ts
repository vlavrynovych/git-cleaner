import { selectPrompt } from './selectPrompt';
import * as prompts from 'prompts';

jest.mock('prompts');

describe('selectPrompt', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display autocomplete multiselect prompt with items', async () => {
        const items = ['branch1', 'branch2', 'branch3'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: ['branch1', 'branch3'] });

        const result = await selectPrompt(items);

        expect(prompts).toHaveBeenCalledWith({
            type: 'autocompleteMultiselect',
            name: 'value',
            message: 'Select for removal',
            choices: [
                { title: 'branch1', value: 'branch1' },
                { title: 'branch2', value: 'branch2' },
                { title: 'branch3', value: 'branch3' },
            ],
            hint: '- Space to select. Return to submit',
            instructions: false,
        });
        expect(result).toEqual(['branch1', 'branch3']);
    });

    it('should return selected items', async () => {
        const items = ['item1', 'item2'];
        const selectedItems = ['item2'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: selectedItems });

        const result = await selectPrompt(items);

        expect(result).toEqual(selectedItems);
    });

    it('should handle empty selection', async () => {
        const items = ['item1', 'item2'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: [] });

        const result = await selectPrompt(items);

        expect(result).toEqual([]);
    });

    it('should map items to choice objects with title and value', async () => {
        const items = ['test-item'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((prompts as any) as jest.Mock).mockResolvedValue({ value: ['test-item'] });

        await selectPrompt(items);

        expect(prompts).toHaveBeenCalledWith(
            expect.objectContaining({
                choices: [{ title: 'test-item', value: 'test-item' }],
            }),
        );
    });
});
