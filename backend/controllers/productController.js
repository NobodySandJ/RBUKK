const { supabase } = require('../config/database');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        members (
          id,
          name,
          member_color
        )
      `)
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        members (
          id,
          name,
          member_color
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        members (
          id,
          name,
          member_color
        )
      `)
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
