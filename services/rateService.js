const Rate = require('../models/Rate');

const createRate = async (data) => {
  const { gold24, gold22, gold18, silver } = data;

  const newRate = new Rate({
    gold24,
    gold22,
    gold18,
    silver
  });
  return await newRate.save();
};

const getLatestRates = async () => {
  const latestRate = await Rate.findOne().sort({ createdAt: -1 });

  if (!latestRate) {
    return null;
  }

  return {
    gold24: latestRate.gold24,
    gold22: latestRate.gold22,
    gold18: latestRate.gold18,
    silver: latestRate.silver,
    updatedAt: latestRate.createdAt
  };
};

module.exports = {
  createRate,
  getLatestRates,
};
