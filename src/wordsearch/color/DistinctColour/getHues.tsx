export class RootDivision {
  public division: Division | undefined;
  public value: number;
  public constructor(
    private readonly start: number,
    private readonly end: number
  ) {
    this.value = start;
  }
  public divide(): void {
    if (this.division === undefined) {
      this.division = new Division(this.start, this.end);
    } else {
      this.division.divide();
    }
  }

  public get(depth: number): number[] {
    if (depth < 1) {
      throw new Error("depth must be at least 1");
    }
    if (depth == 1) {
      return [this.value];
    }
    return (this.division as Division).get(depth - 1);
  }

  public static red() {
    return new RootDivision(0, 120);
  }
  public static green() {
    return new RootDivision(120, 240);
  }
  public static blue() {
    return new RootDivision(240, 360);
  }
}

class Division {
  public value: number;
  public leftDivision: Division | undefined;
  public rightDivision: Division | undefined;
  constructor(readonly start: number, readonly end: number) {
    this.value = start + (end - start) / 2;
  }
  public divide(): void {
    if (this.leftDivision !== undefined && this.rightDivision !== undefined) {
      this.leftDivision.divide();
      this.rightDivision.divide();
    } else {
      this.leftDivision = new Division(this.start, this.value);
      this.rightDivision = new Division(this.value, this.end);
    }
  }

  public get(depth: number): number[] {
    if (depth < 1) {
      throw new Error("depth must be at least 1");
    }
    if (depth == 1) {
      return [this.value];
    }
    if (this.leftDivision === undefined || this.rightDivision === undefined) {
      throw new Error("not divided");
    }
    return [
      ...this.leftDivision.get(depth - 1),
      ...this.rightDivision.get(depth - 1),
    ];
  }
}

// eslint-disable-next-line complexity
export function getHues(numDivisions: number): number[] {
  if (numDivisions < 1) {
    throw new Error("numDivisions must be at least 1");
  }
  const rootDivisions: RootDivision[] = [
    RootDivision.red(),
    RootDivision.green(),
    RootDivision.blue(),
  ];
  const values: number[] = rootDivisions.map((division) => division.value);
  if (numDivisions === 1) {
    return values;
  }
  for (let i = 1; i < numDivisions; i++) {
    rootDivisions.forEach((division) => division.divide());
  }
  for (let j = 2; j < numDivisions + 1; j++) {
    const depthValues = rootDivisions.map((division) => division.get(j));
    for (let k = 0; k < depthValues[0].length; k++) {
      depthValues.forEach((depthValue) => values.push(depthValue[k]));
    }
  }
  return values;
}
