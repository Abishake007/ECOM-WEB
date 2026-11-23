export const getDiscountPercentage = (product) => {
  const value = Number(product?.discountPercentage || 0);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
};

export const getSalePrice = (product) => {
  const price = Number(product?.price || 0);
  return Number((price * (100 - getDiscountPercentage(product)) / 100).toFixed(2));
};
