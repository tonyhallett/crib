import { TableDisplayDate } from "../src/TableDisplayDate";

describe("MatchDisplayDate", () => {
  it("works with equality operators", () => {
    const earlier = new TableDisplayDate(new Date("20 December 2019 14:48"));
    const later = new TableDisplayDate(new Date("20 December 2019 14:49"));
    expect(earlier < later).toBe(true);
  });
});
