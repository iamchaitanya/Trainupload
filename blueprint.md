# Project Blueprint: Bank Inspector

## Overview

A simple, mobile-friendly web application for bank inspectors to log daily inspection details, including journey information and expenses. The app works offline and saves all data locally in the browser.

## Design and Features

### **Visual Design**

*   **Layout:** A clean, modern, single-page interface with a clear and intuitive layout.
*   **Color Scheme:**
    *   Primary Accent: Blue (`#007bff`) for headers, links, and focus states.
    *   Success/Save: Green (`#28a745`) for the primary save button.
    *   Destructive/Delete: Red (`#dc3545`) for the delete icon and error notifications.
*   **Typography:** System fonts for a native feel.
*   **Iconography:** A trash can icon for the delete button.

### **Core Features**

*   **Offline First:** The application is designed to work without an internet connection.
*   **Local Storage:** All data is saved in the browser's local storage.
*   **PWA Enabled:** The app can be installed on a mobile device for a native-like experience.
*   **Data Export:**
    *   Users can download all saved records as an Excel file.
    *   Users can download all saved records as a PDF file.
    *   A dropdown allows users to select a specific month to download, or all months.

### **Form and Input**

*   **Date Picker:** The date input is a set of dropdowns for day, month, and year.
*   **Day Status:**
    *   A radio button group that looks like a set of three buttons: "Inspection," "Holiday," and "Leave."
    *   If "Holiday" or "Leave" is selected, the inspection-specific fields are hidden.
*   **Inspection Type:**
    *   A dropdown with the following options: "RBIA," "CAD," "CAD Effectiveness," "Income Audit," "CPH audit," "Tab Banking," "SNAP Audit," and "Others."
    *   If "Others" is selected, an additional input field appears for the user to specify the inspection type.
*   **Mandatory Fields:**
    *   The "Date" field is always required.
    *   If the "Day Status" is "Inspection," the "Branch Name," "DP Code," and "Inspection Type" fields are also required.
    *   If the "Inspection Type" is "Others," the "Please Specify" field is also required.
*   **Optional Fields:** All other fields are optional. If left empty, they are saved with a value of "Nil."
*   **Validation:**
    *   Mandatory fields are highlighted with a red border if they are not filled in when the user tries to save.
    *   The application prevents users from saving more than one entry for the same date.
*   **Notifications:**
    *   A custom notification appears at the top of the form to provide feedback to the user.
    *   A red notification appears if the user tries to save an entry for a date that already exists, or if mandatory fields are not filled in.
    *   A green notification will be implemented in the future to confirm when an entry is saved successfully.

### **Data Display**

*   **Saved Records Table:** A responsive table displays all saved records, grouped by month, with columns for "Date," "Status," "Branch Name," "DP Code," "Inspection Type," and "Actions." The records are displayed with the newest entries first.
*   **Date Formatting:** Dates in the table are displayed in `DD-MM-YYYY` format.
*   **Record Styling:**
    *   "Holiday" rows have a light green background and a green left border.
    *   "Leave" rows have a light blue background and a blue left border.
*   **Delete Functionality:** Each record has a delete icon to remove it from the table.

## **Current Plan**

- The application has been updated with the requested features. The next step is to await further instructions from the user.
