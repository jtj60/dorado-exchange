const cron = require("node-cron");
const { updateSpotPrices } = require("../controllers/spotController");
const {
  expireStaleOffers,
} = require("../controllers/admin/adminPurchaseOrdersController");

function setupScheduler() {
  try {
    updateSpotPrices();
  } catch (err) {
    console.error("Startup: Failed to update spot prices", err);
  }

  try {
    expireStaleOffers();
  } catch (err) {
    console.error("Startup: Failed to expire offers", err);
  }

  cron.schedule(process.env.SPOT_UPDATE_SCHEDULE, async () => {
    await updateSpotPrices();
  });

  cron.schedule(process.env.STALE_OFFERS_UPDATE_SCHEDULE, async () => {
    await expireStaleOffers();
  });
}
module.exports = { setupScheduler };
