import { getActionLabel } from '../../data/actions.js'

/** @type {Record<string, string>} */
const BY_ACTION = {
  browse_internet: 'Something on the screen catches my eye — a pattern I did not expect.',
  watch_tv: 'Something on TV stops me for a moment.',
  eat_snack: 'The taste triggers something I cannot place.',
  sit_on_couch: 'A sound from outside catches my attention.',
  read_book: 'A line in the book lands differently than expected.',
  check_phone: 'Something on my phone gives me a strange feeling.',
  use_treadmill: 'A thought surfaces while I am moving.',
  take_shower: 'Something crosses my mind in the water.',
  look_out_window: 'Something outside shifts — I am not sure what.',
  go_outside: 'The threshold feels different for a moment — like the air knows I am leaving.',
  go_back_to_sleep: 'A half-dream image flickers and then is gone.',
  drink_water: 'The water tastes different for a second — I cannot say why.',
  use_toilet: 'A stray thought interrupts the blank moment.',
  use_sink: 'The running water throws a memory I did not ask for.'
}

export function getSynchronicityNoteForAction(actionId) {
  if (BY_ACTION[actionId]) return BY_ACTION[actionId]
  const label = getActionLabel(actionId)
  return `While I ${label}, something small and strange prickles at the edge of my attention.`
}
