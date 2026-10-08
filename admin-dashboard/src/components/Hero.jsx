import { Link } from "react-router";
import { Illustration } from "./Illustration";

// The welcome banner. The only element in the app allowed to use the hero
// gradient, and the only place display type is allowed to be this large.
//
// `title` is the page's h1, so the page does not also render a PageHeader
// underneath it — two competing headings on one screen is worse than one.
//
// The media slot carries a real illustration rather than a placeholder frame.
// It sits on a white card, not directly on the gradient: the artwork's own
// ground is near-white, so a card is the only surround that lets it sit flush
// instead of showing the artwork's rectangle against the purple.
//
// The card is a real wrapper element. Passing `hero__media` as the image's own
// className put the card and the artwork on ONE element, so the card's fixed
// box and the artwork's intrinsic size fought over the same box: the card's
// `height` lost to the generic `.illustration { height: auto }` declared later
// in the file, and the `<img>`'s 1892px intrinsic width became the flex basis
// that starved the text column to 0px.
function Hero({ title, message, children }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__message">{message}</p>
        {children}
      </div>
      <div className="hero__media">
        <Illustration
          src="/illustrations/medical-consultation.svg"
          alt="Illustration of a doctor consulting with a patient in a hospital ward"
          width={1892}
          height={1364}
        />
      </div>
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
