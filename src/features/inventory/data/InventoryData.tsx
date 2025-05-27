// src/data/InventoryData.ts

export interface InventoryRow {
  id: number;
  djj_code: string;
  product_name: string;
  manufacturer: string;
  model: string;
  last_update: string; // ISO 时间
  category: "Machine" | "Parts" | "Tools" | "Accessories";
  price: number;
  regionStore: string;
  actualQty: number;
  lockedQty: number;
  availableQty: number;
  photoUrl: string; // 新增：示意图 URL
}

// 预定义几个「地区–门店」组合
const regionStoreList = [
  "Brisbane – Warehouse A",
  "Brisbane – Warehouse C",
  "Perth – Warehouse B",
  "Perth – Warehouse E",
  "Sydney – Warehouse A",
  "Sydney – Warehouse C",
  "Sydney – Warehouse D",
];

// 分类
const categories: InventoryRow["category"][] = [
  "Machine",
  "Parts",
  "Tools",
  "Accessories",
];

// 随机最近 30 天内时间
function randomRecentDate(days = 30) {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 3600 * 1000;
  return new Date(past).toISOString();
}

// 随机价格
function randPrice(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// 生成 100 条 Mock 数据
export const data: InventoryRow[] = Array.from({ length: 33 }, (_, i) => {
  const id = i + 1;
  // 库存
  const onHand = Math.floor(Math.random() * 100) + 1;
  const reserved = Math.floor(onHand * Math.random());
  const available = onHand - reserved;
  // 分类 & 门店
  const category = categories[i % categories.length];
  const regionStore = regionStoreList[i % regionStoreList.length];
  // 厂家/型号/产品名
  let manufacturer = "";
  let model = "";
  let product_name = "";
  let price = 0;
  if (category === "Machine") {
    // 四种机型中的一种
    const kinds = [
      "Wheel Loader",
      "Skid Steer Loader",
      "FORKLIFT",
      "EXCAVATOR",
    ];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    if (kind === "Wheel Loader") {
      manufacturer = "LUGONG";
      model = ["LM930", "LM920", "LM938", "LM946"][
        Math.floor(Math.random() * 4)
      ];
    } else if (kind === "Skid Steer Loader") {
      manufacturer = "ZOOMLION";
      model = "ZOOMLION";
    } else if (kind === "FORKLIFT") {
      manufacturer = "EP";
      model = ["EP-100", "EP-200", "EP-300"][Math.floor(Math.random() * 3)];
    } else {
      manufacturer = "ZOOMLION";
      model = "ZOOMLION";
    }
    product_name = `${kind} ${model}`;
    price = randPrice(20000, 200000);
  } else if (category === "Parts") {
    manufacturer = ["BrandA", "BrandB", "BrandC"][i % 3];
    model = `P-${String(id).padStart(3, "0")}`;
    product_name = `Part ${id}`;
    price = randPrice(10, 500);
  } else if (category === "Tools") {
    manufacturer = ["ToolCorp", "FixIt", "Handy"][i % 3];
    model = `T-${String(id).padStart(3, "0")}`;
    product_name = `Tool ${id}`;
    price = randPrice(5, 200);
  } else {
    manufacturer = ["AccA", "AccB"][i % 2];
    model = `A-${String(id).padStart(3, "0")}`;
    product_name = `Accessory ${id}`;
    price = randPrice(1, 100);
  }

  return {
    id,
    djj_code: `DJJ-${String(id).padStart(3, "0")}`,
    product_name,
    manufacturer,
    model,
    last_update: randomRecentDate(30),
    category,
    price,
    regionStore,
    actualQty: onHand,
    lockedQty: reserved,
    availableQty: available,
    // 占位示意图
    photoUrl: `https://picsum.photos/seed/${id}/600/300`,
  };
});
