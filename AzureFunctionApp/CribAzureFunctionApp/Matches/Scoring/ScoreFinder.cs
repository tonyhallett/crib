#nullable enable

using CribAzureFunctionApp.Matches.State;
using CribAzureFunctionApp.Matches.Utilities;

namespace CribAzureFunctionApp.Matches.Scoring
{
    public class ScoreFinder : IScoreFinder
    {
        public Score Find(CribMatch match, string playerId)
        {
            var players = match.GetPlayers();
            var playerIndex = players.FindIndex(player => player.Id == playerId);
            if (players.Count == 4)
            {
                playerIndex = GetTeamIndex(playerIndex);
            }
            var score = match.Scores[playerIndex];
            return score;
        }

        private static int GetTeamIndex(int playerIndex)
        {
            return playerIndex == 0 | playerIndex == 2 ? 0 : 1;
        }
    }
}
