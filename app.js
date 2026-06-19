// World Cup 2026 Monte Carlo Simulation Logic

// Default 48 teams with realistic ratings (based loosely on FIFA ratings / Elo)
const DEFAULT_TEAMS = [
  // Group A
  { id: 'MEX', name: 'Mexico', rating: 1680, group: 'A', flag: 'mx' },
  { id: 'COL', name: 'Colombia', rating: 1820, group: 'A', flag: 'co' },
  { id: 'CMR', name: 'Cameroon', rating: 1610, group: 'A', flag: 'cm' },
  { id: 'NZL', name: 'New Zealand', rating: 1510, group: 'A', flag: 'nz' },
  // Group B
  { id: 'CAN', name: 'Canada', rating: 1690, group: 'B', flag: 'ca' },
  { id: 'ECU', name: 'Ecuador', rating: 1720, group: 'B', flag: 'ec' },
  { id: 'POL', name: 'Poland', rating: 1650, group: 'B', flag: 'pl' },
  { id: 'ANG', name: 'Angola', rating: 1540, group: 'B', flag: 'ao' },
  // Group C
  { id: 'URU', name: 'Uruguay', rating: 1890, group: 'C', flag: 'uy' },
  { id: 'SCO', name: 'Scotland', rating: 1640, group: 'C', flag: 'gb-sct' },
  { id: 'UZB', name: 'Uzbekistan', rating: 1580, group: 'C', flag: 'uz' },
  { id: 'JAM', name: 'Jamaica', rating: 1550, group: 'C', flag: 'jm' },
  // Group D (Official: USA, Australia, Turkey, Paraguay)
  { id: 'USA', name: 'United States', rating: 1860, group: 'D', flag: 'us' },
  { id: 'AUS', name: 'Australia', rating: 1690, group: 'D', flag: 'au' },
  { id: 'TUR', name: 'Turkey', rating: 1770, group: 'D', flag: 'tr' }, 
  { id: 'PRY', name: 'Paraguay', rating: 1650, group: 'D', flag: 'py' },
  // Group E
  { id: 'BRA', name: 'Brazil', rating: 2020, group: 'E', flag: 'br' },
  { id: 'AUT', name: 'Austria', rating: 1760, group: 'E', flag: 'at' },
  { id: 'MLI', name: 'Mali', rating: 1630, group: 'E', flag: 'ml' },
  { id: 'IRQ', name: 'Iraq', rating: 1570, group: 'E', flag: 'iq' },
  // Group F
  { id: 'ENG', name: 'England', rating: 2040, group: 'F', flag: 'gb-eng' },
  { id: 'UKR', name: 'Ukraine', rating: 1740, group: 'F', flag: 'ua' },
  { id: 'PER', name: 'Peru', rating: 1660, group: 'F', flag: 'pe' },
  { id: 'OMA', name: 'Oman', rating: 1530, group: 'F', flag: 'om' },
  // Group G
  { id: 'ARG', name: 'Argentina', rating: 2110, group: 'G', flag: 'ar' },
  { id: 'SRB', name: 'Serbia', rating: 1710, group: 'G', flag: 'rs' },
  { id: 'CRC', name: 'Costa Rica', rating: 1590, group: 'G', flag: 'cr' },
  { id: 'RSA', name: 'South Africa', rating: 1600, group: 'G', flag: 'za' },
  // Group H
  { id: 'ESP', name: 'Spain', rating: 2070, group: 'H', flag: 'es' },
  { id: 'SWE', name: 'Sweden', rating: 1750, group: 'H', flag: 'se' },
  { id: 'EGY', name: 'Egypt', rating: 1670, group: 'H', flag: 'eg' },
  { id: 'CHN', name: 'China', rating: 1480, group: 'H', flag: 'cn' },
  // Group I
  { id: 'GER', name: 'Germany', rating: 1980, group: 'I', flag: 'de' },
  { id: 'NGA', name: 'Nigeria', rating: 1730, group: 'I', flag: 'ng' },
  { id: 'ROU', name: 'Romania', rating: 1680, group: 'I', flag: 'ro' },
  { id: 'PAN', name: 'Panama', rating: 1580, group: 'I', flag: 'pa' },
  // Group J
  { id: 'BEL', name: 'Belgium', rating: 1950, group: 'J', flag: 'be' },
  { id: 'JPN', name: 'Japan', rating: 1810, group: 'J', flag: 'jp' },
  { id: 'VEN', name: 'Venezuela', rating: 1650, group: 'J', flag: 've' },
  { id: 'TUN', name: 'Tunisia', rating: 1620, group: 'J', flag: 'tn' },
  // Group K
  { id: 'POR', name: 'Portugal', rating: 2010, group: 'K', flag: 'pt' },
  { id: 'DEN', name: 'Denmark', rating: 1790, group: 'K', flag: 'dk' },
  { id: 'KOR', name: 'South Korea', rating: 1740, group: 'K', flag: 'kr' },
  { id: 'GHA', name: 'Ghana', rating: 1620, group: 'K', flag: 'gh' },
  // Group L
  { id: 'NED', name: 'Netherlands', rating: 2000, group: 'L', flag: 'nl' },
  { id: 'SUI', name: 'Switzerland', rating: 1780, group: 'L', flag: 'ch' },
  { id: 'SEN', name: 'Senegal', rating: 1720, group: 'L', flag: 'sn' },
  { id: 'FRA', name: 'France', rating: 2050, group: 'L', flag: 'fr' }
];

