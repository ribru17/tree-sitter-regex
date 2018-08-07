const pattern = $ => choice(
  $.disjunction,
  $.term,
)

const disjunction = $ =>
  seq(optional($.term), repeat1(seq('|', optional($.term))))

const term = $ =>
  repeat1(seq($.atom, optional($.quantifier)))

const atom = $ =>
  choice(
    $.assertion,
    $.pattern_character,
    $.character_class,
    '.',
    $.atom_escape,
    $.anonymous_capturing_group,
    $.named_capturing_group,
    $.non_capturing_group,
  )

const assertion = $ => choice(
  '^', '$', '\\b', '\\B',
  seq(
    '(?',
    choice('=', '!', '<=', '<!'),
    $.pattern,
    ')'
  )
)

const pattern_character = $ =>
  // Anything not a SYNTAX_CHAR
  new RegExp(`[^${SYNTAX_CHARS_ESCAPED}\\n]`)

const character_class = $ => seq(
  '[',
  optional('^'),
  repeat($.class_range),
  ']'
)

const class_range = $ => prec.right(
  seq($.class_atom, optional(seq('-', $.class_atom)))
)

const class_atom = $ => choice(
  '-',
  // NOT: \ ] or -
  /[^\\\]\-]/,
  $.class_escape,
)

const class_escape = $ => seq('\\', choice(
  'b',
  '-',
  $.character_class_escape,
  $.character_escape,
))

const anonymous_capturing_group = $ =>
  seq('(', $.pattern, ')')

const named_capturing_group = $ =>
  seq('(?<', $.group_name, '>', $.pattern, ')')

const non_capturing_group = $ =>
  seq('(?:', $.pattern, ')')

const quantifier = $ =>
  seq($.quantifier_prefix, alias(optional('?'), $.non_greedy))

const quantifier_prefix = $ => choice(
  '*', '+', '?',
  $.count_quantifier,
)

const count_quantifier = $ => seq(
  '{',
  seq($.decimal_digits, optional(seq(',', $.decimal_digits))),
  '}'
)

const atom_escape = $ => seq('\\', choice(
  $.decimal_escape,
  $.character_class_escape,
  $.character_escape,
  // seq('k', $.group_name),
))

const decimal_escape = $ => /[1-9][0-9]+/

const character_class_escape = $ => choice(
  /[dDsSwW]/,
  seq(/[pP]/, '{', $.unicode_property_value_expression, '}')
)

const unicode_property_value_expression = $ => seq(
  optional(seq(alias($.unicode_property, $.unicode_property_name), '=')),
  alias($.unicode_property, $.unicode_property_value)
)

const unicode_property = $ => /[a-zA-Z_0-9]+/

const character_escape = $ => choice(
  $.control_escape,
  seq('c', $.control_letter),
  $.identity_escape
)

const identity_escape = $ => new RegExp(`[${SYNTAX_CHARS_ESCAPED}]`)

// TODO: We should technically not accept \0 unless the
// lookahead is not also a digit.
// I think this has little bearing on the highlighting of
// correct regexes.
const control_escape = $ => /[fnrtv0]/

const control_letter = $ => /[a-zA-Z]/

// TODO: This is an approximation of RegExpIdentifierName in the
// formal grammar, which allows for Unicode names through
// the following mechanism:
//
// RegExpIdentifierName[U]::
//   RegExpIdentifierStart[?U]
//   RegExpIdentifierName[?U]RegExpIdentifierPart[?U]
//
// RegExpIdentifierStart[U]::
//   UnicodeIDStart
//   $
//   _
//   \RegExpUnicodeEscapeSequence[?U]
//
// RegExpIdentifierPart[U]::
//   UnicodeIDContinue
//   $
//   \RegExpUnicodeEscapeSequence[?U]
//   <ZWNJ> <ZWJ>
// RegExpUnicodeEscapeSequence[U]::
//   [+U]uLeadSurrogate\uTrailSurrogate
//   [+U]uLeadSurrogate
//   [+U]uTrailSurrogate
//   [+U]uNonSurrogate
//   [~U]uHex4Digits
//   [+U]u{CodePoint}
const group_name = $ => /[A-Za-z0-9]+/

const decimal_digits = $ => /\d+/

const SYNTAX_CHARS = [
  ...'^$\\.*+?()[]{}|'
]

const SYNTAX_CHARS_ESCAPED = SYNTAX_CHARS.map(
  char => `\\${char}`
).join('')

module.exports = {
  pattern,
  disjunction,
  term,
  atom,
  non_capturing_group,
  assertion,
  character_class, class_range, class_atom, class_escape,
  pattern_character,
  quantifier,
  quantifier_prefix,
  count_quantifier,
  atom_escape,
  decimal_escape,
  character_class_escape,
  unicode_property_value_expression,
  unicode_property,
  character_escape,
  identity_escape,
  control_escape,
  control_letter,
  anonymous_capturing_group,
  named_capturing_group,
  group_name,
  decimal_digits,
}