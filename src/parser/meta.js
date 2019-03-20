const unsupportedCombinationsDescription = [
  [
    ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 's', 'u', 'footer', 'mark'],
    ['img', 'video', 'iframe', 'audio', 'footer'],
  ],
  [
    ['blockquote', 'aside'],
    ['img', 'video', 'audio', 'iframe'],
  ],
  [
    ['blockquote', 'aside', 'img', 'source', 'picture', 'iframe', 'video', 'audio', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
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
