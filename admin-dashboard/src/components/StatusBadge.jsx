import {
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  STATUS_DISCHARGED,
  STATUS_PENDING,
} from "../constants/statuses";

// Four states, four distinct hues. Colour is never the only signal: every badge
// renders its status as text, and each carries a filled dot as a second cue.
//
// Discharged is its own colour (electric blue) and is now visually distinct
// from Inactive, which is a neutral grey. Inactive is deliberately not red —
// an inactive staff account is not an error condition.
const STATUS_CLASS_NAMES = {
  [STATUS_ACTIVE]: "status-badge status-badge--active",
  [STATUS_DISCHARGED]: "status-badge status-badge--discharged",
  [STATUS_PENDING]: "status-badge status-badge--pending",
  [STATUS_INACTIVE]: "status-badge status-badge--inactive",
};

const FALLBACK_CLASS = "status-badge status-badge--inactive";

function StatusBadge({ status }) {
  const isKnown = Object.prototype.hasOwnProperty.call(STATUS_CLASS_NAMES, status);
  const className = isKnown ? STATUS_CLASS_NAMES[status] : FALLBACK_CLASS;
  const label = isKnown ? status : `Unknown (${status})`;

  return <span className={className}>{label}</span>;
}

export { StatusBadge };
