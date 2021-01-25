const plugin = require('tailwindcss/plugin');
const _ = require('lodash');

module.exports = plugin(function({ theme, variants, e, addUtilities }) {
  const themeRatios = theme('aspectRatio');
  let aspectRatioUtilities = {};
  if (Object.keys(themeRatios).length !== 0) {
    aspectRatioUtilities = {
        // aspect-ratio
      '.aspect-ratio': {
        position: 'relative'
      },
      '.aspect-ratio::before': {
        content: '""',
        display: 'block'
      },
      '.aspect-ratio > :first-child': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      },
      '.aspect-ratio > img': {
        height: 'auto'
      },
      // min-h-aspect-ratio
      '.min-h-aspect-ratio::before': {
        content: '""',
        width: '1px',
        marginLeft: '-1px',
        float: 'left',
        height: 0
      },
      '.min-h-aspect-ratio::after': { /* to clear float */
        content: '""',
        display: 'table',
        clear: 'both'
      }
    };
  }
  const aspectRatioModifiers = _.fromPairs(
    _.flatten(
      _.map(theme('aspectRatio'), (value, modifier) => {
        const aspectRatio = _.isArray(value) ? value[0] / value[1] : value;
        return [
          [
            `.${e(`aspect-ratio-${modifier}`)}::before`, {
              paddingBottom: aspectRatio == 0 ? '0' : `${1 / aspectRatio * 100}%`,
            }
          ]
        ];
      })
    )
  );

  addUtilities([ aspectRatioUtilities, aspectRatioModifiers ], variants('aspectRatio'));
}, {
  theme: {
    aspectRatio: {},
  },
  variants: {
    aspectRatio: ['responsive'],
  },
});
