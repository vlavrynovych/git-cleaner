import { RegExpException } from './RegExpException';

describe('RegExpException', () => {
    it('should use default message when no message provided', () => {
        const exception = new RegExpException();
        expect(exception.message).toBe('Invalid regular expression');
    });

    it('should use custom message when provided', () => {
        const customMessage = 'Custom error message';
        const exception = new RegExpException(customMessage);
        expect(exception.message).toBe(customMessage);
    });

    it('should be instantiable', () => {
        const exception = new RegExpException();
        expect(exception).toBeInstanceOf(RegExpException);
    });
});
