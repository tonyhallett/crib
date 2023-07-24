import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
  Paper,
  TableContainer,
  Table,
  TableBody,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useState } from "react";

type Order = "asc" | "desc";

interface EnhancedTableHeadProps<T> {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string | undefined;
  headCells: HeadCell<T>[];
}
export interface HeadCell<T> {
  disablePadding: boolean;
  property?: keyof T;
  label: string;
  numeric: boolean;
}
function SortableTableHead<T>(props: EnhancedTableHeadProps<T>) {
  const { order, orderBy, onRequestSort, headCells } = props;
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell, index) => (
          <TableCell
            key={index} // as not able to reorder columns
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.property ? order : false}
          >
            {headCell.property ? (
              <TableSortLabel
                active={orderBy === headCell.property}
                direction={orderBy === headCell.property ? order : "asc"}
                onClick={createSortHandler(headCell.property)}
              >
                {headCell.label}
                {orderBy === headCell.property ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface SortableTableProps<T> {
  headCells: HeadCell<T>[];
  rows: TableRowData<T>[];
  initialOrderBy: keyof T;
  initialOrder?: Order;
  propertyNames: (keyof T)[];
}

export interface TableRowData<T> {
  key: string;
  value: T;
  additionalElements?: JSX.Element[];
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  if (a[orderBy] === undefined) {
    return -1;
  }
  if (b[orderBy] === undefined) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function SortableTable<T>(props: SortableTableProps<T>) {
  const [order, setOrder] = useState<Order>(props.initialOrder || "asc");
  const [orderBy, setOrderBy] = useState<string>(
    props.initialOrderBy as string
  );
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof T
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property as string);
  };
  const comparator = getComparator(order, orderBy);
  const rows = props.rows.slice().sort((a, b) => {
    const aValue = a.value as any;
    const bValue = b.value as any;
    const order = comparator(aValue, bValue);
    return order;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            //size={dense ? 'small' : 'medium'}
          >
            <SortableTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={props.headCells}
            />
            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow tabIndex={-1} key={row.key}>
                    {props.propertyNames.map((propertyName, index) => {
                      let value = row.value[propertyName] as any;
                      if (value === undefined) {
                        value = "";
                      }
                      return (
                        <TableCell key={index} align="left">
                          {value.toString()}
                        </TableCell>
                      );
                    })}
                    {row.additionalElements?.map((element, index) => {
                      return (
                        <TableCell
                          key={index + props.propertyNames.length}
                          align="left"
                        >
                          {element}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// I need to create headCells for each column
// emptty row - probably not
