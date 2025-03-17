"use client";

import { useState } from "react";
import { useProductsByMetal } from "@/lib/queries/useProducts";
import ProductCard from "@/components/custom/products/productcard";


export default function Page() {
  const [selectedMetal, setSelectedMetal] = useState("Gold"); // Default to Gold
  const { data: products = [], isLoading, error } = useProductsByMetal(selectedMetal);

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <p>Loading {selectedMetal} products...</p>}
      {error && <p>Error loading {selectedMetal} products.</p>}

      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
