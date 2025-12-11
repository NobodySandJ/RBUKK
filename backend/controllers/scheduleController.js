const { supabase } = require('../config/database');

// Get all upcoming events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { data: events, error } = await supabase
      .from('schedule')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// Get events by month
exports.getEventsByMonth = async (req, res, next) => {
  try {
    const { month } = req.params; // Format: YYYY-MM

    const startDate = `${month}-01`;
    const endDate = new Date(month + '-01');
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: events, error } = await supabase
      .from('schedule')
      .select('*')
      .gte('event_date', startDate)
      .lt('event_date', endDate.toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// Get featured events
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const { data: events, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('is_featured', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3);

    if (error) throw error;

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};
