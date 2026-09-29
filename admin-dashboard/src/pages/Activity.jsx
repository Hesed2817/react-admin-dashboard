import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { usePagination } from "../hooks/usePagination";
import { TableScroll } from "../components/Table";
import { useActivities } from "../hooks/useActivities";
import {
  describeActivityType,
  formatActivityTimestamp,
  sortActivitiesNewestFirst,
} from "../utils/activity";

const PAGE_SIZE = 25;

function Activity() {
  const { activities, clearActivities } = useActivities();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const orderedActivities = useMemo(
    () => sortActivitiesNewestFirst(activities),
    [activities],
  );

  const {
    visibleItems,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setPage,
  } = usePagination(orderedActivities, PAGE_SIZE);

  function handleConfirmClear() {
    clearActivities();
    setIsClearModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Every recorded change, newest first"
      >
        <PageActions label="Activity actions">
          <div className="page-actions__primary">
            <Button
              variant="danger"
              onClick={() => setIsClearModalOpen(true)}
              disabled={orderedActivities.length === 0}
            >
              Clear activity log
            </Button>
          </div>
        </PageActions>
      </PageHeader>

      {orderedActivities.length === 0 ? (
        <EmptyState
          title="No activity recorded yet."
          message="Creating, editing or deleting a record adds an entry here."
          icon="inbox"
        />
      ) : (
        <>
          <TableScroll label="Activity log">
            <table className="data-table">
              <caption>
                {totalItems} recorded {totalItems === 1 ? "entry" : "entries"},
                newest first
              </caption>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Description</th>
                  <th scope="col">When</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((activity) => (
                  <tr key={activity.id}>
                    <td data-label="Type">
                      <span className="status-badge status-inactive">
                        {describeActivityType(activity.type)}
                      </span>
                    </td>
                    <td data-label="Description">{activity.message}</td>
                    <td data-label="When" className="cell-muted">
                      {formatActivityTimestamp(activity.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            itemNoun="entries"
          />
        </>
      )}

      <p className="section__footer">
        <Link to="/">Back to dashboard</Link>
      </p>

      {isClearModalOpen && (
        <Modal
          title="Clear activity log"
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={handleConfirmClear}
          confirmLabel="Clear log"
          confirmVariant="danger"
        >
          <p>
            This permanently deletes all {orderedActivities.length} recorded
            entries. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export { Activity };
