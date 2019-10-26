const picks = draft.draftDetail.picks;
const getStatsForPlayer = function (playerId: number) {
    let nbaPlrs = nbaPlayers.players;
    for (let i=0; nbaPlrs.length; i++) {
        let curPlayer = nbaPlrs[i]
        if (playerId != curPlayer.id) continue;
        let playerToSearchProjectionStats = curPlayer.player.stats[1];
        return {
            'pts': playerToSearchProjectionStats.stats[statsMap[0]],
            'reb': playerToSearchProjectionStats.stats[statsMap[1]],
            'ast': playerToSearchProjectionStats.stats[statsMap[2]],
            'fga': playerToSearchProjectionStats.stats[statsMap[3]],
            'fgm': playerToSearchProjectionStats.stats[statsMap[4]],
            'thrpm': playerToSearchProjectionStats.stats[statsMap[5]],
            'to': playerToSearchProjectionStats.stats[statsMap[6]],
            'blk': playerToSearchProjectionStats.stats[statsMap[7]],
            'stl': playerToSearchProjectionStats.stats[statsMap[8]],
            'fta': playerToSearchProjectionStats.stats[statsMap[9]],
            'ftm': playerToSearchProjectionStats.stats[statsMap[10]]
        }
    }
}
const updateStatsForTeam = function (teamId: number, statsToAdd) {
    sumOfStatsPerTeam[teamsMap[teamId]].pts += ((isNaN(statsToAdd.pts)) ? 0 : statsToAdd.pts);
    sumOfStatsPerTeam[teamsMap[teamId]].reb += ((isNaN(statsToAdd.reb)) ? 0 : statsToAdd.reb);
    sumOfStatsPerTeam[teamsMap[teamId]].ast += ((isNaN(statsToAdd.ast)) ? 0 : statsToAdd.ast);
    sumOfStatsPerTeam[teamsMap[teamId]].blk += ((isNaN(statsToAdd.blk)) ? 0 : statsToAdd.blk);
    sumOfStatsPerTeam[teamsMap[teamId]].stl += ((isNaN(statsToAdd.stl)) ? 0 : statsToAdd.stl);
    sumOfStatsPerTeam[teamsMap[teamId]].to += ((isNaN(statsToAdd.to)) ? 0 : statsToAdd.to);
    sumOfStatsPerTeam[teamsMap[teamId]].fga += ((isNaN(statsToAdd.fga)) ? 0 : statsToAdd.fga);
    sumOfStatsPerTeam[teamsMap[teamId]].fgm += ((isNaN(statsToAdd.fgm)) ? 0 : statsToAdd.fgm);
    sumOfStatsPerTeam[teamsMap[teamId]].thrpm += ((isNaN(statsToAdd.thrpm)) ? 0 : statsToAdd.thrpm);
    sumOfStatsPerTeam[teamsMap[teamId]].fta += ((isNaN(statsToAdd.fta)) ? 0 : statsToAdd.fta);
    sumOfStatsPerTeam[teamsMap[teamId]].ftm += ((isNaN(statsToAdd.ftm)) ? 0 : statsToAdd.ftm);
}
const calculateFGandFTPerForLeagueTeams = function (sumOfStatsPerTeam) {
    for (let sum of sumOfStatsPerTeam) {
        sum.ftper = sum.fta / sum.ftm;
        sum.fgper = sum.fga / sum.fgm;
    }
    return;
} 
const calculatePointsPerStatForLeagueTeams = function () {
    for (let category=0; category<categoriesCount; category++) {
        let categoryToRank = new Array();
        for(let team=0; team<teamsCount; team++){
            //turnovers are calculated a different way. The less turnovers a team has, the more points the team gets in the league.
            if (statsToCalculate[category] == "to") { categoryToRank.push(1 / sumOfStatsPerTeam[team][statsToCalculate[category]]); continue; } 
            categoryToRank.push(sumOfStatsPerTeam[team][statsToCalculate[category]]);
        }
        let sortedArr = categoryToRank.slice().sort(function (a, b) { return b - a });
        let rankedArr = categoryToRank.slice().map(function (v) { return teamsCount - (sortedArr.indexOf(v) + 1)});
        for (let team=0; team<teamsCount; team++){
            pointsPerStatPerTeam[team][statsToCalculate[category]] = rankedArr[team];
        }    
    }
}

const calculateOverallScoreForTeam = function (pointsOfTeam) {
    let sum = 0;
    for (let category=0; category<categoriesCount; category++){
        sum += pointsOfTeam[statsToCalculate[category]];
    }
    return sum;
}

const calculateOverallScoreForTeams = function (pointsPerStatPerTeam) {
    let scores = new Array();
    for (let i=0; i<teamsCount; i++) {
        scores.push(calculateOverallScoreForTeam(pointsPerStatPerTeam[i]))
    }
    return scores;
}

const findOverallTeamPosition = function(overallScoreForTeams) {
        let sortedArr = overallScoreForTeams.slice().sort(function (a, b) { return b - a });
        let rankedArr = overallScoreForTeams.slice().map(function (v) { return sortedArr.indexOf(v) + 1 });
        return rankedArr;
}

const printBeautifiedResultsInConsole = function () {
    for (let team=0; team<teamsCount; team++){
        let teamInfo = draft.teams[team];
        let teamName = teamInfo.location + " " + teamInfo.nickname + " (" + teamInfo.abbrev + ")";
        let teamResults = JSON.stringify(pointsPerStatPerTeam[team])
        let overallScoreForTeam = overallScoreForTeams[team]; 
        console.log("Team: " + teamName + ", Position: " + overallTeamPosition[team] + ", Overall Score: " + overallScoreForTeam + ", In Depth: " + teamResults);
    }
}

//draft parsing and result calculation and printing.

for (let pick of picks) {
    let currentStats = getStatsForPlayer(pick.playerId);
    updateStatsForTeam(pick.teamId, currentStats);
}
calculateFGandFTPerForLeagueTeams(sumOfStatsPerTeam);
calculatePointsPerStatForLeagueTeams();
let overallScoreForTeams = calculateOverallScoreForTeams(pointsPerStatPerTeam);
let overallTeamPosition = findOverallTeamPosition(overallScoreForTeams);
printBeautifiedResultsInConsole();
