import API from "../axios";

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;

  const apiBase = `${API.defaults.baseURL.replace(/\/+$/, "")}/`;
  const apiRelativePath = imageUrl.replace(/^\/api(?=\/)/, "").replace(/^\/+/, "");
  return new URL(apiRelativePath, apiBase).toString();
};
