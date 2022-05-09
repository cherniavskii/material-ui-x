import * as React from 'react';
import PropTypes from 'prop-types';
import {
  GridToolbarContainer,
  GridToolbarContainerProps,
} from '../containers/GridToolbarContainer';
import { GridToolbarColumnsButton } from './GridToolbarColumnsButton';
import { GridToolbarDensitySelector } from './GridToolbarDensitySelector';
import { GridToolbarFilterButton } from './GridToolbarFilterButton';
import { GridToolbarExport, GridToolbarExportProps } from './GridToolbarExport';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

export interface GridToolbarProps
  extends GridToolbarContainerProps,
    Omit<GridToolbarExportProps, 'color'> {}

const GridToolbar = React.forwardRef<HTMLDivElement, GridToolbarProps>(function GridToolbar(
  props,
  ref,
) {
  // TODO v6: think about where export option should be passed.
  // from componentProps={{ toolbarExport: { ...exportOption} }} seems to be more appropriate
  const { className, csvOptions, printOptions, excelOptions, ...other } = props;
  const rootProps = useGridRootProps();

  if (
    rootProps.disableColumnFilter &&
    rootProps.disableColumnSelector &&
    rootProps.disableDensitySelector
  ) {
    return null;
  }

  return (
    <GridToolbarContainer ref={ref} {...other}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={csvOptions}
        printOptions={printOptions}
        // TODO: remove the reference to excelOptions in community package
        excelOptions={excelOptions}
      />
    </GridToolbarContainer>
  );
});

GridToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { GridToolbar };
