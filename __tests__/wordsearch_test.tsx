import { getWord } from "../src/wordsearch/getState";

describe("Word search", () => {
    describe("getWord", () => {
        it("should work with rows", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","D","O","G","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:1,col:3}});
            expect(word).toEqual("DOG");
        });
        it("should work with rows in reverse", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","G","O","D","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:1,col:3}});
            expect(word).toEqual("DOG");
        });
        it("should work with columns", () => {
            const grid = [
                ["X","X"],
                ["X","D"],
                ["X","O"],
                ["X","G"],
                ["X","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:3,col:1}});
            expect(word).toEqual("DOG");
        });

        it("should work with columns in reverse", () => {
            const grid = [
                ["X","X"],
                ["X","G"],
                ["X","O"],
                ["X","D"],
                ["X","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:3,col:1}});
            expect(word).toEqual("DOG");
        });

        it("should work with diagonals", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","D","X","X","X"],
                ["X","X","O","X","X"],
                ["X","X","X","G","X"],
                ["X", "X", "X", "X","X"],
            ]
            const word = getWord(grid, {start:{row:1,col:1},end:{row:3,col:3}});
            expect(word).toEqual("DOG");
        });

        it("should work with diagonals in reverse", () => {
            const grid = [
                ["X", "X", "X", "X","X"],
                ["X","G","X","X","X"],
                ["X","X","O","X","X"],
                ["X","X","X","D","X"],
                ["X", "X", "X", "X","X"],
            ]
            const word = getWord(grid, {end:{row:1,col:1},start:{row:3,col:3}});
            expect(word).toEqual("DOG");
        })
    });

    describe("clicked letter", () => {
        describe("no selected letter", () => {

        });

        describe("selected letter", () => {
            describe("matching word", () => {

            });

            describe("no matching word", () => {

            });
        })
    })
});