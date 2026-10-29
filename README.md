# Food Connect Hub

Build a complete professional MERN Stack frontend (React.js) project named:

"Smart Food Distribution System"

Project Goal:

Develop a modern, responsive, real-world web application that reduces food wastage by connecting food donors with registered orphanages and old age homes.

The project should have a premium UI/UX with beautiful animations, modern cards, gradients, icons, responsive layouts, clean code, reusable components, React Router, Context API, and proper folder structure.

Technology:

- React.js

- React Router DOM

- CSS

- React Icons

- Context API

- Responsive Design

Do NOT use Bootstrap.

Create everything using React components and CSS.

====================================

USERS

====================================

1. Donor

2. Organization (Orphanage / Old Age Home Manager)

3. Admin

====================================

DONOR FEATURES

====================================

• Register

• Login

• Forgot Password UI

• Profile Page

• Edit Profile

• Dashboard

• Donate Food

• Donation History

• Track Donation Status

• Logout

While donating food the donor must enter:

• Event Type

- Marriage

- Function

- Temple

- Birthday

- Community Event

- Other

• Food Name

• Food Type (Veg / Non-Veg)

• Quantity (Meals/Packets)

• Prepared Time

• Address

• Google Maps Location

• Contact Number

• Optional Food Image Upload

The donor should NOT manually enter expiry time.

Instead,

The system must automatically calculate

Available Until = Prepared Time + 5 Hours

This is a fixed project rule.

Example:

Prepared Time:

2:00 PM

System automatically displays:

Available Until:

7:00 PM

Show countdown timer.

Example:

Remaining Time:

3 Hours 45 Minutes

When time reaches zero:

Status:

Expired

Accept button becomes disabled automatically.

Donor must confirm using a checkbox:

"I confirm that this food was prepared today, stored hygienically, and is safe for donation."

After login,

Donor Name and Phone Number should automatically appear in the donation form.

====================================

ORGANIZATION FEATURES

====================================

Organizations represent:

• Orphanages

• Old Age Homes

Only Organization Managers can register.

Registration fields:

• Organization Name

• Manager Name

• Email

• Mobile Number

• Address

• Google Maps Location

• Organization Type

• Password

After registration,

Account should remain

Pending Verification

Until Admin approves it.

After approval,

Organization can login.

Organization Dashboard should display:

• New Food Notifications

• Available Donations

• Accepted Donations

• Pickup History

• Delivery History

• Profile

• Logout

====================================

SMART FOOD DISTRIBUTION

====================================

Food should NOT be accepted by only one organization.

Instead,

Organizations can accept only the quantity they need.

Example

Donor uploads

100 Meals

Organization A accepts

30

Remaining

70

Organization B accepts

40

Remaining

30

Organization C accepts

30

Remaining

0

Donation becomes

Completed

Dashboard must always display:

Total Quantity

Remaining Quantity

Accepted Quantity

====================================

SMART PRIORITY SYSTEM

====================================

Priority should be generated automatically.

Do NOT allow users to choose priority.

Based on remaining time.

5–3 Hours Left

Normal Priority

3–1 Hour Left

Medium Priority

Less than 1 Hour

High Priority

Show color badges:

Green

Yellow

Red

====================================

NOTIFICATION SYSTEM

====================================

Only nearby registered organizations receive notifications.

Dashboard notification example:

New Food Donation Available

Food:

Veg Meals

Quantity:

100 Meals

Location:

Benz Circle

Distance:

2.3 KM

Available Until:

7:00 PM

Remaining Time

Accept

====================================

AUTO EXPIRY SYSTEM

====================================

Every donation automatically expires after

Prepared Time + 5 Hours

When expired

Status

Expired

Disable Accept button

Donation moves to History

====================================

STATUS FLOW

====================================

Available

↓

Partially Accepted

↓

Fully Accepted

↓

Picked Up

↓

Delivered

↓

Completed

OR

Expired

====================================

HOME PAGE

====================================

Beautiful premium landing page

Sections

Modern Navbar

Hero Section

About

How It Works

Features

Statistics

Testimonials

Contact

Footer

Hero should contain

Smart Food Rescue Hub

Connecting Surplus Food with Hope

Buttons

Donate Food

Explore

====================================

HOW IT WORKS

====================================

Register

↓

Donate Food

↓

Nearby Organizations Receive Notification

↓

Organizations Accept Required Quantity

↓

Pickup

↓

Delivery

↓

Food Reaches Needy People

====================================

FEATURES SECTION

====================================

Donate Food

Live Location

Auto Expiry (5 Hours)

Smart Notifications

Quantity Split

Countdown Timer

Responsive UI

Donation History

Admin Verification

====================================

ADMIN PANEL

====================================

Admin Login

Dashboard

Approve Organizations

Reject Organizations

Manage Donors

Manage Organizations

View All Donations

Reports

Statistics

Logout

====================================

UI DESIGN

====================================

Professional modern UI

Green

White

Orange

Blue

Glassmorphism

Hover Effects

Animations

Responsive Cards

Sidebar Dashboard

Premium Buttons

Beautiful Forms

Modern Tables

Notification Panel

Progress Bars

Countdown Timer

Status Badges

====================================

FOLDER STRUCTURE

====================================

Create complete industry-standard folder structure.

Separate

components

pages

contexts

services

styles

assets

layouts

hooks

utils

====================================

OUTPUT

====================================

Generate the complete only frontend project from start to finish.

Include every React component.

Include every CSS file.

Include routing.

Include dummy data.

Include reusable components.

Use clean and professional coding standards.

Every file should be fully written.

Do not skip any file.

Generate the project exactly as a real production-ready React frontend. IMPORTANT INSTRUCTIONS

Generate this project in multiple parts.

Never skip any file.

Generate one file at a time.

For every file follow this format exactly:

Step 1

File Path:

src/components/Navbar/Navbar.jsx

Create this file and write the complete code.

Step 2

File Path:

src/components/Navbar/Navbar.css

Create this file and write the complete code.

After each file, wait for me to reply "Next".

Do not generate multiple files together unless they belong to the same component (e.g. Navbar.jsx + Navbar.css).

Every generated code must run without errors before moving to the next file.

Never leave TODO comments.

Never write "continue later".

Never shorten the code.

Generate production-ready code only.

Maintain the correct import/export statements.

Use reusable components.

After completing one section, update the folder structure showing completed files.

Build the project in this exact order:

1. Folder Structure

2. main.jsx

3. App.jsx

4. React Router

5. Layout

6. Navbar

7. Hero

8. About

9. How It Works

10. Features

11. Statistics

12. Testimonials

13. Contact

14. Footer

15. Authentication Pages

16. Donor Dashboard

17. Organization Dashboard

18. Admin Dashboard

19. Context API

20. Dummy Data

21. Utils

22. Services

23. Final Responsive Styling

Every step must be runnable before moving to the next step."Generate one file at a time in the correct folder structure. Wait for my confirmation before generating the next file. Never skip files or summarize code."beautiful look vundali

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a1bd0440-f3d1-436f-aa04-2a24ec750780).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
