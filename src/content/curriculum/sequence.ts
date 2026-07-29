// Primary sequencing references:
// - МОН learning programs based on Merzliak et al. for mathematics, grades 5–6 (2024)
// - МОН model programs by Merzliak et al. for algebra and geometry, grades 7–9 (2023)
//
// Algebra and geometry are parallel school subjects in grades 7–9. The academy needs one
// deterministic recommendation route, so it completes the algebra strand before the geometry
// strand while preserving the official order inside each strand.
export const grade5TopicIds = [
  'natural-numbers',
  'division-with-remainder',
  'powers-natural',
  'order-of-operations',
  'expressions-formulas-equations',
  'fraction-meaning',
  'fraction-types-mixed',
  'comparing-fractions',
  'fraction-addition-equal',
  'decimals',
  'decimal-operations',
  'arithmetic-mean',
  'percentages',
  'measurement-geometry',
  'coordinate-ray',
  'tables-diagrams-grade5',
] as const

export const grade6TopicIds = [
  'divisibility',
  'prime-factorization',
  'greatest-common-divisor',
  'least-common-multiple',
  'equivalent-fractions',
  'fraction-addition-different',
  'fraction-multiplication',
  'fractions-of-quantity',
  'fraction-decimal-conversion',
  'periodic-decimals',
  'ratios-proportions',
  'direct-proportion',
  'inverse-proportion',
  'data-charts-grade6',
  'elementary-combinatorics-grade6',
  'negative-numbers',
  'signed-arithmetic',
  'grade6-expressions',
  'grade6-equations',
  'coordinate-plane',
  'circle-measurements-grade6',
  'solid-figures-grade6',
] as const

export const grade7TopicIds = [
  'algebraic-expressions',
  'powers-monomials',
  'monomials',
  'polynomial-operations',
  'polynomial-multiplication',
  'polynomial-factorization',
  'common-factor',
  'factor-by-grouping',
  'linear-equations',
  'systems-linear-equations',
  'linear-functions',
  'geometry-foundations-proof',
  'geometry-axioms-angles',
  'triangle-elements',
  'triangles-congruence',
  'parallel-lines',
  'right-triangle-properties-grade7',
  'circle-constructions',
] as const

export const grade8TopicIds = [
  'rational-expressions',
  'integer-exponents-standard-form',
  'square-roots',
  'quadratic-trinomial',
  'real-numbers',
  'rational-equations',
  'quadratic-equations',
  'quadrilaterals',
  'central-inscribed-angles',
  'inscribed-circumscribed-figures',
  'thales-similarity',
  'right-triangle-metric-relations',
  'pythagorean-theorem',
  'right-triangles',
  'polygon-areas',
] as const

export const grade9TopicIds = [
  'linear-inequalities',
  'systems-linear-inequalities',
  'function-properties-transformations',
  'quadratic-function',
  'quadratic-inequalities',
  'nonlinear-systems',
  'sequences',
  'arithmetic-progression',
  'geometric-progression',
  'mathematical-modeling',
  'combinatorics',
  'probability',
  'data-statistics',
  'triangle-trigonometry',
  'triangle-laws',
  'regular-polygons',
  'coordinate-method',
  'vectors',
  'geometric-transformations',
  'circle-measurements-grade9',
] as const

export const curriculumTopicSequence = [
  ...grade5TopicIds,
  ...grade6TopicIds,
  ...grade7TopicIds,
  ...grade8TopicIds,
  ...grade9TopicIds,
] as const
