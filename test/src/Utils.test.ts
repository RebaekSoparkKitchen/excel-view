const assert = require('assert');

import Utils from '../../src/Utils';
describe('Utils.ts', () => {
  describe('htmlTextProcess()', () => {
    const sample0 = '';
    const sample1 = `<span style="font-size: 11pt">这是测试文本</span>`;
    const sample2 = `<a>这是链接</a>，<a2>这也是链接</a2>`;
    it('should be blank', () => {
      const res = Utils.htmlTextProcess(sample0, null);
      assert.strictEqual(res, '');
    });
    it('should be no span tag here', () => {
      const res = Utils.htmlTextProcess(sample1, null);
      assert.strictEqual(res.indexOf('<'), -1);
      assert.strictEqual(res.indexOf('>'), -1);
    });
    it('should add right <a> to the text', () => {
      const res = Utils.htmlTextProcess(sample2, [
        'https://www.link1.com',
        'https://www.link2.com',
      ]);
      assert.notEqual(res.indexOf('<a href="https://www.link1.com"'), -1);
      assert.notEqual(res.indexOf('<a href="https://www.link2.com"'), -1);
      // should add CTA parameter
      assert.notEqual(res.indexOf('data-sap-hpa-ceimo-link-alias="CTA"'), -1);
    });
    it('should add ioi parameter to the <a> tag', () => {
      const res = Utils.htmlTextProcess(
        sample2,
        ['https://www.link1.com', 'https://www.link2.com'],
        '1025-2240-ABCD'
      );
      assert.notEqual(
        res.indexOf('data-sap-hpa-ceimo-ioi-link="1025-2240-ABCD"'),
        -1
      );
    });
  });
  describe('splitParagragh()', () => {
    const sample = ` 这是第一段
                           这是第二段   `;
    const sample1 = `据调查,到 2023 年，65% 的企业将投资高度可配置且具备 AI 功能的 ERP 应用，提高业务运营的自动化水平。而且，实现数字化转型后，企业能够应对<b>业务</b>中断危机，并构建创新型业务模式。
    
    •	如何专注于数字化转型战略
    •	为什么转型至关重要
    
    本 IDC 报告重点介绍了：
    •	如何专注于数字化转型战略
    •	为什么转型至关重要
    •	为什么智慧企业需要采用合适的技术
    •	为什么客户倾向于采用集成式软件应用套件
    •	如何借助数字化转型和智能技术，提高业务韧性
    
    查看本报告，了解为何数字化技术对打造智慧企业至关重要。`;
    it('should be blank', () => {
      const res = Utils.splitParagraph('');
      assert.strictEqual(res.length, 0);
    });
    it('should be two paragraphs and trim', () => {
      const res = Utils.splitParagraph(sample);
      assert.strictEqual(res.length, 2);
      assert.strictEqual(res[0], '这是第一段');
      assert.strictEqual(res[1], '这是第二段');
    });
    it('should recognize li tag and put them in a single array', () => {
      const res = Utils.splitParagraph(sample1);

      assert.strictEqual(res.length, 5);
      assert.strictEqual(res[1][0], '如何专注于数字化转型战略');
      assert.ok(res[1] instanceof Array);
      assert.ok(res[3] instanceof Array);
      assert.strictEqual(typeof res[2], 'string');
    });
  });
});
