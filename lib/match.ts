import {
  LastMatchInfo,
  MatchCondition,
  MatchExpectedRole,
  MatchHomeAway,
  MatchImportance,
  MatchMinutesBucket,
  MatchResult,
  NextMatchInfo
} from './types';

const roleScores: Record<MatchExpectedRole, number> = {
  Starter: 5,
  Bench: 2,
  'Not in squad': 0
};

const homeAwayScores: Record<MatchHomeAway, number> = {
  Home: 0,
  Away: -1
};

const conditionScores: Record<MatchCondition, number> = {
  '100%': 0,
  Minor: -2,
  'Not 100%': -3
};

const importanceScores: Record<MatchImportance, number> = {
  League: 0,
  Cup: 2,
  Friendly: -1
};

const minutesScores: Record<MatchMinutesBucket, number> = {
  '61-90': 5,
  '31-60': 3,
  '1-30': 1,
  '0': -2
};

const resultScores: Record<MatchResult, number> = {
  Win: 6,
  Draw: 1,
  Loss: -4
};

export const computeEventScore = (nextMatch?: NextMatchInfo, lastMatch?: LastMatchInfo) => {
  let score = 0;

  if (nextMatch) {
    score += roleScores[nextMatch.expectedRole];
    score += homeAwayScores[nextMatch.homeAway];
    score += conditionScores[nextMatch.condition];
    score += importanceScores[nextMatch.importance];
  }

  if (lastMatch) {
    score += resultScores[lastMatch.result];
    score += minutesScores[lastMatch.minutesBucket];
    score += (lastMatch.goals ?? 0) * 6;
    score += (lastMatch.assists ?? 0) * 4;
    if (lastMatch.injury) {
      score -= 8;
    }
  }

  return score;
};

export const buildUpdateReason = (nextMatch?: NextMatchInfo, lastMatch?: LastMatchInfo) => {
  if (lastMatch) {
    const outcome = `${lastMatch.result} · ${lastMatch.minutesBucket} mins`;
    const contributions = [
      lastMatch.goals ? `${lastMatch.goals} goals` : null,
      lastMatch.assists ? `${lastMatch.assists} assists` : null,
      lastMatch.injury ? 'injury reported' : null
    ]
      .filter(Boolean)
      .join(', ');
    return contributions ? `${outcome} (${contributions})` : outcome;
  }

  if (nextMatch) {
    return `Upcoming ${nextMatch.importance} match vs ${nextMatch.opponent} (${nextMatch.expectedRole})`;
  }

  return 'Match update received';
};
