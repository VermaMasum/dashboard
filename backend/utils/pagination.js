// backend/utils/pagination.js

/**
 * Generic pagination helper for MongoDB (Mongoose)
 * @param {Object} model - The Mongoose model to paginate
 * @param {Object} filter - Query filter (default: {})
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Number of items per page (default: 10)
 * @param {Object} sort - Sort object (default: {_id: -1})
 */
async function paginate(
  model,
  filter = {},
  page = 1,
  limit = 10,
  sort = { _id: -1 }
) {
  const skip = (page - 1) * limit;

  const data = await model
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await model.countDocuments(filter);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
}

module.exports = { paginate };
