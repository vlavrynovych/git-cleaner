import { multiSelectAction } from './multiSelectAction';
import { GitClient } from '../GitClient';
import { selectPrompt, remotesPrompt } from '../prompt';
import { processor } from '../processor';
import { IGitResponse } from '../interface';

jest.mock('../GitClient');
jest.mock('../prompt');
jest.mock('../processor');

describe('multiSelectAction', () => {
    let mockGit: jest.Mocked<GitClient>;
    let items: IGitResponse;

    beforeEach(() => {
        mockGit = new GitClient() as jest.Mocked<GitClient>;
        mockGit.removeObject = jest.fn().mockResolvedValue({ ok: true });
        items = {
            origin: ['branch1', 'branch2', 'branch3'],
        };
        (processor as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should prompt user to select items and process them', async () => {
        const selectedItems = ['branch1', 'branch3'];
        (selectPrompt as jest.Mock).mockResolvedValue(selectedItems);

        await multiSelectAction(mockGit, items);

        expect(selectPrompt).toHaveBeenCalledWith(['branch1', 'branch2', 'branch3']);
        expect(processor).toHaveBeenCalledWith(selectedItems, expect.any(Function));
    });

    it('should prompt for remote selection when multiple remotes exist', async () => {
        const multiRemoteItems: IGitResponse = {
            origin: ['branch1', 'branch2'],
            upstream: ['branch3', 'branch4'],
        };
        (remotesPrompt as jest.Mock).mockResolvedValue('upstream');
        (selectPrompt as jest.Mock).mockResolvedValue(['branch3']);

        await multiSelectAction(mockGit, multiRemoteItems);

        expect(remotesPrompt).toHaveBeenCalledWith(['origin', 'upstream']);
        expect(selectPrompt).toHaveBeenCalledWith(['branch3', 'branch4']);
        expect(processor).toHaveBeenCalledWith(['branch3'], expect.any(Function));
    });

    it('should use single remote without prompting when only one remote exists', async () => {
        (selectPrompt as jest.Mock).mockResolvedValue(['branch1']);

        await multiSelectAction(mockGit, items);

        expect(remotesPrompt).not.toHaveBeenCalled();
        expect(selectPrompt).toHaveBeenCalledWith(['branch1', 'branch2', 'branch3']);
    });

    it('should pass callback to processor that calls git.removeObject', async () => {
        const selectedItems = ['branch2'];
        (selectPrompt as jest.Mock).mockResolvedValue(selectedItems);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let capturedCallback: any;

        (processor as jest.Mock).mockImplementation(async (match, callback) => {
            capturedCallback = callback;
        });

        await multiSelectAction(mockGit, items);

        expect(capturedCallback).toBeDefined();
        await capturedCallback('branch2');
        expect(mockGit.removeObject).toHaveBeenCalledWith('origin', 'branch2');
    });

    it('should handle empty selection from user', async () => {
        (selectPrompt as jest.Mock).mockResolvedValue([]);

        await multiSelectAction(mockGit, items);

        expect(processor).toHaveBeenCalledWith([], expect.any(Function));
    });

    it('should handle single item selection', async () => {
        (selectPrompt as jest.Mock).mockResolvedValue(['branch1']);

        await multiSelectAction(mockGit, items);

        expect(processor).toHaveBeenCalledWith(['branch1'], expect.any(Function));
    });

    it('should handle all items selected', async () => {
        const allItems = ['branch1', 'branch2', 'branch3'];
        (selectPrompt as jest.Mock).mockResolvedValue(allItems);

        await multiSelectAction(mockGit, items);

        expect(processor).toHaveBeenCalledWith(allItems, expect.any(Function));
    });

    it('should use items from selected remote', async () => {
        const multiRemoteItems: IGitResponse = {
            origin: ['origin-branch1', 'origin-branch2'],
            fork: ['fork-branch1'],
        };
        (remotesPrompt as jest.Mock).mockResolvedValue('fork');
        (selectPrompt as jest.Mock).mockResolvedValue(['fork-branch1']);

        await multiSelectAction(mockGit, multiRemoteItems);

        expect(selectPrompt).toHaveBeenCalledWith(['fork-branch1']);
        expect(processor).toHaveBeenCalled();
    });
});
