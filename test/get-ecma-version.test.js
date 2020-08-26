const fs = require('fs');
const path = require('path');
const { getEcmaVersion } = require('../src');
const esFeatures = require('../data/es-features');
const { MIN_ECMA_VERSION } = require('../src/constants');

const ENTRY_POINTS_DIR = path.join(__dirname, 'fixtures', 'entryPoints');

const negativeTestCases = [
  'function foo() {bar}',
  'var foo = 123',
  "var arr = ['hello']",
  "var foo = 'async'",
  "var foo = 'const'",
  "var foo = '0b0101'",
];

// const keyToEcma = Object.fromEntries(
//   esFeatures.map((esFeature) => [esFeature.key, esFeature.ecmaVersion])
// );
const keyToEcma = new Map(
  esFeatures.map((esFeature) => [esFeature.key, esFeature.ecmaVersion])
);

describe('getEcmaVersion should', () => {
  it(`return ${MIN_ECMA_VERSION} for negative test cases`, () =>
    negativeTestCases.forEach((testCase) =>
      expect(getEcmaVersion(testCase)).toBe(MIN_ECMA_VERSION)
    ));
  it.each`
    key                            | testCase
    ${'es.default-param'}          | ${'function foo(bar=1) {}'}
    ${'es.rest'}                   | ${'[a, b, ...rest] = [10, 20, 30, 40, 50, 60]'}
    ${'es.spread'}                 | ${'[...arr]'}
    ${'es.for-of'}                 | ${'for (var element of arr) {}'}
    ${'es.binary'}                 | ${'var foo = 0b0101'}
    ${'es.octal'}                  | ${'var foo = 0o755'}
    ${'es.template-literal'}       | ${'var foo = `hello ${bar}`'}
    ${'es.const'}                  | ${'const foo = 123'}
    ${'es.let'}                    | ${'let foo = 123'}
    ${'es.generator'}              | ${'function* foo() {}'}
    ${'es.exponentiation'}         | ${'2 ** 4'}
    ${'es.async'}                  | ${'async function f() {}'}
    ${'es.for-await-of'}           | ${'async () => { for await (var foo of bar) { } }'}
    ${'es.optional-catch-binding'} | ${'try {} catch {}'}
    ${'es.big-int'}                | ${'const foo = 123n'}
    ${'es.optional-chaining'}      | ${'obj?.foo'}
    ${'es.nullish-coalescing'}     | ${'var foo = 0 ?? 42'}
  `('judge $key correctly', ({ key, testCase }) => {
    expect(keyToEcma.get(key)).toBeDefined();
    expect(getEcmaVersion(testCase)).toBe(keyToEcma.get(key));
  });

  it.each`
    filename                           | expected
    ${'bowser.js'}                     | ${5}
    ${'bowser.es2015.js'}              | ${2015}
    ${'domlette.js'}                   | ${5}
    ${'domlette.es2015.js'}            | ${2015}
    ${'toybox-js-render-component.js'} | ${5}
    ${'ts-trapper.js'}                 | ${5}
  `('return $expected for $filename', ({ filename, expected }) => {
    const code = fs.readFileSync(
      path.resolve(ENTRY_POINTS_DIR, filename),
      'utf-8'
    );
    expect(getEcmaVersion(code)).toBe(expected);
  });
});