// Knuth-Poisson generator for goals
function poissonRandom(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 15);
  return k - 1;
}

// Simulates a single match between two teams
// Returns [goalsA, goalsB]
function simulateMatch(teamA, teamB) {
  const ratingDiff = teamA.rating - teamB.rating;
  const lambdaA = 1.35 * Math.pow(10, ratingDiff / 800);
  const lambdaB = 1.35 * Math.pow(10, -ratingDiff / 800);
  
  return [poissonRandom(lambdaA), poissonRandom(lambdaB)];
}

// Resolves a knockout match (must have a winner)
function simulateKnockoutMatch(teamA, teamB) {
  let [goalsA, goalsB] = simulateMatch(teamA, teamB);
  if (goalsA !== goalsB) {
    return { winner: goalsA > goalsB ? teamA : teamB, goalsA, goalsB, pens: false };
  }
  
  // Extra Time
  const extraDiff = teamA.rating - teamB.rating;
  const lambdaA = 0.35 * Math.pow(10, extraDiff / 800);
  const lambdaB = 0.35 * Math.pow(10, -extraDiff / 800);
  const extraA = poissonRandom(lambdaA);
  const extraB = poissonRandom(lambdaB);
  
  goalsA += extraA;
  goalsB += extraB;
  
  if (goalsA !== goalsB) {
    return { winner: goalsA > goalsB ? teamA : teamB, goalsA, goalsB, pens: false };
  }
  
  // Penalty Shootout
  const probA = 0.5 + (teamA.rating - teamB.rating) / 4000;
  const clampedProbA = Math.max(0.35, Math.min(0.65, probA));
  const winner = Math.random() < clampedProbA ? teamA : teamB;
  return { winner, goalsA, goalsB, pens: true };
}

// Helper to record match stats
function recordMatchStats(teamA, teamB, gA, gB) {
  teamA.goalsFor += gA;
  teamA.goalsAgainst += gB;
  teamB.goalsFor += gB;
  teamB.goalsAgainst += gA;
  
  if (gA > gB) {
    teamA.points += 3;
  } else if (gB > gA) {
    teamB.points += 3;
  } else {
    teamA.points += 1;
    teamB.points += 1;
  }
}

