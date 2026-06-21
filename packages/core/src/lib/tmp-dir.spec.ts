import { _tmpDir, tmpDir } from './tmp-dir.js';

describe('tmpDir', () => {
  it('debug should call console debug method', () => {
    expect(_tmpDir).toBeUndefined();

    const a = tmpDir();

    expect(_tmpDir).toBeDefined();

    expect(_tmpDir).toEqual(a);

    const b = tmpDir();

    expect(_tmpDir).toEqual(b);
    expect(a).toEqual(b);

    expect(a).toContain('nx-tools-');
  });
});
