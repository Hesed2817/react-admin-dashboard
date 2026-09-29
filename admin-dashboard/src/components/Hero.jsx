import { Link } from "react-router";
import { MediaPlaceholder } from "./MediaPlaceholder";

// The welcome banner. The only element in the app allowed to use the hero
// gradient, and the only place display type is allowed to be this large.
//
// `title` is the page's h1, so the page does not also render a PageHeader
// underneath it — two competing headings on one screen is worse than one.
function Hero({ title, message, children }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__message">{message}</p>
        {children}
      </div>
      <MediaPlaceholder
        className="hero__media"
        label="Dashboard illustration placeholder"
      />
    </section>
  );
}

// A real destination for the hero's single call to action. It navigates to the
// page it names; it is not a button-shaped decoration.
function HeroLink({ to, children }) {
  return (
    <Link className="btn btn-hero" to={to}>
      {children}
    </Link>
  );
}

export { Hero, HeroLink };
