import { GitClient } from './GitClient';
import simpleGit from 'simple-git';

jest.mock('simple-git');

describe('GitClient', () => {
    let gitClient: GitClient;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockGit: any;

    beforeEach(() => {
        mockGit = {
            getRemotes: jest.fn(),
            listRemote: jest.fn(),
            branch: jest.fn(),
            push: jest.fn(),
        };
        (simpleGit as jest.MockedFunction<typeof simpleGit>).mockReturnValue(mockGit);
        gitClient = new GitClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('tags', () => {
        it('should fetch tags from all remotes', async () => {
            mockGit.getRemotes.mockResolvedValue([{ name: 'origin' }, { name: 'upstream' }]);
            mockGit.listRemote.mockResolvedValueOnce('abc123\trefs/tags/v1.0.0\ndef456\trefs/tags/v1.0.1\n');
            mockGit.listRemote.mockResolvedValueOnce('ghi789\trefs/tags/v2.0.0\n');

            const result = await gitClient.tags();

            expect(result).toEqual({
                origin: ['v1.0.0', 'v1.0.1'],
                upstream: ['v2.0.0'],
            });
            expect(mockGit.getRemotes).toHaveBeenCalledTimes(1);
            expect(mockGit.listRemote).toHaveBeenCalledWith(['--tags', 'origin']);
            expect(mockGit.listRemote).toHaveBeenCalledWith(['--tags', 'upstream']);
        });

        it('should filter out annotated tag markers (^{})', async () => {
            mockGit.getRemotes.mockResolvedValue([{ name: 'origin' }]);
            mockGit.listRemote.mockResolvedValue(
                'abc123\trefs/tags/v1.0.0\ndef456\trefs/tags/v1.0.0^{}\nghi789\trefs/tags/v1.0.1\n',
            );

            const result = await gitClient.tags();

            expect(result).toEqual({
                origin: ['v1.0.0', 'v1.0.1'],
            });
        });

        it('should handle empty tag list', async () => {
            mockGit.getRemotes.mockResolvedValue([{ name: 'origin' }]);
            mockGit.listRemote.mockResolvedValue('');

            const result = await gitClient.tags();

            expect(result).toEqual({
                origin: [],
            });
        });

        it('should handle multiple remotes with no tags', async () => {
            mockGit.getRemotes.mockResolvedValue([{ name: 'origin' }, { name: 'upstream' }]);
            mockGit.listRemote.mockResolvedValue('');

            const result = await gitClient.tags();

            expect(result).toEqual({
                origin: [],
                upstream: [],
            });
        });
    });

    describe('branch', () => {
        it('should fetch branches grouped by remotes', async () => {
            mockGit.branch.mockResolvedValue({
                all: ['master', 'remotes/origin/master', 'remotes/origin/feature/test', 'remotes/upstream/develop'],
            });

            const result = await gitClient.branch();

            expect(result).toEqual({
                origin: ['master', 'feature/test'],
                upstream: ['develop'],
            });
            expect(mockGit.branch).toHaveBeenCalledTimes(1);
        });

        it('should filter out local branches', async () => {
            mockGit.branch.mockResolvedValue({
                all: ['master', 'develop', 'remotes/origin/master'],
            });

            const result = await gitClient.branch();

            expect(result).toEqual({
                origin: ['master'],
            });
        });

        it('should handle branches with slashes in names', async () => {
            mockGit.branch.mockResolvedValue({
                all: ['remotes/origin/feature/add-new-feature', 'remotes/origin/bugfix/fix-123'],
            });

            const result = await gitClient.branch();

            expect(result).toEqual({
                origin: ['feature/add-new-feature', 'bugfix/fix-123'],
            });
        });

        it('should handle empty branch list', async () => {
            mockGit.branch.mockResolvedValue({
                all: [],
            });

            const result = await gitClient.branch();

            expect(result).toEqual({});
        });

        it('should group multiple branches by the same remote', async () => {
            mockGit.branch.mockResolvedValue({
                all: ['remotes/origin/branch1', 'remotes/origin/branch2', 'remotes/origin/branch3'],
            });

            const result = await gitClient.branch();

            expect(result).toEqual({
                origin: ['branch1', 'branch2', 'branch3'],
            });
        });
    });

    describe('removeObject', () => {
        it('should call git push with --delete flag for branches', async () => {
            const mockResponse = { ok: true };
            mockGit.push.mockResolvedValue(mockResponse);

            const result = await gitClient.removeObject('origin', 'feature/test');

            expect(mockGit.push).toHaveBeenCalledWith('origin', 'feature/test', ['--delete']);
            expect(result).toEqual(mockResponse);
        });

        it('should call git push with --delete flag for tags', async () => {
            const mockResponse = { ok: true };
            mockGit.push.mockResolvedValue(mockResponse);

            const result = await gitClient.removeObject('origin', 'v1.0.0');

            expect(mockGit.push).toHaveBeenCalledWith('origin', 'v1.0.0', ['--delete']);
            expect(result).toEqual(mockResponse);
        });

        it('should handle errors during deletion', async () => {
            const mockError = new Error('Push failed');
            mockGit.push.mockRejectedValue(mockError);

            await expect(gitClient.removeObject('origin', 'feature/test')).rejects.toThrow('Push failed');
        });
    });
});
