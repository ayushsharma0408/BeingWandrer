export const FilterSkeleton = (): JSX.Element => {
  return (
    <aside className="tv-filters" aria-hidden="true">
      <div className="tv-filter-card">
        <span className="skel-bone skel-line skel-md" />
        <span className="skel-bone skel-line" />
        <span className="skel-bone skel-line" />
        <span className="skel-bone skel-line skel-sm" />
      </div>
      <div className="tv-filter-card">
        <span className="skel-bone skel-line skel-md" />
        <span className="skel-bone skel-line" />
        <span className="skel-bone skel-line" />
      </div>
      <div className="tv-filter-card">
        <span className="skel-bone skel-line skel-md" />
        <span className="skel-bone skel-bar" />
      </div>
    </aside>
  );
};