// Run a full single tournament simulation
function runSingleSimulation(teamsList, selectedTeamId) {
  const teams = teamsList.map(t => ({
    ...t,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0
  }));

  const groups = {};
  teams.forEach(team => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  });

  // Group Stage
  for (const groupName in groups) {
    const groupTeams = groups[groupName];
    
    // Seed pre-played games for this group
    const seeded = window.SeededMatches[groupName] || [];
    seeded.forEach(m => {
      const tA = groupTeams.find(t => t.id === m.teamAId);
      const tB = groupTeams.find(t => t.id === m.teamBId);
      if (tA && tB) {
        recordMatchStats(tA, tB, m.goalsA, m.goalsB);
      }
    });

    const isSeeded = (idA, idB) => {
      return seeded.some(m => 
        (m.teamAId === idA && m.teamBId === idB) || 
        (m.teamAId === idB && m.teamBId === idA)
      );
    };
    
    // Simulate remaining matches
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const teamA = groupTeams[i];
        const teamB = groupTeams[j];
        if (!isSeeded(teamA.id, teamB.id)) {
          const [gA, gB] = simulateMatch(teamA, teamB);
          recordMatchStats(teamA, teamB, gA, gB);
        }
      }
    }
  }

  // Sort each group
  const groupStandings = {};
  const firsts = [];
  const seconds = [];
  const thirds = [];

  for (const groupName in groups) {
    const groupTeams = groups[groupName];
    groupTeams.forEach(t => {
      t.goalDiff = t.goalsFor - t.goalsAgainst;
    });
    
    groupTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return b.rating - a.rating;
    });

    groupStandings[groupName] = [...groupTeams];
    firsts.push(groupTeams[0]);
    seconds.push(groupTeams[1]);
    thirds.push({ ...groupTeams[2], originalGroup: groupName });
  }

  // Sort third-place teams
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.rating - a.rating;
  });

  const bestThirds = thirds.slice(0, 8);
  const qualified3rdIds = new Set(bestThirds.map(t => t.id));

  // Determine selected team's standing
  const userTeam = teams.find(t => t.id === selectedTeamId);
  const userTeamGroupStandings = groupStandings[userTeam.group];
  const userTeamIndex = userTeamGroupStandings.findIndex(t => t.id === selectedTeamId);
  
  let userTeamStage = 'Group Stage';
  let userTeamGroupFinish = userTeamIndex + 1;

  // Track qualified teams in the group
  const groupTeams = groupStandings[userTeam.group];
  const qualifiedGroupTeamIds = [];
  groupTeams.forEach(t => {
    const finish = groupTeams.findIndex(item => item.id === t.id) + 1;
    if (finish <= 2 || (finish === 3 && qualified3rdIds.has(t.id))) {
      qualifiedGroupTeamIds.push(t.id);
    }
  });

  const isUserTeamInBestThirds = userTeamGroupFinish === 3 && qualified3rdIds.has(selectedTeamId);
  const proceedsToR32 = userTeamGroupFinish <= 2 || isUserTeamInBestThirds;

  if (!proceedsToR32) {
    return { userTeamStage, userTeamGroupFinish, qualifiedGroupTeamIds };
  }
  
  userTeamStage = 'Round of 32';

  const knockoutPool = [];
  firsts.forEach(t => knockoutPool.push(t));
  seconds.forEach(t => knockoutPool.push(t));
  bestThirds.forEach(t => knockoutPool.push(t));

  let currentRound = [...knockoutPool];
  const roundNames = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  
  for (let r = 0; r < roundNames.length; r++) {
    const roundName = roundNames[r];
    const nextRound = [];
    
    for (let i = 0; i < currentRound.length; i += 2) {
      if (i + 1 >= currentRound.length) {
        nextRound.push(currentRound[i]);
        break;
      }
      
      const teamA = currentRound[i];
      const teamB = currentRound[i + 1];
      const matchResult = simulateKnockoutMatch(teamA, teamB);
      
      if (teamA.id === selectedTeamId || teamB.id === selectedTeamId) {
        if (matchResult.winner.id === selectedTeamId) {
          userTeamStage = r === roundNames.length - 1 ? 'Winner' : roundNames[r + 1];
        } else {
          return { userTeamStage, userTeamGroupFinish, qualifiedGroupTeamIds };
        }
      }
      
      nextRound.push(matchResult.winner);
    }
    currentRound = nextRound;
  }

  return { userTeamStage, userTeamGroupFinish, qualifiedGroupTeamIds };
}

// Pre-generate/seed matches for all groups on load
window.SeededMatches = {};

