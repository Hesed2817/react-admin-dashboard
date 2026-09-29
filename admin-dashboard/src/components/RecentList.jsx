import { MediaPlaceholder } from "./MediaPlaceholder";

// A short list of people, each with a media slot for a photo this app does not
// have. The photo is a placeholder, so the name and the meta line carry the
// whole meaning — the avatar is never the only thing identifying a row.
function RecentList({ title, items, emptyMessage, footer }) {
  return (
    <section className="card recent-list">
      <h2 className="recent-list__title">{title}</h2>

      {items.length === 0 ? (
        <p className="field-hint">{emptyMessage}</p>
      ) : (
        <ul className="recent-list__items">
          {items.map((item) => (
            <li className="recent-list__item" key={item.id}>
              <MediaPlaceholder
                kind="avatar"
                variant="inline"
                label={`${item.name} photo placeholder`}
              />
              <span className="recent-list__text">
                <span className="recent-list__name">{item.name}</span>
                <span className="recent-list__meta">{item.meta}</span>
              </span>
              {item.trailing}
            </li>
          ))}
        </ul>
      )}

      {footer}
    </section>
  );
}

export { RecentList };
