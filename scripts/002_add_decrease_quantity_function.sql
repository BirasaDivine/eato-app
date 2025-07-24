-- Create function to decrease product quantity
CREATE OR REPLACE FUNCTION decrease_product_quantity(product_id UUID, decrease_by INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET quantity = quantity - decrease_by
  WHERE id = product_id AND quantity >= decrease_by;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock or product not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
