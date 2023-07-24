export class TableDisplayDate {
  constructor(private date: Date) {}
  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") {
      return this.date[Symbol.toPrimitive]("number");
    }
    return null;
  }

  toString() {
    return this.date.toLocaleString();
  }
}
