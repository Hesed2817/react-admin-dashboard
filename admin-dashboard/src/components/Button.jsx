// The only button in the app. Three intents: primary, secondary, destructive.
// No fourth "decorative" variant, and no caller passes raw colours.
function Button({
  children,
  variant = "secondary",
  size,
  type = "button",
  className = "",
  ...rest
}) {
  const classes = ["btn", `btn-${variant}`];

  if (size === "sm") classes.push("btn-sm");
  if (size === "lg") classes.push("btn-lg");
  if (className) classes.push(className);

  return (
    <button type={type} className={classes.join(" ")} {...rest}>
      {children}
    </button>
  );
}

export { Button };
