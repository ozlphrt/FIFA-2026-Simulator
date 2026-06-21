// World Cup 2026 Monte Carlo Simulation Logic

// Default 48 teams with realistic ratings (based loosely on FIFA ratings / Elo)
const DEFAULT_TEAMS = [
  // Group A
  { id: 'MEX', name: 'Mexico', rating: 1680, group: 'A', flag: 'mx' },
  { id: 'RSA', name: 'South Africa', rating: 1600, group: 'A', flag: 'za' },
  { id: 'KOR', name: 'South Korea', rating: 1740, group: 'A', flag: 'kr' },
  { id: 'CZE', name: 'Czechia', rating: 1670, group: 'A', flag: 'cz' },
  // Group B
  { id: 'CAN', name: 'Canada', rating: 1690, group: 'B', flag: 'ca' },
  { id: 'SUI', name: 'Switzerland', rating: 1780, group: 'B', flag: 'ch' },
  { id: 'QAT', name: 'Qatar', rating: 1600, group: 'B', flag: 'qa' },
  { id: 'BIH', name: 'Bosnia and Herzegovina', rating: 1640, group: 'B', flag: 'ba' },
  // Group C
  { id: 'BRA', name: 'Brazil', rating: 2020, group: 'C', flag: 'br' },
  { id: 'MAR', name: 'Morocco', rating: 1840, group: 'C', flag: 'ma' },
  { id: 'HAI', name: 'Haiti', rating: 1510, group: 'C', flag: 'ht' },
  { id: 'SCO', name: 'Scotland', rating: 1640, group: 'C', flag: 'gb-sct' },
  // Group D
  { id: 'USA', name: 'United States', rating: 1860, group: 'D', flag: 'us' },
  { id: 'PRY', name: 'Paraguay', rating: 1650, group: 'D', flag: 'py' },
  { id: 'AUS', name: 'Australia', rating: 1690, group: 'D', flag: 'au' },
  { id: 'TUR', name: 'Turkey', rating: 1770, group: 'D', flag: 'tr' },
  // Group E
  { id: 'GER', name: 'Germany', rating: 1980, group: 'E', flag: 'de' },
  { id: 'CUW', name: 'Curaçao', rating: 1500, group: 'E', flag: 'cw' },
  { id: 'CIV', name: 'Côte d\'Ivoire', rating: 1710, group: 'E', flag: 'ci' },
  { id: 'ECU', name: 'Ecuador', rating: 1720, group: 'E', flag: 'ec' },
  // Group F
  { id: 'NED', name: 'Netherlands', rating: 2000, group: 'F', flag: 'nl' },
  { id: 'JPN', name: 'Japan', rating: 1810, group: 'F', flag: 'jp' },
  { id: 'TUN', name: 'Tunisia', rating: 1620, group: 'F', flag: 'tn' },
  { id: 'SWE', name: 'Sweden', rating: 1750, group: 'F', flag: 'se' },
  // Group G
  { id: 'BEL', name: 'Belgium', rating: 1950, group: 'G', flag: 'be' },
  { id: 'EGY', name: 'Egypt', rating: 1670, group: 'G', flag: 'eg' },
  { id: 'IRN', name: 'Iran', rating: 1750, group: 'G', flag: 'ir' },
  { id: 'NZL', name: 'New Zealand', rating: 1510, group: 'G', flag: 'nz' },
  // Group H
  { id: 'ESP', name: 'Spain', rating: 2070, group: 'H', flag: 'es' },
  { id: 'CPV', name: 'Cabo Verde', rating: 1590, group: 'H', flag: 'cv' },
  { id: 'KSA', name: 'Saudi Arabia', rating: 1610, group: 'H', flag: 'sa' },
  { id: 'URU', name: 'Uruguay', rating: 1890, group: 'H', flag: 'uy' },
  // Group I
  { id: 'FRA', name: 'France', rating: 2050, group: 'I', flag: 'fr' },
  { id: 'SEN', name: 'Senegal', rating: 1720, group: 'I', flag: 'sn' },
  { id: 'NOR', name: 'Norway', rating: 1760, group: 'I', flag: 'no' },
  { id: 'IRQ', name: 'Iraq', rating: 1570, group: 'I', flag: 'iq' },
  // Group J
  { id: 'ARG', name: 'Argentina', rating: 2110, group: 'J', flag: 'ar' },
  { id: 'ALG', name: 'Algeria', rating: 1680, group: 'J', flag: 'dz' },
  { id: 'AUT', name: 'Austria', rating: 1760, group: 'J', flag: 'at' },
  { id: 'JOR', name: 'Jordan', rating: 1540, group: 'J', flag: 'jo' },
  // Group K
  { id: 'POR', name: 'Portugal', rating: 2010, group: 'K', flag: 'pt' },
  { id: 'UZB', name: 'Uzbekistan', rating: 1580, group: 'K', flag: 'uz' },
  { id: 'COL', name: 'Colombia', rating: 1820, group: 'K', flag: 'co' },
  { id: 'COD', name: 'Congo DR', rating: 1600, group: 'K', flag: 'cd' },
  // Group L
  { id: 'ENG', name: 'England', rating: 2040, group: 'L', flag: 'gb-eng' },
  { id: 'CRO', name: 'Croatia', rating: 1880, group: 'L', flag: 'hr' },
  { id: 'GHA', name: 'Ghana', rating: 1620, group: 'L', flag: 'gh' },
  { id: 'PAN', name: 'Panama', rating: 1580, group: 'L', flag: 'pa' }
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
  const lambdaA = 1.35 * Math.pow(10, ratingDiff / 1600);
  const lambdaB = 1.35 * Math.pow(10, -ratingDiff / 1600);
  
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
  const lambdaA = 0.35 * Math.pow(10, extraDiff / 1600);
  const lambdaB = 0.35 * Math.pow(10, -extraDiff / 1600);
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

  const groupMatchesTrack = {};

  // Group Stage
  for (const groupName in groups) {
    const groupTeams = groups[groupName];
    const groupMatches = [];
    groupMatchesTrack[groupName] = groupMatches;
    
    // Seed pre-played games for this group
    const seeded = window.SeededMatches[groupName] || [];
    seeded.forEach(m => {
      groupMatches.push({ teamAId: m.teamAId, teamBId: m.teamBId, goalsA: m.goalsA, goalsB: m.goalsB });
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
          groupMatches.push({ teamAId: teamA.id, teamBId: teamB.id, goalsA: gA, goalsB: gB });
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
    const groupMatches = groupMatchesTrack[groupName];
    
    groupTeams.forEach(t => {
      t.goalDiff = t.goalsFor - t.goalsAgainst;
    });
    
    groupTeams.sort((a, b) => {
      // 1. Points
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      
      // Find all teams with the same points as a and b
      const tiedTeams = groupTeams.filter(t => t.points === a.points);
      if (tiedTeams.length > 1) {
        // 2. Head-to-head points among tied teams
        const getH2HPoints = (teamId) => {
          let pts = 0;
          groupMatches.forEach(m => {
            if (tiedTeams.some(t => t.id === m.teamAId) && tiedTeams.some(t => t.id === m.teamBId)) {
              if (m.teamAId === teamId) {
                if (m.goalsA > m.goalsB) pts += 3;
                else if (m.goalsA === m.goalsB) pts += 1;
              } else if (m.teamBId === teamId) {
                if (m.goalsB > m.goalsA) pts += 3;
                else if (m.goalsA === m.goalsB) pts += 1;
              }
            }
          });
          return pts;
        };
        
        const h2hPtsA = getH2HPoints(a.id);
        const h2hPtsB = getH2HPoints(b.id);
        if (h2hPtsB !== h2hPtsA) {
          return h2hPtsB - h2hPtsA;
        }
        
        // 3. Head-to-head goal difference among tied teams
        const getH2HGoalDiff = (teamId) => {
          let gd = 0;
          groupMatches.forEach(m => {
            if (tiedTeams.some(t => t.id === m.teamAId) && tiedTeams.some(t => t.id === m.teamBId)) {
              if (m.teamAId === teamId) gd += (m.goalsA - m.goalsB);
              else if (m.teamBId === teamId) gd += (m.goalsB - m.goalsA);
            }
          });
          return gd;
        };
        
        const h2hGDA = getH2HGoalDiff(a.id);
        const h2hGDB = getH2HGoalDiff(b.id);
        if (h2hGDB !== h2hGDA) {
          return h2hGDB - h2hGDA;
        }
        
        // 4. Head-to-head goals scored among tied teams
        const getH2HGoalsFor = (teamId) => {
          let gf = 0;
          groupMatches.forEach(m => {
            if (tiedTeams.some(t => t.id === m.teamAId) && tiedTeams.some(t => t.id === m.teamBId)) {
              if (m.teamAId === teamId) gf += m.goalsA;
              else if (m.teamBId === teamId) gf += m.goalsB;
            }
          });
          return gf;
        };
        
        const h2hGFA = getH2HGoalsFor(a.id);
        const h2hGFB = getH2HGoalsFor(b.id);
        if (h2hGFB !== h2hGFA) {
          return h2hGFB - h2hGFA;
        }
      }
      
      // 5. Overall goal difference
      if (b.goalDiff !== a.goalDiff) {
        return b.goalDiff - a.goalDiff;
      }
      
      // 6. Overall goals scored
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      
      // 7. Rating
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

  const bracket = {
    'Round of 32': [],
    'Round of 16': [],
    'Quarterfinals': [],
    'Semifinals': [],
    'Final': [],
    'Winner': null
  };

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

  if (proceedsToR32) {
    userTeamStage = 'Round of 32';
  }

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
      
      bracket[roundName].push({
        teamA: { id: teamA.id, name: teamA.name, flag: teamA.flag, rating: teamA.rating },
        teamB: { id: teamB.id, name: teamB.name, flag: teamB.flag, rating: teamB.rating },
        goalsA: matchResult.goalsA,
        goalsB: matchResult.goalsB,
        pens: matchResult.pens,
        winnerId: matchResult.winner.id
      });
      
      if (proceedsToR32 && (teamA.id === selectedTeamId || teamB.id === selectedTeamId)) {
        if (matchResult.winner.id === selectedTeamId) {
          userTeamStage = r === roundNames.length - 1 ? 'Winner' : roundNames[r + 1];
        }
      }
      
      nextRound.push(matchResult.winner);
    }
    currentRound = nextRound;
  }

  if (currentRound.length > 0) {
    const winTeam = currentRound[0];
    bracket['Winner'] = { id: winTeam.id, name: winTeam.name, flag: winTeam.flag, rating: winTeam.rating };
  }

  return { userTeamStage, userTeamGroupFinish, qualifiedGroupTeamIds, bracket };
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
        { teamAId: 'AUS', teamBId: 'TUR', goalsA: 2, goalsB: 0 },
        { teamAId: 'USA', teamBId: 'AUS', goalsA: 2, goalsB: 0 },
        { teamAId: 'TUR', teamBId: 'PRY', goalsA: 0, goalsB: 1 }
      ];
    } else if (groupName === 'A') {
      window.SeededMatches['A'] = [
        { teamAId: 'MEX', teamBId: 'RSA', goalsA: 2, goalsB: 0 },
        { teamAId: 'KOR', teamBId: 'CZE', goalsA: 2, goalsB: 1 },
        { teamAId: 'CZE', teamBId: 'RSA', goalsA: 1, goalsB: 1 },
        { teamAId: 'MEX', teamBId: 'KOR', goalsA: 1, goalsB: 0 }
      ];
    } else if (groupName === 'B') {
      window.SeededMatches['B'] = [
        { teamAId: 'CAN', teamBId: 'BIH', goalsA: 1, goalsB: 1 },
        { teamAId: 'SUI', teamBId: 'QAT', goalsA: 1, goalsB: 1 },
        { teamAId: 'CAN', teamBId: 'QAT', goalsA: 6, goalsB: 0 },
        { teamAId: 'SUI', teamBId: 'BIH', goalsA: 4, goalsB: 1 }
      ];
    } else if (groupName === 'C') {
      window.SeededMatches['C'] = [
        { teamAId: 'BRA', teamBId: 'MAR', goalsA: 1, goalsB: 1 },
        { teamAId: 'SCO', teamBId: 'HAI', goalsA: 1, goalsB: 0 },
        { teamAId: 'BRA', teamBId: 'HAI', goalsA: 3, goalsB: 0 },
        { teamAId: 'MAR', teamBId: 'SCO', goalsA: 1, goalsB: 0 }
      ];
    } else if (groupName === 'E') {
      window.SeededMatches['E'] = [
        { teamAId: 'GER', teamBId: 'CUW', goalsA: 7, goalsB: 1 },
        { teamAId: 'CIV', teamBId: 'ECU', goalsA: 1, goalsB: 0 },
        { teamAId: 'GER', teamBId: 'CIV', goalsA: 1, goalsB: 0 },
        { teamAId: 'ECU', teamBId: 'CUW', goalsA: 1, goalsB: 1 }
      ];
    } else if (groupName === 'F') {
      window.SeededMatches['F'] = [
        { teamAId: 'SWE', teamBId: 'TUN', goalsA: 5, goalsB: 1 },
        { teamAId: 'NED', teamBId: 'JPN', goalsA: 2, goalsB: 2 },
        { teamAId: 'NED', teamBId: 'SWE', goalsA: 5, goalsB: 1 }
      ];
    } else if (groupName === 'I') {
      window.SeededMatches['I'] = [
        { teamAId: 'FRA', teamBId: 'SEN', goalsA: 3, goalsB: 1 },
        { teamAId: 'NOR', teamBId: 'IRQ', goalsA: 4, goalsB: 1 }
      ];
    } else if (groupName === 'J') {
      window.SeededMatches['J'] = [
        { teamAId: 'ARG', teamBId: 'ALG', goalsA: 3, goalsB: 0 },
        { teamAId: 'AUT', teamBId: 'JOR', goalsA: 3, goalsB: 1 }
      ];
    } else if (groupName === 'K') {
      window.SeededMatches['K'] = [
        { teamAId: 'POR', teamBId: 'COD', goalsA: 1, goalsB: 1 },
        { teamAId: 'COL', teamBId: 'UZB', goalsA: 3, goalsB: 1 }
      ];
    } else if (groupName === 'L') {
      window.SeededMatches['L'] = [
        { teamAId: 'ENG', teamBId: 'CRO', goalsA: 4, goalsB: 2 },
        { teamAId: 'GHA', teamBId: 'PAN', goalsA: 1, goalsB: 0 }
      ];
    } else if (groupName === 'G') {
      window.SeededMatches['G'] = [
        { teamAId: 'BEL', teamBId: 'EGY', goalsA: 1, goalsB: 1 },
        { teamAId: 'IRN', teamBId: 'NZL', goalsA: 2, goalsB: 2 }
      ];
    } else if (groupName === 'H') {
      window.SeededMatches['H'] = [
        { teamAId: 'ESP', teamBId: 'CPV', goalsA: 0, goalsB: 0 },
        { teamAId: 'KSA', teamBId: 'URU', goalsA: 1, goalsB: 1 }
      ];
    } else {
      window.SeededMatches[groupName] = [];
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
      groupProgression: {},
      teamStages: {} // Track stage reaches for all 48 teams
    };

    this.teams.forEach(t => {
      stats.teamStages[t.id] = {
        'Round of 32': 0,
        'Round of 16': 0,
        'Quarterfinals': 0,
        'Semifinals': 0,
        'Final': 0,
        'Winner': 0
      };
    });

    groupTeamIds.forEach(id => stats.groupProgression[id] = 0);

    // Track R32 match slot frequencies (16 slots, each has Team A and Team B position)
    const r32Slots = [];
    for (let i = 0; i < 16; i++) {
      r32Slots.push({ A: {}, B: {} });
    }

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

        // Record slot frequencies in Round of 32
        res.bracket['Round of 32'].forEach((m, idx) => {
          const slot = r32Slots[idx];
          slot.A[m.teamA.id] = (slot.A[m.teamA.id] || 0) + 1;
          slot.B[m.teamB.id] = (slot.B[m.teamB.id] || 0) + 1;
        });

        // Track stage reach counts for all teams
        const b = res.bracket;
        const roundNames = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
        roundNames.forEach(round => {
          if (b[round]) {
            b[round].forEach(m => {
              stats.teamStages[m.teamA.id][round]++;
              stats.teamStages[m.teamB.id][round]++;
            });
          }
        });
        if (b['Winner']) {
          stats.teamStages[b['Winner'].id]['Winner']++;
        }
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
          groupProgression: {},
          teamStages: {}
        };

        for (const id in stats.groupProgression) {
          probabilities.groupProgression[id] = stats.groupProgression[id] / iterations;
        }

        for (const teamId in stats.teamStages) {
          probabilities.teamStages[teamId] = {
            'Round of 32': stats.teamStages[teamId]['Round of 32'] / iterations,
            'Round of 16': stats.teamStages[teamId]['Round of 16'] / iterations,
            'Quarterfinals': stats.teamStages[teamId]['Quarterfinals'] / iterations,
            'Semifinals': stats.teamStages[teamId]['Semifinals'] / iterations,
            'Final': stats.teamStages[teamId]['Final'] / iterations,
            'Winner': stats.teamStages[teamId]['Winner'] / iterations
          };
        }

        // Construct mathematically most likely (consensus) bracket
        const mostLikelyBracket = {
          'Round of 32': [],
          'Round of 16': [],
          'Quarterfinals': [],
          'Semifinals': [],
          'Final': [],
          'Winner': null
        };

        const findTeam = (id) => SimulationEngine.teams.find(t => t.id === id);

        // Step 1: Establish R32 most likely matchups (ensuring unique teams are selected)
        const selectedTeams = new Set();
        for (let i = 0; i < 16; i++) {
          const slot = r32Slots[i];
          
          let maxAId = null, maxACount = -1;
          for (const id in slot.A) {
            if (!selectedTeams.has(id) && slot.A[id] > maxACount) { 
              maxACount = slot.A[id]; 
              maxAId = id; 
            }
          }
          
          let maxBId = null, maxBCount = -1;
          for (const id in slot.B) {
            if (!selectedTeams.has(id) && id !== maxAId && slot.B[id] > maxBCount) { 
              maxBCount = slot.B[id]; 
              maxBId = id; 
            }
          }

          // Fallback if set logic exhausts candidates
          if (!maxAId) {
            for (const id in slot.A) { maxAId = id; break; }
          }
          if (!maxBId || maxBId === maxAId) {
            for (const id in slot.B) { if (id !== maxAId) { maxBId = id; break; } }
          }

          selectedTeams.add(maxAId);
          selectedTeams.add(maxBId);

          const teamA = findTeam(maxAId);
          const teamB = findTeam(maxBId);

          const winA = stats.teamStages[teamA.id]['Winner'];
          const winB = stats.teamStages[teamB.id]['Winner'];
          let winnerId = teamA.id;
          if (winA !== winB) {
            winnerId = winA > winB ? teamA.id : teamB.id;
          } else {
            const probA = stats.teamStages[teamA.id]['Round of 16'];
            const probB = stats.teamStages[teamB.id]['Round of 16'];
            if (probA !== probB) {
              winnerId = probA > probB ? teamA.id : teamB.id;
            } else {
              winnerId = teamA.rating >= teamB.rating ? teamA.id : teamB.id;
            }
          }

          const diff = teamA.rating - teamB.rating;
          let goalsA = Math.round(1.35 * Math.pow(10, diff / 1600));
          let goalsB = Math.round(1.35 * Math.pow(10, -diff / 1600));
          if (goalsA === goalsB) {
            if (winnerId === teamA.id) goalsA++; else goalsB++;
          }

          mostLikelyBracket['Round of 32'].push({
            teamA: { id: teamA.id, name: teamA.name, flag: teamA.flag, rating: teamA.rating },
            teamB: { id: teamB.id, name: teamB.name, flag: teamB.flag, rating: teamB.rating },
            goalsA, goalsB, pens: false, winnerId
          });
        }

        // Step 2: Establish progression matches for later rounds based on stats
        const roundsList = [
          { current: 'Round of 32', next: 'Round of 16', reachStage: 'Quarterfinals' },
          { current: 'Round of 16', next: 'Quarterfinals', reachStage: 'Semifinals' },
          { current: 'Quarterfinals', next: 'Semifinals', reachStage: 'Final' },
          { current: 'Semifinals', next: 'Final', reachStage: 'Winner' }
        ];

        roundsList.forEach(r => {
          const matches = mostLikelyBracket[r.current];
          for (let i = 0; i < matches.length; i += 2) {
            const wAId = matches[i].winnerId;
            const wBId = matches[i+1].winnerId;

            const teamA = findTeam(wAId);
            const teamB = findTeam(wBId);

            const winA = stats.teamStages[teamA.id]['Winner'];
            const winB = stats.teamStages[teamB.id]['Winner'];
            let winnerId = teamA.id;
            if (winA !== winB) {
              winnerId = winA > winB ? teamA.id : teamB.id;
            } else {
              const countA = stats.teamStages[teamA.id][r.reachStage];
              const countB = stats.teamStages[teamB.id][r.reachStage];
              if (countA !== countB) {
                winnerId = countA > countB ? teamA.id : teamB.id;
              } else {
                winnerId = teamA.rating >= teamB.rating ? teamA.id : teamB.id;
              }
            }

            const diff = teamA.rating - teamB.rating;
            let goalsA = Math.round(1.35 * Math.pow(10, diff / 1600));
            let goalsB = Math.round(1.35 * Math.pow(10, -diff / 1600));
            if (goalsA === goalsB) {
              if (winnerId === teamA.id) goalsA++; else goalsB++;
            }

            mostLikelyBracket[r.next].push({
              teamA: { id: teamA.id, name: teamA.name, flag: teamA.flag, rating: teamA.rating },
              teamB: { id: teamB.id, name: teamB.name, flag: teamB.flag, rating: teamB.rating },
              goalsA, goalsB, pens: false, winnerId
            });
          }
        });

        // Step 3: Set absolute winner
        const finalMatch = mostLikelyBracket['Final'][0];
        if (finalMatch) {
          const champ = findTeam(finalMatch.winnerId);
          mostLikelyBracket['Winner'] = { id: champ.id, name: champ.name, flag: champ.flag, rating: champ.rating };
        }

        onComplete(probabilities, mostLikelyBracket);
      }
    }

    setTimeout(processChunk, 0);
  }
};
