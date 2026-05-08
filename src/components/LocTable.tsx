import React, { useEffect, useMemo, useState } from 'react';
import { LocationItem } from '../types';

type LocTableProps = {
  items: LocationItem[];
  onDeleteSelected: () => void;
  onToggleChecked: (index: number) => void;
  canDelete: boolean;
  isDarkMode: boolean;
};

function LocTable({
  items,
  onDeleteSelected,
  onToggleChecked,
  canDelete,
  isDarkMode,
}: LocTableProps): React.ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items]);

  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="padCom">
      <h3>Location Table</h3>
      <button
        className={`btn mb-3 ${isDarkMode ? 'btn-outline-light' : 'btn-primary'}`}
        style={{ textAlign: 'left' }}
        type="button"
        hidden={!canDelete}
        onClick={onDeleteSelected}
      >
        Delete Selected
      </button>

      <table className={`table table-bordered table-striped ${isDarkMode ? 'table-dark' : ''}`}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Place</th>
            <th>TimeZone</th>
            <th>Local Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="text-center" colSpan={4}>
                No locations available.
              </td>
            </tr>
          ) : (
            rows.map((row: LocationItem) => {
              const absoluteIndex = items.indexOf(row);
              return (
                <tr key={`${row.locName}-${absoluteIndex}`}>
                  <td>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => onToggleChecked(absoluteIndex)}
                    />
                  </td>
                  <td>{row.locName}</td>
                  <td>{row.timeZoneName}</td>
                  <td>{row.localTimeStr}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <nav aria-label="Location table pagination">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link theme-aware-page-link" type="button" onClick={() => goToPage(1)}>
              First
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link theme-aware-page-link"
              type="button"
              onClick={() => goToPage(currentPage - 1)}
            >
              Prev
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link theme-aware-page-link">
              {currentPage} / {totalPages}
            </span>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link theme-aware-page-link"
              type="button"
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link theme-aware-page-link"
              type="button"
              onClick={() => goToPage(totalPages)}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default LocTable;
