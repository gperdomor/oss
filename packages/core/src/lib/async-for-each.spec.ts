import { asyncForEach } from './async-for-each.js';

describe('asyncForEach', () => {
  it('executes async tasks sequentially', async () => {
    const testValues = [1, 2, 3, 4, 5];
    const results: number[] = [];

    await asyncForEach(testValues, async (value) => {
      results.push(value);
    });

    expect(results).toEqual(testValues);
  });
});
