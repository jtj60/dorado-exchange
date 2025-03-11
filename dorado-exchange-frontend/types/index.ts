export interface Product {
  id: string,
  metal_id: string,
  content_id: string,
  supplier_id: string,
  product_name: string,
  product_description: string,
  bid: number,
  ask: number,
  product_type: string,
  created_at: Date,
  updated_at: Date,
  image_front: string,
  image_back: string,
}

export interface User {
  id: string,
  name: string,
  email: string,
  emailVerified: boolean,
  createdAt: Date,
  updatedAt: Date,
  image?: string | null,
}