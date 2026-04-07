export type SearchQuery = {
  name?: string;
  vehicle_brand_id?: string;
  vehicle_model_id?: string;
  vehicle_year_id?: string;
  product_brand_id?: string;
  category_ids?: string;
  tag_ids?: string;
  attribute_ids?: string;
  price_low?: string;
  price_high?: string;
  rating?: string;
  sort_by?: string;
  limit?: string;
  offset?: string;
  in_stock_only?: string;
};
