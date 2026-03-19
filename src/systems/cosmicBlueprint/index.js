/**
 * Cosmic Blueprint — psychological / character stat system.
 * Public API for generating and using avatar trait sheets from astrological charts.
 *
 * Use: generateTraitSheet(chart) or generateTraitSheetFromText(chartMarkdown).
 * Other systems (LLM bridge, gameplay) can read the returned trait object.
 */

export {
  TRAIT_IDS,
  TRAIT_META,
  BALANCED_TRAIT_SHEET,
  PLANETS,
  SIGNS,
  PLANET_WEIGHTS,
  BASELINE_TRAIT_SCORE,
  TRAIT_MIN,
  TRAIT_MAX
} from './constants.js'

export { signDeltas, getSignDelta } from './signDeltas.js'

export { dignities, getDignity, applyDignityToDeltas } from './dignities.js'

export {
  normalizePlanet,
  normalizeSign,
  parseChartFromText,
  generateTraitSheet,
  generateTraitSheetFromText,
  getTraitSheetBreakdown,
  getPlacementContributions
} from './generateTraitSheet.js'

export { exampleChart, exampleChart1, exampleChart2 } from './data/exampleChart.js'
