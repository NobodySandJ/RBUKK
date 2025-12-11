const { supabase } = require('../config/database');

// Get all members
exports.getAllMembers = async (req, res, next) => {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// Get member by ID
exports.getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !member) {
      return res.status(404).json({
        success: false,
        message: 'Member tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};
