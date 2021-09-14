const assert = require('assert');

import Render from '../../../src/service/Render';

describe('Render.ts', () => {
  describe('addSpace()', () => {
    it('should add space', () => {
      const sample = `我想要Coca Cola`;
      const res = Render.addSpace(sample);
      const ans = `我想要 Coca Cola`;
      assert.strictEqual(res, ans);
    });
  });
});
