const unsupportedCombinationsDescription = [
  [
    ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 's', 'u', 'footer', 'mark', 'ul', 'ol', 'figcaption', 'summary', 'sup', 'sub', 'table', 'pre', 'code', 'samp'],
    ['img', 'video', 'iframe', 'audio', 'footer'],
  ],
  [
    ['blockquote', 'aside', 'a'],
    ['img', 'video', 'audio', 'iframe', 'table'],
  ],
  [
    ['ul', 'ol', 'figcaption', 'a', 'table'],
    ['aside', 'blockquote', 'figure', 'picture', 'table'],
  ],
  [
    ['blockquote', 'aside', 'img', 'source', 'picture', 'iframe', 'video', 'audio', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption', 'figure', 'table', 'pre', 'code', 'samp'],
  ],
];

// eslint-disable-next-line prefer-const
let unsupportedPairs = [];

unsupportedCombinationsDescription.forEach(rule => {
  if (rule[1]) {
    rule[0].forEach(el1 => {
      rule[1].forEach(el2 => {
        unsupportedPairs.push([el1, el2]);
      });
    });
  } else {
    rule[0].forEach(el => unsupportedPairs.push([el, el]));
  }
});

exports.unsupportedPairs = unsupportedPairs;

exports.tagsToIgnore = [
  'div',
  'span',
  'img',
  'br',
];

exports.classesToIgnore = [
  /jsx-\d{6,}/i,
  /(wp-image|post|td-nr-views|vuukle-powerbar)-\d{2,}/i,
];
