const _ = require('lodash');
const cssMatcher = require('jest-matcher-css');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const aspectRatioPlugin = require('./index.js');

expect.extend({
  toIncludeCss (received, argument) {
    const stripped = str => str.replace(/[;\s]/g, '');

    let argumentArray = argument;
    if (Array.isArray(argument) === false) {
      argumentArray = [argument];
    }

    for (const argument of argumentArray) {
      if (stripped(received).includes(stripped(argument))) {
        return {
          message: () => `expected ${received} not to include CSS ${argument}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to include CSS ${argument}`,
          pass: false,
        };
      }
    }
  }
});

const generatePluginCss = (config) => {
  return postcss(
    tailwindcss(
      _.merge({
        theme: {
          screens: {
            'sm': '640px',
          },
        },
        corePlugins: false,
        plugins: [
          aspectRatioPlugin,
        ],
      }, config)
    )
  )
  .process('@tailwind utilities', {
    from: undefined,
  })
  .then(result => {
    return result.css;
  });
};


test('there is no output by default', () => {
  return generatePluginCss().then(css => {
    expect(css).toIncludeCss(`
      @media (min-width: 640px) {
      }
    `);
  });
});

test('base classes are generated', () => {
  return generatePluginCss({
    theme: {
      aspectRatio: {
        '2/1': [2, 1],
      },
    },
  }).then(css => {
    expect(css).toIncludeCss([`
      .aspect-ratio {
        position: relative
      }

      .aspect-ratio::before {
        content: "";
        display: block
      }

      .aspect-ratio > :first-child {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%
      }

      .aspect-ratio > img {
        height: auto
      }

      .min-h-aspect-ratio::before {
        content: "";
        width: 1px;
        margin-left: -1px;
        float: left;
        height: 0
      }

      .min-h-aspect-ratio::after {
        content: "";
        display: table;
        clear: both
      }`, `
      @media (min-width: 640px) {
        .sm\:aspect-ratio {
          position: relative
        }

        .sm\:aspect-ratio::before {
          content: "";
          display: block
        }

        .sm\:aspect-ratio > :first-child {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%
        }

        .sm\:aspect-ratio > img {
          height: auto
        }

        .sm\:min-h-aspect-ratio::before {
          content: "";
          width: 1px;
          margin-left: -1px;
          float: left;
          height: 0
        }

        .sm\:min-h-aspect-ratio::after {
          content: "";
          display: table;
          clear: both
        }
    `]);
  });
});

test('ratios can be customized', () => {
  return generatePluginCss({
    theme: {
      aspectRatio: {
        '2/1': [2, 1],
        '16/9': [16, 9],
      },
    },
  }).then(css => {
    expect(css).toIncludeCss([`
      .aspect-ratio-2\\/1::before {
        padding-bottom: 50%;
      }
      .aspect-ratio-16\\/9::before {
        padding-bottom: 56.25%;
      }`, `
      @media (min-width: 640px) {
        .sm\\:aspect-ratio-2\\/1::before {
          padding-bottom: 50%;
        }
        .sm\\:aspect-ratio-16\\/9::before {
          padding-bottom: 56.25%;
        }
      }`
    ]);
  });
});

test('ratios can be arrays or fractions', () => {
  return generatePluginCss({
    theme: {
      aspectRatio: {
        '5/2': [5, 2],
        '16/9': 16 / 9,
      },
    },
    variants: {
      aspectRatio: [],
    },
  }).then(css => {
    expect(css).toIncludeCss(`
      .aspect-ratio-5\\/2::before {
        padding-bottom: 40%;
      }
      .aspect-ratio-16\\/9::before {
        padding-bottom: 56.25%;
      }
    `);
  });
});

test('ratio can be 0', () => {
  return generatePluginCss({
    theme: {
      aspectRatio: {
        'none': 0,
      },
    },
    variants: {
      aspectRatio: [],
    },
  }).then(css => {
    expect(css).toIncludeCss(`
      .aspect-ratio-none::before {
        padding-bottom: 0;
      }
    `);
  });
});

test('variants can be customized', () => {
  return generatePluginCss({
    theme: {
      aspectRatio: {
        '2/1': [2, 1],
      },
    },
    variants: {
      aspectRatio: ['hover'],
    },
  }).then(css => {
    expect(css).toIncludeCss([`
      .aspect-ratio-2\\/1::before {
        padding-bottom: 50%;
      }`, `
      .hover\\:aspect-ratio-2\\/1:hover::before {
        padding-bottom: 50%;
      }`
    ]);
  });
});
