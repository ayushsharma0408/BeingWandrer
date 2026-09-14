export const OfferSkeleton = (): JSX.Element => {
  return (
    <article className="tv-offer tv-offer-skel" aria-hidden="true">
      <div className="tv-offer-body">
        <div className="tv-offer-legs">
          <div className="tv-leg">
            <span className="skel-bone skel-logo" />
            <div className="tv-leg-end">
              <span className="skel-bone skel-line skel-sm" />
              <span className="skel-bone skel-line skel-lg" />
              <span className="skel-bone skel-line skel-md" />
            </div>
            <div className="tv-path">
              <span className="skel-bone skel-line skel-md" />
              <div className="tv-path-line" />
              <span className="skel-bone skel-line skel-sm" />
            </div>
            <div className="tv-leg-end tv-leg-end-right">
              <span className="skel-bone skel-line skel-sm" />
              <span className="skel-bone skel-line skel-lg" />
              <span className="skel-bone skel-line skel-md" />
            </div>
          </div>
        </div>
        <div className="tv-offer-fare">
          <span className="skel-bone skel-line skel-price" />
          <span className="skel-bone skel-line skel-sm" />
          <span className="skel-bone skel-book" />
        </div>
      </div>
    </article>
  );
};
