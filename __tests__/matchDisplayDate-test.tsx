import { TableDisplayDate } from "../src/TableDisplayDate";

describe("MatchDisplayDate", () => {
  it("works with equality operators", () => {
    var earlier = new TableDisplayDate(new Date("20 December 2019 14:48"));
    var later = new TableDisplayDate(new Date("20 December 2019 14:49"));
    expect(earlier < later).toBe(true);
  });
});
