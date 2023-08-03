import { getPlayerPositionIndex, getPlayerScoreIndex } from "../src/PlayMatch/getPlayerPositions"
import { OtherPlayer, PlayerScoringHistory } from "../src/generatedTypes"

function getOtherPlayer(id:string):OtherPlayer{
    return {
        discarded:false,
        id,
        playerScoringHistory:undefined as unknown as PlayerScoringHistory,
        ready:false
    }
}
describe("player positions functions", () => {
    describe("getPlayerPositionIndex", () => {
        it("should return 0 for me", () => {
            const myPositionIndex = getPlayerPositionIndex("me", "me", [getOtherPlayer("other")]);
            expect(myPositionIndex).toBe(0);
        });
        it("should return otherPlayers in order", () => {
            const otherPlayerPositionIndex = getPlayerPositionIndex("other", "me",[getOtherPlayer("another"), getOtherPlayer("other")]);
            expect(otherPlayerPositionIndex).toBe(2);
        });
    });

    describe("getPlayerScoreIndex", () => {
        describe("when not team game it should return the player position index", () => {
            it("should return 0 for me", () => {
                const playerScoreIndex = getPlayerScoreIndex("me", "me", [getOtherPlayer("other")]);
                expect(playerScoreIndex).toBe(0);
            });
            it("should return otherPlayers in order", () => {
                const otherPlayerScoreIndex = getPlayerScoreIndex("other", "me",[getOtherPlayer("another"), getOtherPlayer("other")]);
                expect(otherPlayerScoreIndex).toBe(2);
            });
        });
        describe("team game", () => {
            const otherPlayers =  [getOtherPlayer("otherteam1"), getOtherPlayer("teammate"), getOtherPlayer("otherteam2")];
            const getTeamPlayerScoreIndex = (playerId:string) => getPlayerScoreIndex(playerId, "me", otherPlayers);
            it("should return 0 for me", () => {
                const playerScoreIndex = getTeamPlayerScoreIndex("me");
                expect(playerScoreIndex).toBe(0);
            });
            it("should return 0 for my team mate", () => {
                const playerScoreIndex = getTeamPlayerScoreIndex("teammate");
                expect(playerScoreIndex).toBe(0);
            });
            it("should return 1 for other team 1", () => {
                const playerScoreIndex = getTeamPlayerScoreIndex("otherteam1");
                expect(playerScoreIndex).toBe(1);
            });
            it("should return 1 for other team 2", () => {
                const playerScoreIndex = getTeamPlayerScoreIndex("otherteam2");
                expect(playerScoreIndex).toBe(1);
            });
        })
    });
})