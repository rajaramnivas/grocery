// Image URL utilities for products and shopping lists

/**
 * Get the best image URL for a product
 * Prioritizes: imageUrl > image > fallback
 */
export const getProductImageUrl = (product) => {
  if (!product) return getPlaceholderUrl('product');
  
  const imageUrl = product.imageUrl || product.image;
  return imageUrl || getPlaceholderUrl('product', product.name);
};

/**
 * Get the best icon URL for a shopping list
 * Prioritizes: iconUrl > emoji
 */
export const getListIconUrl = (list) => {
  if (!list) return '🛍️';
  
  // If iconUrl exists, return as image
  if (list.iconUrl) {
    return list.iconUrl;
  }
  
  // Otherwise return emoji
  return list.icon || '🛍️';
};

/**
 * Build a simple inline SVG placeholder as a data URI (no network request)
 */
const buildPlaceholderSvg = (width, height, label) => {
  const safeLabel = (label || 'Product').slice(0, 18);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    "<rect width='100%' height='100%' fill='%23e5e7eb'/>" +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'>${safeLabel}</text>` +
    '</svg>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Get placeholder image URL by type (uses local SVG data URIs)
 */
export const getPlaceholderUrl = (type = 'product', name = '') => {
  const label = name && typeof name === 'string' ? name : 'Product';

  const placeholders = {
    product: buildPlaceholderSvg(300, 200, label || 'Product'),
    icon: buildPlaceholderSvg(100, 100, 'Icon'),
    list: buildPlaceholderSvg(150, 150, 'List'),
    user: buildPlaceholderSvg(100, 100, 'User'),
  };

  return placeholders[type] || placeholders.product;
};

/**
 * Validate if a URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get image with fallback
 * Returns valid URL or placeholder
 */
export const getFallbackImageUrl = (imageUrlOrName, fallbackName = '') => {
  const label = fallbackName || imageUrlOrName || 'Product';
  // Always return a safe inline SVG placeholder; do not retry the failing URL
  return getPlaceholderUrl('product', label);
};

/**
 * Popular free image sources for e-commerce
 */
export const imageSourceGuide = {
  'Unsplash': 'https://unsplash.com/ - High quality free images',
  'Pexels': 'https://www.pexels.com/ - Free stock photos',
  'Pixabay': 'https://pixabay.com/ - Free images and videos',
  'Placeholder': 'https://dummyimage.com/300x200/000000/CCCCCC?text=Product',
  'Lorem Picsum': 'https://picsum.photos/300/200 - Random images',
  'DummyImage': 'https://dummyimage.com/300x200/000000/CCCCCC?text=Product',
};

const imageUtils = {
  getProductImageUrl,
  getListIconUrl,
  getPlaceholderUrl,
  isValidImageUrl,
  getFallbackImageUrl,
  imageSourceGuide,
};

export default imageUtils;
