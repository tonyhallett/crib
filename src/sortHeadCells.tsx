import { HeadCell } from "./SortableTable";

export function sortHeadCells<T>(
  propertyNames: (keyof T)[],
  headCells: HeadCell<T>[]
) {
  return propertyNames.map((propertyName) => {
    const headCell = headCells.find(
      (headCell) => headCell.property === propertyName
    );
    if (!headCell) {
      throw new Error(
        "Could not find head cell for property " + propertyName.toString()
      );
    }
    return headCell;
  });
}
