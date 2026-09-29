import { useState } from "react";
import { Link } from "react-router";
import { Modal } from "../components/Modal";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { useActivities } from "../hooks/useActivities";
import {
  describeActivityType,
  formatActivityTimestamp,
  sortActivitiesNewestFirst,
} from "../utils/activity";

function Activity() {
  const { activities, clearActivities } = useActivities();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const orderedActivities = sortActivitiesNewestFirst(activities);

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
        <PageActions>
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            disabled={orderedActivities.length === 0}
          >
            Clear activity log
          </button>
        </PageActions>
      </PageHeader>

      {orderedActivities.length === 0 ? (
        <p>No activity recorded yet.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {orderedActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{describeActivityType(activity.type)}</td>
                <td>{activity.message}</td>
                <td>{formatActivityTimestamp(activity.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p>
        <Link to="/">Back to dashboard</Link>
      </p>

      {isClearModalOpen && (
        <Modal
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={handleConfirmClear}
        >
          <h2>Clear activity log</h2>
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
