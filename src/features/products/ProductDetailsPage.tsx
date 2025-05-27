// InventoryDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import {productData} from '../inventory/data/productData';

export const InventoryDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // 从你的数据源里找出对应项
  const product = productData.find((p) => p.djj_code === code);

  if (!product) {
    return <div>Product {code} not found</div>;
  }

  return (
    <ProductDetails
      open={true}
      product={product}
      onClose={() => navigate(-1)} // `-1` 表示回到上一个页面
    />
  );
};

export default InventoryDetailPage;