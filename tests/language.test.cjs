const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/language.js'), 'utf8');

function browser({ languages = ['en-US'], language = 'en-US', saved = null, query = '', blocked = false } = {}) {
  const writes = [], changes = [];
  const context = {
    window: {}, navigator: { languages, language }, URL, URLSearchParams,
    location: { search: query, href: 'https://example.com/chairs/' + query },
    history: { state: null, replaceState: (_, __, url) => changes.push(String(url)) },
    localStorage: {
      getItem: () => { if (blocked) throw new Error('Storage blocked'); return saved; },
      setItem: (key, value) => { if (blocked) throw new Error('Storage blocked'); writes.push([key, value]); }
    }
  };
  vm.runInNewContext(source, context);
  return { ...context.window.RHYVIA_LANGUAGE, writes, changes };
}

for (const [label, options, expected] of [
  ['Chinese locale', { languages: ['zh-CN', 'en-US'] }, 'zh'],
  ['Regional Chinese locale', { languages: ['zh-Hant-HK'] }, 'zh'],
  ['English preference first', { languages: ['en-GB', 'zh-CN'] }, 'en'],
  ['First supported preference', { languages: ['fr-FR', 'zh-TW', 'en'] }, 'zh'],
  ['Unsupported language fallback', { languages: ['ja-JP'] }, 'en'],
  ['Missing languages list', { languages: [], language: 'zh-CN' }, 'zh'],
  ['Saved manual choice', { saved: 'en', languages: ['zh-CN'] }, 'en'],
  ['Invalid saved choice', { saved: 'invalid', languages: ['zh-CN'] }, 'zh'],
  ['Explicit Chinese share link', { query: '?lang=zh', saved: 'en' }, 'zh'],
  ['Explicit English share link', { query: '?lang=en', saved: 'zh' }, 'en'],
  ['Invalid query ignored', { query: '?lang=fr', saved: 'zh' }, 'zh'],
  ['Blocked storage', { blocked: true, languages: ['zh-CN'] }, 'zh']
]) test(label, () => assert.equal(browser(options).initial(), expected));

test('Automatic selection does not overwrite a manual preference', () => {
  const page = browser(); page.initial(); assert.deepEqual(page.writes, []);
});
test('Manual choice persists and updates a share link without losing other parameters', () => {
  const page = browser({ query: '?chair=ONE&lang=en#booking' }); page.remember('zh');
  assert.deepEqual(page.writes, [['rhyvia-language', 'zh']]);
  assert.equal(page.changes[0], 'https://example.com/chairs/?chair=ONE&lang=zh#booking');
});
test('Manual switching tolerates unavailable storage', () => assert.doesNotThrow(() => browser({ blocked: true }).remember('en')));
