type Source = { src: string; srcSet?: string; sizes?: string };

const cache = new Map<string, Promise<void>>();

/**
 * Fetch and decode an image off-screen. Uses the same src/srcSet/sizes the
 * <img> will render with, so the browser reuses the decoded bitmap and the
 * swap is instant. Resolves (never rejects) so a broken image can't stall
 * the slideshow.
 */
export function preloadImage({ src, srcSet, sizes }: Source): Promise<void> {
  const key = srcSet || src;
  let pending = cache.get(key);
  if (!pending) {
    pending = new Promise<void>((resolve) => {
      const img = new window.Image();
      img.decoding = "async";
      if (sizes) img.sizes = sizes;
      if (srcSet) img.srcset = srcSet;
      img.src = src;
      img.decode().then(
        () => resolve(),
        () => resolve(),
      );
    });
    cache.set(key, pending);
  }
  return pending;
}
