/** Wikimedia Commons 可商用核桃参考图池 */
export const WALNUT_IMAGE_POOL = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/A_pair_of_walnut_%28Juglans_hopeiensis%29_%28cropped%29.jpg/960px-A_pair_of_walnut_%28Juglans_hopeiensis%29_%28cropped%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/A_pair_of_walnut_%28Juglans_hopeiensis%29.jpg/960px-A_pair_of_walnut_%28Juglans_hopeiensis%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Yixing_ware_handicraft_walnuts.jpg/960px-Yixing_ware_handicraft_walnuts.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83.jpg/960px-%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83%E6%9E%9C.jpg/960px-%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83%E6%9E%9C.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Walnut_19-10-12_116.jpg/960px-Walnut_19-10-12_116.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Walnut_19-10-12_121.jpg/960px-Walnut_19-10-12_121.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Noix_%C3%A0_3_coques_et_%C3%A0_4_coques.jpg/960px-Noix_%C3%A0_3_coques_et_%C3%A0_4_coques.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/A_pair_of_walnut_%28Juglans_hopeiensis%29_%28cropped%29.jpg/640px-A_pair_of_walnut_%28Juglans_hopeiensis%29_%28cropped%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/A_pair_of_walnut_%28Juglans_hopeiensis%29.jpg/640px-A_pair_of_walnut_%28Juglans_hopeiensis%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Yixing_ware_handicraft_walnuts.jpg/640px-Yixing_ware_handicraft_walnuts.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83%E6%9E%9C1.jpg/960px-%E7%B4%AB%E4%BA%AC%E6%A0%B8%E6%A1%83%E6%9E%9C1.jpg",
] as const;

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getVarietyImagePosition(id: string): string {
  const positions = [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "30% 40%",
    "70% 30%",
    "50% 20%",
  ];
  return positions[hashId(id) % positions.length];
}

export function getVarietyImagesForId(id: string, count = 2): string[] {
  const start = hashId(id) % WALNUT_IMAGE_POOL.length;
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(WALNUT_IMAGE_POOL[(start + i) % WALNUT_IMAGE_POOL.length]);
  }
  return images;
}

export const IMAGE_ATTRIBUTION =
  "参考图来源：Wikimedia Commons（CC 协议），仅供品种形态学习参考";
