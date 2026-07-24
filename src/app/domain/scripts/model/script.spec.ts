import { CharacterId } from '../../characters/model/character-id';
import { Script } from './script';
import { ScriptId } from './script-id';

describe('Script', () => {
  function createScript(
    overrides: Partial<{
      id: string;
      name: string;
      characterIds:
        readonly CharacterId[];
    }> = {},
  ): Script {
    return Script.create({
      id: ScriptId.create(
        overrides.id ??
          'trouble-brewing',
      ),
      name:
        overrides.name ??
        'Trouble Brewing',
      characterIds:
        overrides.characterIds ?? [
          CharacterId.create(
            'washerwoman',
          ),
          CharacterId.create(
            'poisoner',
          ),
          CharacterId.create(
            'imp',
          ),
        ],
    });
  }

  describe('create', () => {
    it('should create a script', () => {
      const scriptId =
        ScriptId.create(
          'trouble-brewing',
        );

      const washerwomanId =
        CharacterId.create(
          'washerwoman',
        );

      const impId =
        CharacterId.create('imp');

      const script =
        Script.create({
          id: scriptId,
          name: 'Trouble Brewing',
          characterIds: [
            washerwomanId,
            impId,
          ],
        });

      expect(script.id).toBe(
        scriptId,
      );

      expect(script.name).toBe(
        'Trouble Brewing',
      );

      expect(
        script.characterIds,
      ).toEqual([
        washerwomanId,
        impId,
      ]);
    });

    it('should trim the script name', () => {
      const script =
        createScript({
          name:
            '  Trouble Brewing  ',
        });

      expect(script.name).toBe(
        'Trouble Brewing',
      );
    });

    it.each(['', '   '])(
      'should reject an empty script name',
      (name) => {
        expect(() =>
          createScript({ name }),
        ).toThrow(
          'Script name cannot be empty.',
        );
      },
    );

    it('should reject a script without characters', () => {
      expect(() =>
        createScript({
          characterIds: [],
        }),
      ).toThrow(
        'Script requires at least one character.',
      );
    });

    it('should reject duplicate character IDs', () => {
      expect(() =>
        createScript({
          characterIds: [
            CharacterId.create(
              'imp',
            ),
            CharacterId.create(
              'imp',
            ),
          ],
        }),
      ).toThrow(
        'Character "imp" appears multiple times in the script.',
      );
    });

    it('should expose a defensive character ID array', () => {
      const script =
        createScript();

      const characterIds =
        script.characterIds as CharacterId[];

      characterIds.length = 0;

      expect(
        script.characterIds.length,
      ).toBe(3);
    });
  });

  describe('containsCharacter', () => {
    it('should return true when the script contains the character', () => {
      const script =
        createScript();

      expect(
        script.containsCharacter(
          CharacterId.create(
            'poisoner',
          ),
        ),
      ).toBe(true);
    });

    it('should return false when the script does not contain the character', () => {
      const script =
        createScript();

      expect(
        script.containsCharacter(
          CharacterId.create(
            'scarlet-woman',
          ),
        ),
      ).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for scripts with the same ID', () => {
      const first =
        createScript({
          id: 'trouble-brewing',
          name: 'Trouble Brewing',
        });

      const second =
        createScript({
          id: 'trouble-brewing',
          name:
            'Different script name',
        });

      expect(
        first.equals(second),
      ).toBe(true);
    });

    it('should return false for scripts with different IDs', () => {
      const first =
        createScript({
          id: 'trouble-brewing',
        });

      const second =
        createScript({
          id: 'sects-and-violets',
        });

      expect(
        first.equals(second),
      ).toBe(false);
    });
  });
});