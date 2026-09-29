const ICON_PATHS = {
  search: (
    <>
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l4 4" />
    </>
  ),
  plus: <path d="M8 3v10M3 8h10" />,
  view: (
    <>
      <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
  edit: <path d="M11.5 2.5l2 2L5 13l-2.5.5L3 11l8.5-8.5z" />,
  trash: (
    <>
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" />
    </>
  ),
  star: <path d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2 4.4 13l.7-4L2.2 6.3l4-.6L8 2z" />,
  starFilled: (
    <path
      d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2 4.4 13l.7-4L2.2 6.3l4-.6L8 2z"
      fill="currentColor"
      stroke="none"
    />
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
  sort: <path d="M5 6.5L8 3.5l3 3M5 9.5l3 3 3-3" />,
  inbox: (
    <>
      <path d="M2 9.5h3.5l1 2h3l1-2H14" />
      <path d="M2 9.5l2-6h8l2 6v3.5H2V9.5z" />
    </>
  ),
  users: (
    <>
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1.5 13.5a4.5 4.5 0 0 1 9 0" />
      <path d="M10.5 3a2.5 2.5 0 0 1 0 5" />
      <path d="M12 13.5a4.5 4.5 0 0 0-1.4-3.2" />
    </>
  ),
  patient: (
    <>
      <circle cx="6.5" cy="5" r="2.5" />
      <path d="M2 13.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12.5 8.5v3M11 10h3" />
    </>
  ),
  chart: (
    <>
      <path d="M2 13.5h11" />
      <path d="M4 13.5V8" />
      <path d="M7.5 13.5V3.5" />
      <path d="M11 13.5v-4" />
    </>
  ),
  history: (
    <>
      <path d="M2.5 8a5.5 5.5 0 1 0 1.7-4" />
      <path d="M1.5 2v3.5H5" />
      <path d="M8 5.2V8l2 1.4" />
    </>
  ),
};

// One set, 16px viewBox, 1.5px stroke, no fills except the filled star.
// Always decorative: it is rendered beside a real text label, so callers
// mark it aria-hidden. An icon never carries meaning on its own.
function Icon({ name, className = "" }) {
  const path = ICON_PATHS[name];

  if (!path) {
    return null;
  }

  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}

export { Icon };
