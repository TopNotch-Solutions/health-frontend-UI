/**
 * Shared MUI DataGrid layout/scroll styles.
 *
 * Avoid wrapping DataGrid in a parent with overflowX/overflow:auto —
 * that breaks virtualization and makes scrolling feel sticky/janky.
 * Horizontal scroll belongs on .MuiDataGrid-virtualScroller.
 */

export const DATA_GRID_CONTAINER_SX = {
  height: 600,
  width: '100%',
  minWidth: 0,
  // Do NOT set overflowX here — DataGrid owns scrolling.
};

export const DATA_GRID_SX = {
  height: '100%',
  width: '100%',
  border: 'none',
  '& .MuiDataGrid-main': {
    // Keep overflow on the virtual scroller only
    overflow: 'hidden',
  },
  '& .MuiDataGrid-virtualScroller': {
    // Stop wheel/trackpad scroll from chaining into the page shell
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'background.paper',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(22, 116, 187, 0.04)',
  },
};

/** Merge page-specific sx with the shared scroll/layout defaults. */
export function mergeDataGridSx(...parts) {
  return Object.assign({}, DATA_GRID_SX, ...parts.filter(Boolean));
}
