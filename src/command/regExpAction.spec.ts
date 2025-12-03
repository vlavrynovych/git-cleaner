import { regExpAction } from './regExpAction';
import { GitClient } from '../GitClient';
import { remotesPrompt } from '../prompt';
import { logger } from '../utils';
import { processor } from '../processor';
import { IGitResponse } from '../interface';

jest.mock('../GitClient');
jest.mock('../prompt');
jest.mock('../utils');
jest.mock('../processor');

describe('regExpAction', () => {
    let mockGit: jest.Mocked<GitClient>;
    let items: IGitResponse;

    beforeEach(() => {
        mockGit = new GitClient() as jest.Mocked<GitClient>;
        mockGit.removeObject = jest.fn().mockResolvedValue({ ok: true });
        items = {
            origin: ['feature/test-1', 'feature/test-2', 'bugfix/fix-123', 'main'],
        };
        (processor as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should filter items using regex pattern', async () => {
        const args = ['feature/.*'];
        await regExpAction(mockGit, items, args);

        expect(processor).toHaveBeenCalledWith(['feature/test-1', 'feature/test-2'], expect.any(Function));
        expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('feature/test-1, feature/test-2'));
    });

    it('should handle multiple regex patterns', async () => {
        const args = ['feature/.*', 'bugfix/.*'];
        await regExpAction(mockGit, items, args);

        expect(processor).toHaveBeenCalledWith(
            ['feature/test-1', 'feature/test-2', 'bugfix/fix-123'],
            expect.any(Function),
        );
    });

    it('should prompt for remote selection when multiple remotes exist', async () => {
        const multiRemoteItems: IGitResponse = {
            origin: ['branch1'],
            upstream: ['branch2'],
        };
        (remotesPrompt as jest.Mock).mockResolvedValue('upstream');

        await regExpAction(mockGit, multiRemoteItems, ['branch.*']);

        expect(remotesPrompt).toHaveBeenCalledWith(['origin', 'upstream']);
        expect(processor).toHaveBeenCalledWith(['branch2'], expect.any(Function));
    });

    it('should use single remote without prompting when only one remote exists', async () => {
        await regExpAction(mockGit, items, ['feature/.*']);

        expect(remotesPrompt).not.toHaveBeenCalled();
        expect(processor).toHaveBeenCalled();
    });

    it('should pass empty array to processor when no matches found', async () => {
        const args = ['nonexistent/.*'];
        await regExpAction(mockGit, items, args);

        expect(processor).toHaveBeenCalledWith([], expect.any(Function));
        expect(logger.success).not.toHaveBeenCalled();
    });

    it('should log matched items before processing', async () => {
        const args = ['main'];
        await regExpAction(mockGit, items, args);

        expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('main'));
    });

    it('should pass callback to processor that calls git.removeObject', async () => {
        const args = ['feature/test-1'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let capturedCallback: any;

        (processor as jest.Mock).mockImplementation(async (match, callback) => {
            capturedCallback = callback;
        });

        await regExpAction(mockGit, items, args);

        expect(capturedCallback).toBeDefined();
        await capturedCallback('feature/test-1');
        expect(mockGit.removeObject).toHaveBeenCalledWith('origin', 'feature/test-1');
    });

    it('should handle case-sensitive regex matching', async () => {
        items = {
            origin: ['Feature/test', 'feature/test'],
        };
        const args = ['feature/.*'];

        await regExpAction(mockGit, items, args);

        expect(processor).toHaveBeenCalledWith(['feature/test'], expect.any(Function));
    });

    it('should match multiple items with single pattern', async () => {
        const args = ['.*test.*'];
        await regExpAction(mockGit, items, args);

        expect(processor).toHaveBeenCalledWith(['feature/test-1', 'feature/test-2'], expect.any(Function));
    });
});
