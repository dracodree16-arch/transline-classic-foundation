# Transline Classic Foundation

Build the foundation of a professional Transline Classic Transport Management System based on the attached reference video.



IMPORTANT: Do NOT attempt to build every feature yet. This is Phase 1 of a multi-step build. Focus on creating a strong application foundation, database architecture, navigation and polished UI that we will extend in later prompts.



BRAND



Name: Transline Classic



Build this as a professional Kenyan transport company's internal management platform.



Use:



- Deep purple/indigo primary navigation

- White/light main workspace

- Modern cards

- Clean tables

- Professional icons

- Rounded UI elements

- Clear typography

- Responsive design

- Desktop-first enterprise dashboard

- Fully usable on mobile



The design should feel like a real transport management system, not a generic website template.



AUTHENTICATION



Create:



- Login page

- Email/username

- Password

- Show/hide password

- Forgot password

- Sign in

- Protected application routes



Create the foundation for role-based access with these roles:



- Super Admin

- Administrator

- Manager

- Booking Agent

- Dispatcher

- Parcel Staff

- Finance Staff

- Branch Staff



For now, make authentication functional and establish the user/role structure.



APPLICATION LAYOUT



After login, create the main application shell.



Left sidebar:



- Dashboard

- Bookings

- Trips

- Fleet

- Routes

- Parcels

- Finance

- Reports

- Reconciliation

- Staff

- Settings



Top bar:



- Search

- Notifications

- Current user

- User role

- Profile menu



Make the sidebar collapsible on desktop and convert it into a mobile-friendly navigation on small screens.



DASHBOARD



Create a polished dashboard based on the reference video.



Top statistics:



- Today's Bookings

- Today's Revenue

- Available Buses

- Active Trips

- Parcels

- Pending Payments



Create dashboard action cards:



Ticket Management



- New Booking

- Manifest

- All Bookings

- Bus Dispatch



Parcel Management



- Book Parcel

- Loading Sheet

- All Parcels



Finance



- Overview

- Cash Forward

- Expenses

- Banking

- Cash Received

- Statements

- Mobile Money



Also include:



- Recent bookings

- Recent parcel activity

- Upcoming trips

- Revenue chart

- Calendar

- Notifications/alerts



Use realistic Kenyan demo data.



CREATE ALL MAIN PAGES



Create the page structure for:



Bookings



- All Bookings

- New Booking

- Booking Details

- Manifest

- Bus Dispatch



Trips



- All Trips

- Trip Details

- Create Trip



Fleet



- All Buses

- Add Bus

- Bus Details



Routes



- All Routes

- Add Route

- Route Details



Parcels



- All Parcels

- Book Parcel

- Parcel Details

- Loading Sheet

- Parcel Tracking



Finance



- Financial Overview

- Cash Forward

- Expenses

- Banking

- Cash Received

- Mobile Money

- Statements



Reports



- Ticket Sales

- Parcel Sales

- Revenue

- Expenses

- Branch Reports



Reconciliation



- Reconciliation Dashboard

- Reconciliation Details



Staff



- Staff List

- Add Staff

- Staff Details

- Roles & Permissions



Settings



- Profile

- System Settings



These pages should have proper navigation and polished placeholder/demo content where functionality has not yet been implemented.



DATABASE FOUNDATION



Set up the database structure needed for the application.



Create the basic tables/entities for:



- users

- roles

- branches

- buses

- routes

- trips

- bookings

- passengers

- payments

- parcels

- expenses

- notifications

- audit_logs



Establish proper relationships between them.



Do not create disconnected mock pages. The architecture must be ready for the next development phases.



DEMO DATA



Use realistic Kenyan transport demo data.



Example locations:



- Nairobi

- Kisii

- Oyugis

- Kisumu

- Kericho

- Nakuru



Use KES as the currency.



Create demo buses, routes, trips, bookings and parcels so the dashboard looks populated.



Clearly treat all information as demo data.



IMPORTANT



Do NOT spend this phase implementing:



- M-Pesa/Daraja integration

- Complex financial calculations

- Advanced reports

- Full parcel workflow

- Full booking workflow

- Advanced seat selection



Those will be implemented in later phases.



The goal of this phase is:



Strong architecture + authentication + database foundation + complete navigation + polished dashboard + all major page structures.



Make sure the application runs correctly before finishing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/42a6ea02-9329-4a70-8976-45b7a3d0ba3c).

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
