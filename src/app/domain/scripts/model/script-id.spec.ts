import { ScriptId } from './script-id';

describe('ScriptId', () => {
  describe('create', () => {
    it('should create a script ID', () => {
      const scriptId =
        ScriptId.create(
          'trouble-brewing',
        );

      expect(scriptId.value).toBe(
        'trouble-brewing',
      );
    });

    it('should trim the value', () => {
      const scriptId =
        ScriptId.create(
          '  trouble-brewing  ',
        );

      expect(scriptId.value).toBe(
        'trouble-brewing',
      );
    });

    it.each(['', '   '])(
      'should reject an empty script ID',
      (value) => {
        expect(() =>
          ScriptId.create(value),
        ).toThrow(
          'Script ID cannot be empty.',
        );
      },
    );
  });

  describe('equals', () => {
    it('should return true for equal script IDs', () => {
      const first =
        ScriptId.create(
          'trouble-brewing',
        );

      const second =
        ScriptId.create(
          'trouble-brewing',
        );

      expect(
        first.equals(second),
      ).toBe(true);
    });

    it('should return false for different script IDs', () => {
      const first =
        ScriptId.create(
          'trouble-brewing',
        );

      const second =
        ScriptId.create(
          'sects-and-violets',
        );

      expect(
        first.equals(second),
      ).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the underlying value', () => {
      const scriptId =
        ScriptId.create(
          'trouble-brewing',
        );

      expect(
        scriptId.toString(),
      ).toBe('trouble-brewing');
    });
  });
});