const Inventory = require('../models/Inventory');

exports.getAll = async (req, res) => {
  try {
    const { search, category, lowStock, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } }
    ];
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$reorderLevel'] };

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .sort('name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('addedBy', 'name');
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('addedBy', 'name');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ item });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } });
    res.json({ items, count: items.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
