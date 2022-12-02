import { GridFilterInputDate } from '../components/panel/filterPanel/GridFilterInputDate';
import { GridFilterItem } from '../models/gridFilterItem';
import { GridFilterOperator } from '../models/gridFilterOperator';
import { GridCellParams } from '../models/params/gridCellParams';

function buildApplyFilterFn(
  filterItem: GridFilterItem,
  compareFn: (value1: number, value2: number) => boolean,
  showTime?: boolean,
  keepHours?: boolean,
) {
  if (!filterItem.value) {
    return null;
  }

  const date = new Date(filterItem.value);
  if (showTime) {
    date.setSeconds(0, 0);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  const time = date.getTime();

  return ({ value }: GridCellParams<string | number | Date, any, any>): boolean => {
    if (!value) {
      return false;
    }

    const valueAsDate = value instanceof Date ? value : new Date(value.toString());
    if (keepHours) {
      return compareFn(valueAsDate.getTime(), time);
    }

    // Make a copy of the date to not reset the hours in the original object
    const dateCopy = value instanceof Date ? new Date(valueAsDate) : valueAsDate;
    const timeToCompare = dateCopy.setHours(
      showTime ? valueAsDate.getHours() : 0,
      showTime ? valueAsDate.getMinutes() : 0,
      0,
      0,
    );
    return compareFn(timeToCompare, time);
  };
}

export const getGridDateOperators = (
  showTime?: boolean,
): GridFilterOperator<any, string | Date, any>[] => [
  {
    value: 'is',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(filterItem, (value1, value2) => value1 === value2, showTime);
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'not',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(filterItem, (value1, value2) => value1 !== value2, showTime);
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'after',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(filterItem, (value1, value2) => value1 > value2, showTime);
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'onOrAfter',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(filterItem, (value1, value2) => value1 >= value2, showTime);
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'before',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(
        filterItem,
        (value1, value2) => value1 < value2,
        showTime,
        !showTime,
      );
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'onOrBefore',
    getApplyFilterFn: (filterItem) => {
      return buildApplyFilterFn(filterItem, (value1, value2) => value1 <= value2, showTime);
    },
    InputComponent: GridFilterInputDate,
    InputComponentProps: { type: showTime ? 'datetime-local' : 'date' },
  },
  {
    value: 'isEmpty',
    getApplyFilterFn: () => {
      return ({ value }): boolean => {
        return value == null;
      };
    },
    requiresFilterValue: false,
  },
  {
    value: 'isNotEmpty',
    getApplyFilterFn: () => {
      return ({ value }): boolean => {
        return value != null;
      };
    },
    requiresFilterValue: false,
  },
];
