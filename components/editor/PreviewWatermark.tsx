// A faint tiled "InviteForYou" over the editor's preview, so an unpaid
// design can't be passed off as a finished invite. It sits above the
// preview, not inside the invitation, so the published page (which never
// renders this) is clean after purchase.
const TILE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="260">` +
    `<text x="180" y="130" text-anchor="middle" transform="rotate(-24 180 130)" ` +
    `font-family="Georgia, serif" font-size="20" font-weight="700" letter-spacing="2" ` +
    `fill="#808080" fill-opacity="0.035">InviteForYou</text></svg>`
);

export default function PreviewWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30"
      style={{ backgroundImage: `url("data:image/svg+xml,${TILE}")`, backgroundSize: "360px 260px" }}
    />
  );
}
