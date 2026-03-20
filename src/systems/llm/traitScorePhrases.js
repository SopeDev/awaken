/**
 * Score-band personality language (no numbers). Used when mode is STANDARD / STANDARD_TENSION.
 * Traits align with Cosmic Blueprint TRAIT_IDS.
 */

const band = (score) => {
  if (score <= 10) return 'd0'
  if (score <= 20) return 'd1'
  if (score < 40) return 'd2'
  if (score <= 60) return null
  if (score < 80) return 'u0'
  if (score < 90) return 'u1'
  return 'u2'
}

export const TRAIT_SCORE_PHRASES = {
  courage: {
    d0: 'breaking inertia feels almost impossible — I avoid what asks something of me',
    d1: 'stepping toward difficulty rarely happens first — I hang back',
    d2: 'I hesitate before I move — approach takes effort',
    u0: 'I can lean into discomfort when I have to — I do not always run',
    u1: 'I tend toward bold moves — difficulty does not automatically stop me',
    u2: 'I push through resistance almost by reflex — I meet challenge head-on'
  },
  discipline: {
    d0: 'I barely follow through — intentions collapse almost immediately',
    d1: 'sustaining effort is hard — I start things and lose them',
    d2: 'I find it hard to keep momentum — structure slips on me',
    u0: 'I can hold a line when it matters — consistency shows up for the important stuff',
    u1: 'I keep commitments reasonably well — I follow through more often than not',
    u2: 'I am steady under pressure — I finish what I start'
  },
  expressiveness: {
    d0: 'I stay invisible — initiating feels wrong or risky',
    d1: 'I rarely put myself forward — I watch more than I show',
    d2: 'I hold back outwardly — presence takes a conscious push',
    u0: 'I speak up when it fits — I can take space without forcing it',
    u1: 'I initiate fairly easily — I put things into the world',
    u2: 'I move toward the spotlight — expression is natural'
  },
  logic: {
    d0: 'structured reasoning feels foreign — my mind jumps or blanks',
    d1: 'I struggle to keep arguments straight — coherence costs me',
    d2: 'I think clearly sometimes and fog out other times — logic is uneven',
    u0: 'I tend toward analysis — I like things to make sense',
    u1: 'I think in patterns and steps — coherence matters to me',
    u2: 'my mind sorts and orders almost constantly — structure is how I move'
  },
  intuition: {
    d0: 'beneath-the-surface reads barely register — I live on what is obvious',
    d1: 'hints and hunches feel unreliable — I discount them',
    d2: 'I sometimes sense more than I admit — I do not always trust it',
    u0: 'I catch undercurrents — subtle reads land',
    u1: 'I read between lines comfortably — pattern under pattern notices me',
    u2: 'signals underneath ordinary life speak loudly — intuition is central'
  },
  curiosity: {
    d0: 'new territory feels like threat — I cling to the familiar',
    d1: 'exploration drains me — I prefer the known',
    d2: 'I can be open, but novelty costs something — I dip in and out',
    u0: 'I am open to new things when they arise — novelty interests me',
    u1: 'I reach for what I do not know — exploration pulls me',
    u2: 'curiosity dominates almost every decision — I have to look, have to know'
  },
  empathy: {
    d0: 'other people inner lives feel distant — I stay in my own weather',
    d1: 'attunement is thin — connection stays shallow',
    d2: 'I can care, but I guard it — closeness is careful',
    u0: 'I feel the room — moods land on me',
    u1: 'I tune to others without trying — resonance is frequent',
    u2: 'emotional overlap is intense — I carry what is not mine'
  },
  desire: {
    d0: 'want barely stirs — reward does not move me much',
    d1: 'pleasure feels muted — motivation runs low',
    d2: 'I want things, but quietly — hunger is there, not loud',
    u0: 'what I want pulls me with real force — motivation is alive',
    u1: 'pleasure and reward steer me — I feel the pull sharply',
    u2: 'desire runs hot — it shapes choices in almost every moment'
  },
  introspection: {
    d0: 'I do not examine myself — patterns I live stay invisible to me',
    d1: 'self-reflection is rare and shallow — the loop stays unnamed',
    d2: 'I notice myself sometimes — insight flickers, then goes',
    u0: 'I catch my own patterns — I can name what I am doing',
    u1: 'I reflect often — the inner story is legible',
    u2: 'self-observation is constant — I narrate my own psychology'
  },
  resilience: {
    d0: 'pressure shatters me fast — I fold or flee',
    d1: 'I do not stay with stress well — I escape early',
    d2: 'sometimes I endure, sometimes I do not — it is inconsistent',
    u0: 'I can stay with difficulty — I do not always need out',
    u1: 'discomfort does not automatically break me — I absorb and continue',
    u2: 'I weather storms — endurance is one of my anchors'
  },
  imagination: {
    d0: 'alternatives barely occur to me — I see only what is',
    d1: 'what-if thinking is weak — the literal screen fills my mind',
    d2: 'I can imagine, but default is concrete — fantasy is secondary',
    u0: 'possibilities occur to me — I can picture other paths',
    u1: 'my mind generates alternatives easily — the not-yet-real is vivid',
    u2: 'imaginative space is huge — I live as much in might-be as in is'
  },
  perception: {
    d0: 'environmental detail slips past — I miss what is in front of me',
    d1: 'I notice little unless it shouts — awareness is blunt',
    d2: 'sometimes sharp, sometimes blind — observation is patchy',
    u0: 'I pick up on what is around me — environment registers',
    u1: 'detail and pattern in the room speak — I read surroundings well',
    u2: 'almost nothing escapes me — the outer world is loud with information'
  }
}

export function phraseForTraitScore(traitId, score) {
  const b = band(score)
  if (!b) return null
  return TRAIT_SCORE_PHRASES[traitId]?.[b] ?? null
}
