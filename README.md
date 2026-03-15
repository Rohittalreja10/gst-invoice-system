# Automated GST Invoicing System using Firebase Firestore & Cloud Functions

## Overview

This project implements an **automated GST invoicing system** using **Firebase Firestore and Cloud Functions**.
The system listens for updates in booking records and automatically generates GST-compliant invoices when a booking status changes to **"finished"**.

The solution demonstrates:

- Event-driven backend architecture
- GST calculation according to Indian tax rules
- Firestore triggers using Cloud Functions
- Integration with an external API to simulate GST filing

---

# System Architecture

```
Firestore (bookings collection)
        │
        │ status updated → "finished"
        ▼
Cloud Function Trigger (generateGSTInvoice)
        │
        │ Calculate GST
        │ Split CGST / SGST / IGST
        ▼
Invoice Generated
        │
        ├── Store invoice in Firestore (invoices collection)
        │
        └── Send invoice data to external GST API
```

---

# Firestore Database Structure

## bookings collection

Stores booking information.

Example document:

```
bookings
   booking1
      name: "Rohit"
      totalBookingAmount: 420
      status: "pending"
      customerState: "Rajasthan"
      businessState: "Rajasthan"
```

When the booking status is updated to:

```
status = "finished"
```

the Cloud Function automatically triggers the invoicing process.

---

## invoices collection

Stores generated invoices.

Example document:

```
invoices
   invoiceId
      customer: "rohit"
      bookingAmount: 420
      gstAmount: 75.6
      cgst: 37.8
      sgst: 37.8
      igst: 0
      totalAmount: 495.6
```

---

# Cloud Function Logic

The Cloud Function is triggered whenever a booking document is updated.

Trigger definition:

```
bookings/{bookingId}
```

The function checks:

```
if (before.status !== "finished" && after.status === "finished")
```

This ensures the invoice is generated **only once when the booking is completed**.

---

# GST Calculation Logic

GST is calculated according to Indian GST rules.

## GST Rate

```
GST = 18%
```

## Same State (Intra-state)

GST is divided into:

```
CGST = 9%
SGST = 9%
```

Example:

```
Booking Amount = 420

GST (18%) = 75.6

CGST = 37.8
SGST = 37.8

Total Invoice Amount = 495.6
```

## Different State (Inter-state)

GST becomes:

```
IGST = 18%
```

Example:

```
Booking Amount = 420

IGST = 75.6

Total Invoice Amount = 495.6
```

---

# External GST API Integration

After generating the invoice, the system sends invoice data to an external API.

Example API call:

```
POST https://httpbin.org/post
```

The invoice payload is sent using **Axios**.

Example request body:

```
{
  customer: "rohit",
  bookingAmount: 420,
  gstAmount: 75.6,
  cgst: 37.8,
  sgst: 37.8,
  igst: 0,
  totalAmount: 495.6
}
```

### Why a Mock API was used

Real GST filing requires access to **GST Suvidha Provider (GSP) APIs**, such as:

- ClearTax
- Masters India

These services require:

- GSTIN
- API credentials
- production approval

Therefore, a mock API endpoint was used to simulate GST submission.

---

# Running the Project

## Install Firebase CLI

```
npm install -g firebase-tools
```

## Login to Firebase

```
firebase login
```

## Install dependencies

Inside the functions folder:

```
cd functions
npm install
```

## Start Firebase Emulator

```
firebase emulators:start
```

The emulator UI will be available at:

```
http://127.0.0.1:4000
```

---

# Testing the System

1. Open the **Firestore Emulator UI**
2. Create a document inside the **bookings collection**

Example:

```
name: "rohit"
totalBookingAmount: 420
status: "pending"
customerState: "Rajasthan"
businessState: "Rajasthan"
```

3. Update the booking status:

```
status = "finished"
```

4. The Cloud Function will automatically:

- calculate GST
- generate an invoice
- store the invoice in the **invoices collection**
- send invoice data to the external API

---

# Technologies Used

- Node.js
- Firebase Cloud Functions
- Firebase Firestore
- Firebase Emulator Suite
- Axios (HTTP requests)

---

# Key Features

- Event-driven architecture
- Automated invoice generation
- GST calculation based on state rules
- Firestore trigger-based backend logic
- API integration for GST filing simulation
- Local testing using Firebase Emulator

---

# Future Improvements

Possible enhancements include:

- Generating PDF invoices
- Integrating real GST Suvidha Provider APIs
- Adding authentication for secure access
- Creating a frontend dashboard for invoice management
- Adding logging and monitoring

---

# Conclusion

This project demonstrates an automated GST invoicing workflow using **Firebase Firestore and Cloud Functions**.
The system automatically generates GST invoices based on booking completion events and integrates with external APIs to simulate GST filing, showcasing a scalable event-driven backend architecture.

# url for video

https://drive.google.com/file/d/1D4x9-oLTWCHcmW1n1sYPYXMz7ELSBwie/view?usp=drive_link
