const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const axios = require("axios");

const admin = require("firebase-admin");
admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

exports.generateGSTInvoice = onDocumentUpdated(
  "bookings/{bookingId}",
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Run only when status changes to finished
    if (beforeData.status !== "finished" && afterData.status === "finished") {
      const name = afterData.name;
      const amount = Number(afterData.totalBookingAmount);
      const customerState = afterData.customerState;
      const businessState = afterData.businessState;

      const GST_RATE = 0.18;

      const gstAmount = amount * GST_RATE;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (customerState === businessState) {
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
      } else {
        igst = gstAmount;
      }

      const invoice = {
        customer: name,
        bookingAmount: amount,
        gstAmount,
        cgst,
        sgst,
        igst,
        totalAmount: amount + gstAmount,
      };
      await admin.firestore().collection("invoices").add(invoice);
      try {
        const response = await axios.post("https://httpbin.org/post", invoice);

        logger.info("GST API Response", response.data);
      } catch (error) {
        logger.error("GST API call failed", error.message);
      }
      logger.info("GST Invoice Generated", invoice);

      // Here you would call external GST API
      // Example placeholder
      // await axios.post("https://example-gst-api.com/file", invoice);
    }
  },
);
