const assert = require('assert');
import { quotationProcess, addSpace } from '../../../src/service/TextProcessor';

describe('TextProcessor', () => {
  describe('quotationProcess()', () => {
    it('should be blank', () => {
      const sample = ``;
      const res = quotationProcess(sample);
      assert.strictEqual(res, ``);
    });
    it('should transfer english quote to chinese', () => {
      const sample = `我想要"可口可乐"`;
      const res = quotationProcess(sample);
      assert.strictEqual(res, `我想要“可口可乐”`);
    });
    it('one english, one chinese quote, should be transferred to chinese quote', () => {
      const sample0 = `我想要"可口可乐“`;
      const sample1 = `我想要“可口可乐"`;
      const sample2 = `我想要"可口可乐”`;
      const res0 = quotationProcess(sample0);
      const res1 = quotationProcess(sample1);
      const res2 = quotationProcess(sample2);
      const ans = `我想要“可口可乐”`;
      assert.strictEqual(res0, ans);
      assert.strictEqual(res1, ans);
      assert.strictEqual(res2, ans);
    });
    it('should be english quote when middle words are all in english', () => {
      const sample0 = `我想要"Coca Cola"`;
      const sample1 = `我想要“Coca Cola”`;
      const sample2 = `我想要“Coca Cola"`;
      const sample3 = `我想要"Coca Cola”`;
      const res0 = quotationProcess(sample0);
      const res1 = quotationProcess(sample1);
      const res2 = quotationProcess(sample2);
      const res3 = quotationProcess(sample3);
      const ans = `我想要"Coca Cola"`;
      assert.strictEqual(res0, ans);
      assert.strictEqual(res1, ans);
      assert.strictEqual(res2, ans);
      assert.strictEqual(res3, ans);
    });
    it('should be in chinese quote, if middle text contains some english and some chinese', () => {
      const sample = `我想要"可口 Cola"`;
      const res = `我想要“可口 Cola”`;
    });
    it('odd number quote, and should throw an error', () => {
      const sample = `我想“要"可口可乐"`;
      // make sure it is an error
      assert.throws(() => {
        const res = quotationProcess(sample);
      }, Error);
      // make sure the error information is right
      assert.throws(() => {
        const res = quotationProcess(sample);
      }, /The frequency of quotation characters is odd number/);
    });
  });
  describe('addSpace()', () => {
    it('should add space', () => {
      const sample = `我想要Coca Cola`;
      const res = addSpace(sample);
      const ans = `我想要 Coca Cola`;
      assert.strictEqual(res, ans);
    });
  });
});