function initSeededMatches() {
  const groups = {};
  DEFAULT_TEAMS.forEach(team => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  });

  for (const groupName in groups) {
    const groupTeams = groups[groupName];
    if (groupName === 'D') {
      window.SeededMatches['D'] = [
        { teamAId: 'USA', teamBId: 'PRY', goalsA: 4, goalsB: 1 },
        { teamAId: 'AUS', teamBId: 'TUR', goalsA: 2, goalsB: 0 }
      ];
    } else {
      const t0 = groupTeams[0];
      const t1 = groupTeams[1];
      const t2 = groupTeams[2];
      const t3 = groupTeams[3];
      
      const [g0, g1] = simulateMatch(t0, t1);
      const [g2, g3] = simulateMatch(t2, t3);
      
      window.SeededMatches[groupName] = [
        { teamAId: t0.id, teamBId: t1.id, goalsA: g0, goalsB: g1 },
        { teamAId: t2.id, teamBId: t3.id, goalsA: g2, goalsB: g3 }
      ];
    }
  }
}
initSeededMatches();

// Global configurations and runner
window.SimulationEngine = {
  teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
  
  setTeamRating: function(id, newRating) {
    const team = this.teams.find(t => t.id === id);
    if (team) {
      team.rating = newRating;
    }
  },

  // Runs Monte Carlo simulation in async chunks
  runSimulation: function(selectedTeamId, iterations, onProgress, onComplete) {
    let currentIteration = 0;
    const chunkSize = Math.min(500, Math.ceil(iterations / 20));
    
    const activeTeam = this.teams.find(t => t.id === selectedTeamId);
    const groupTeamIds = this.teams.filter(t => t.group === activeTeam.group).map(t => t.id);

    const stats = {
      total: iterations,
      groupFinish: { 1: 0, 2: 0, 3: 0, 4: 0 },
      stages: {
        'Group Stage': 0,
        'Round of 32': 0,
        'Round of 16': 0,
        'Quarterfinals': 0,
        'Semifinals': 0,
        'Final': 0,
        'Winner': 0
      },
      groupProgression: {}
    };

    groupTeamIds.forEach(id => stats.groupProgression[id] = 0);

    function processChunk() {
      const end = Math.min(currentIteration + chunkSize, iterations);
      for (let i = currentIteration; i < end; i++) {
        const res = runSingleSimulation(SimulationEngine.teams, selectedTeamId);
        stats.groupFinish[res.userTeamGroupFinish]++;
        stats.stages[res.userTeamStage]++;
        res.qualifiedGroupTeamIds.forEach(id => {
          if (stats.groupProgression[id] !== undefined) {
            stats.groupProgression[id]++;
          }
        });
      }
      
      currentIteration = end;
      onProgress(currentIteration, iterations);

      if (currentIteration < iterations) {
        setTimeout(processChunk, 0);
      } else {
        const probabilities = {
          groupFinish: {
            1: stats.groupFinish[1] / iterations,
            2: stats.groupFinish[2] / iterations,
            3: stats.groupFinish[3] / iterations,
            4: stats.groupFinish[4] / iterations
          },
          stagesReach: {
            'Group Stage': 1.0,
            'Round of 32': (iterations - stats.stages['Group Stage']) / iterations,
            'Round of 16': (iterations - stats.stages['Group Stage'] - stats.stages['Round of 32']) / iterations,
            'Quarterfinals': (iterations - stats.stages['Group Stage'] - stats.stages['Round of 32'] - stats.stages['Round of 16']) / iterations,
            'Semifinals': (iterations - stats.stages['Group Stage'] - stats.stages['Round of 32'] - stats.stages['Round of 16'] - stats.stages['Quarterfinals']) / iterations,
            'Final': (stats.stages['Final'] + stats.stages['Winner']) / iterations,
            'Winner': stats.stages['Winner'] / iterations
          },
          groupProgression: {}
        };

        for (const id in stats.groupProgression) {
          probabilities.groupProgression[id] = stats.groupProgression[id] / iterations;
        }

        onComplete(probabilities);
      }
    }

    setTimeout(processChunk, 0);
  }
};
