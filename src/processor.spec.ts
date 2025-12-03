import { processor } from './processor';
import { confirmPrompt } from './prompt';
import { logger } from './utils';
import * as progress from 'cli-progress';

jest.mock('./prompt');
jest.mock('./utils');
jest.mock('cli-progress');

describe('processor', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockBar: any;
    let mockStepCallback: jest.Mock;

    beforeEach(() => {
        mockBar = {
            start: jest.fn(),
            increment: jest.fn(),
            update: jest.fn(),
            stop: jest.fn(),
        };
        (progress.Bar as jest.Mock).mockImplementation(() => mockBar);
        mockStepCallback = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log success and return early when items array is empty', async () => {
        await processor([], mockStepCallback);

        expect(logger.success).toHaveBeenCalledWith('Nothing selected');
        expect(confirmPrompt).not.toHaveBeenCalled();
        expect(mockStepCallback).not.toHaveBeenCalled();
    });

    it('should return early when confirmation is rejected', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(false);

        await processor(['item1', 'item2'], mockStepCallback);

        expect(confirmPrompt).toHaveBeenCalledTimes(1);
        expect(mockBar.start).not.toHaveBeenCalled();
        expect(mockStepCallback).not.toHaveBeenCalled();
    });

    it('should process all items when confirmation is accepted', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);
        const items = ['item1', 'item2', 'item3'];

        await processor(items, mockStepCallback);

        expect(confirmPrompt).toHaveBeenCalledTimes(1);
        expect(mockBar.start).toHaveBeenCalledWith(3, 0, { name: '' });
        expect(mockStepCallback).toHaveBeenCalledTimes(3);
        expect(mockStepCallback).toHaveBeenNthCalledWith(1, 'item1');
        expect(mockStepCallback).toHaveBeenNthCalledWith(2, 'item2');
        expect(mockStepCallback).toHaveBeenNthCalledWith(3, 'item3');
        expect(mockBar.stop).toHaveBeenCalledTimes(1);
    });

    it('should increment progress bar for each item', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);
        const items = ['item1', 'item2'];

        await processor(items, mockStepCallback);

        expect(mockBar.increment).toHaveBeenCalledTimes(2);
        expect(mockBar.increment).toHaveBeenNthCalledWith(1, 1, { name: 'item1' });
        expect(mockBar.increment).toHaveBeenNthCalledWith(2, 1, { name: 'item2' });
    });

    it('should update progress bar to final state after processing all items', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);
        const items = ['item1', 'item2'];

        await processor(items, mockStepCallback);

        expect(mockBar.update).toHaveBeenCalledWith(2, { name: '' });
        expect(mockBar.stop).toHaveBeenCalledTimes(1);
    });

    it('should stop progress bar and re-throw error when stepCallback fails', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);
        const error = new Error('Step failed');
        mockStepCallback.mockRejectedValueOnce(error);

        await expect(processor(['item1'], mockStepCallback)).rejects.toThrow('Step failed');
        expect(mockBar.stop).toHaveBeenCalledTimes(1);
    });

    it('should create progress bar with correct configuration', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);

        await processor(['item1'], mockStepCallback);

        expect(progress.Bar).toHaveBeenCalledWith({
            format: 'Progress  [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} {name}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            fps: 5,
            stream: process.stdout,
            barsize: 50,
        });
    });

    it('should handle processing a single item', async () => {
        (confirmPrompt as jest.Mock).mockResolvedValue(true);

        await processor(['single-item'], mockStepCallback);

        expect(mockBar.start).toHaveBeenCalledWith(1, 0, { name: '' });
        expect(mockStepCallback).toHaveBeenCalledWith('single-item');
        expect(mockBar.update).toHaveBeenCalledWith(1, { name: '' });
        expect(mockBar.stop).toHaveBeenCalledTimes(1);
    });
});
