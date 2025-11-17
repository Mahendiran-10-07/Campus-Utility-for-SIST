🚀 Campus Utility App 🚀

<div align="center">
<strong>A secure, real-time web application for the SIST campus community.</strong>
<br />
<br />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/React-20232A%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3D61DAFB" alt="React" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Firebase-FFCA28%3Fstyle%3Dfor-the-badge%26logo%3Dfirebase%26logoColor%3Dblack" alt="Firebase" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/JavaScript-F7DF1E%3Fstyle%3Dfor-the-badge%26logo%3Djavascript%26logoColor%3Dblack" alt="JavaScript" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/HTML5-E34F26%3Fstyle%3Dfor-the-badge%26logo%3Dhtml5%26logoColor%3Dwhite" alt="HTML5" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/CSS3-1572B6%3Fstyle%3Dfor-the-badge%26logo%3Dcss3%26logoColor%3Dwhite" alt="CSS3" />
</div>

📖 Table of Contents

The Problem

The Solution

📸 Screenshots

✨ Key Features

🛠️ Technology Stack

🏗️ System Architecture

🔄 Workflow

🚀 Getting Started

🌟 Future Enhancements

Project Team

Problem Statement

On a busy university campus, students constantly face two major logistical problems:

Losing Items: Students frequently misplace valuable items like ID cards, notebooks, and calculators, with no efficient, centralized system to find them.

Short-Term Needs: A student might need an item for a single day (like a lab coat, drafter, or textbook) but has no easy way to ask their peers.

Existing solutions like physical notice boards are outdated and inefficient. Social media groups (like WhatsApp) are cluttered, unorganized, and force students to publicly share personal phone numbers, creating a significant privacy and security risk.

💡 The Solution

The Campus Utility App is a secure, real-time web application that solves these problems by providing two core modules:

Lost & Found System: A centralized, real-time feed where students can post lost items. Other students can privately reply to these posts to arrange a return.

Item Borrowing System: A peer-to-peer network where students can post requests for items they need temporarily, and others can offer to lend them.

The most important feature is our "privacy-by-design" approach. All communication happens through a secure, private notification system. No phone numbers or personal details are ever shared publicly.

📸 Screenshots

(Note: For these images to show up, create a folder named screenshots in your project, add your images to it, and name them as follows)

Homepage

Lost Item Feed

Borrow Request Feed







✨ Key Features

🔒 Secure Student & Admin Login: Ensures only authorized users can access the platform.

📢 Real-Time Lost & Found Feed: Post lost items and see new reports instantly without refreshing the page.

🤝 Peer-to-Peer Item Borrowing: A dedicated feed for requesting and lending items.

🤫 100% Private Notifications: A secure, in-app messaging system. No phone numbers are ever made public.

👤 User Dashboard: A "My Posts" page for users to track, edit, and delete their own posts.

🔎 Search Functionality: Quickly find a specific item in the "Lost & Found" feed.

📱 Fully Responsive: A seamless experience on desktops, tablets, and mobile phones.

(Admin Only) A special admin role with oversight to moderate content and ensure platform safety.

🛠️ Technology Stack

This project is built on a modern, serverless technology stack for maximum performance and scalability.

Frontend:

<img src="https://www.google.com/search?q=https://img.shields.io/badge/React-20232A%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3D61DAFB" alt="React" />

React Router: For all client-side navigation within the Single-Page Application (SPA).

React Context API: For global state management (e.g., managing the current user's auth state).

Backend & Database (BaaS):

<img src="https://www.google.com/search?q=https://img.shields.io/badge/Firebase-FFCA28%3Fstyle%3Dfor-the-badge%26logo%3Dfirebase%26logoColor%3Dblack" alt="Firebase" />

Cloud Firestore: A NoSQL, real-time database to store all user, post, and notification data. It's the magic that makes our feeds update instantly.

Firebase Authentication: For secure handling of all user logins, passwords, and sessions.

Firestore Security Rules: Server-side rules to protect user data and ensure users can only edit their own content.

Deployment:

Firebase Hosting: Deploys the application with a global CDN and free SSL for a fast, secure connection.

🏗️ System Architecture

The application uses a decoupled, client-server architecture. The React frontend is completely separate from the Firebase backend, communicating only through secure API calls.

(Note: Add your architecture diagram to your screenshots folder and update the name below)

🔄 Workflow: Lost Item Recovery

This diagram shows the complete, private, and secure workflow for recovering a lost item.

(Note: Add your workflow diagram to your screenshots folder and update the name below)

Owner submits a 'Lost Item' form.

The data is saved to Cloud Firestore.

Firestore instantly pushes this new data to all connected users.

Finder sees the new post and clicks "Reply".

A Private Notification is created in Firestore, visible only to the Owner.

The Owner receives the notification and coordinates the return privately.

🚀 Getting Started

To run this project locally on your own machine, follow these steps:

1. Prerequisites

You must have Node.js (which includes npm) installed on your computer.

2. Clone the Repository

git clone [https://github.com/YOUR_USERNAME/SIST-CAMPUS-UTILITY.git](https://github.com/YOUR_USERNAME/SIST-CAMPUS-UTILITY.git)
cd SIST-CAMPUS-UTILITY


3. Install Dependencies

This command will download all the necessary libraries (React, Firebase, etc.) into the node_modules folder.

npm install


4. Set Up Your Firebase Environment

This is the most important step. Your secret API keys are not stored on GitHub.

Go to the Firebase Console and create a new project.

In your project, create a new Web App.

Firebase will give you a firebaseConfig object with your API keys.

In the root of your project folder (e.g., SIST-CAMPUS-UTILITY), create a new file named:

.env.local


Copy and paste the template below into your new .env.local file and fill it in with your own keys from Firebase.

# --- .env.local ---
# !! DO NOT SHARE THIS FILE !!

REACT_APP_API_KEY = "AIzaSy...YOUR...KEY"
REACT_APP_AUTH_DOMAIN = "your-project.firebaseapp.com"
REACT_APP_PROJECT_ID = "your-project-id"
REACT_APP_STORAGE_BUCKET = "your-project-id.appspot.com"
REACT_APP_MESSAGING_SENDER_ID = "123456789"
REACT_APP_APP_ID = "1:123456789:web:abcdef123456"


5. Run the Application

You're all set! Run this command to start the app on your local server.

npm start


Open http://localhost:3000 to view it in your browser.

🌟 Future Enhancements

Native Mobile App: Build a native iOS and Android app (using React Native) for a better mobile experience.

Push Notifications: Add instant mobile alerts for new messages.

Real-Time Chat: Upgrade the notification system to a full-featured private chat module.

Campus Marketplace: A new module for students to buy and sell used items like textbooks and furniture.

AI-Powered Matching: Use image recognition to suggest matches for lost items.
