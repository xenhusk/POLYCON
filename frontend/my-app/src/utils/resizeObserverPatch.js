const patchResizeObserver = () => {
  const originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class PatchedResizeObserver extends originalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        // Prevent the error by not calling the callback if the document is hidden
        if (!document.hidden) {
          window.requestAnimationFrame(() => {
            callback(entries, observer);
          });
        }
      });
    }
  };
};

export default patchResizeObserver;
