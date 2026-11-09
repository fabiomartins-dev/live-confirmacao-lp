/** Linhas verticais tracejadas do grid editorial (margens + terços). Decorativo. */
export function GridLines() {
  return (
    <div className="grid-frame" aria-hidden="true">
      <i className="gl gl-edge gl-l" />
      <i className="gl gl-mid gl-1" />
      <i className="gl gl-mid gl-2" />
      <i className="gl gl-edge gl-r" />
    </div>
  );
}
