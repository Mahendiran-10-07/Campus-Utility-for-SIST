🚀 Campus Utility App
<div align="center">
A secure, real-time web platform for the SIST campus community.
  <br>
<br/> <p> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=000" /> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000" /> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=fff" /> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=fff" /> </p> </div>

📘 Table of Contents


->Problem Statement

->Solution

->Key Features

->Technology Stack

->System Architecture

->Workflow

->Getting Started

->Future Enhancements

</br>
🧩 Problem Statement <br>

<br>

**Students at a busy university campus struggle with:

🎒 Lost Items

**ID cards, calculators, books, notebooks — gone, with no central system to report or recover.

📘 Borrowing Needs

->Short-term needs like:

->Lab coats

->Drafters

->Textbooks

<br/>

❌ Current Problems

❌ Notice boards are outdated

❌ WhatsApp groups leak phone numbers

❌ Data becomes scattered and unorganized

<br/>
💡 Solution

**A privacy-first, real-time campus utility platform with:

🔹 Lost & Found

**Central feed for lost items + private replies.

🔹 Borrowing System

**Post requests → Lenders respond privately.

🔐 No phone numbers exposed.
⚡ Real-time updates via Firestore.

<br>

✨ Key Features
<br>

🔒 Secure Login (Student + Admin)

⚡ Real-Time Lost & Found Feed

🤝 Borrow Request System

🔐 Private Notification System

📝 My Posts – Personal Dashboard

🔎 Smart Search Function

📱 Fully Responsive UI

🛡️ Admin Moderation Tools

<br/>
🛠️ Technology Stack
<br>
<br>
->Frontend
<br>
->React
<br>
->React Router
<br>
->Context API
<br>
->Backend
<br>
->Firebase Authentication
<br>
->Cloud Firestore
<br>
->Firestore Security Rules
<br>
->Deployment
<br>
->Firebase Hosting (SSL + CDN)
<br>
<br/>
<br>
🏗️ System Architecture<br>
<br>


<p align="center">
  <img src="./architecture.png" alt="System Architecture" width="550">
</p>

<br/>
🔄 Workflow <br>
<br>
->Lost Item Recovery Flow
<br>
->Owner submits a lost item
<br>
->Firestore stores instantly
<br>
->Real-time sync to all users
<br>
->Finder clicks Reply
<br>
->Private notification sent
<br>
->Owner retrieves item safely

<br/>
<br>
🚀 Getting Started<br>
<br>
1️⃣ Clone the Repo
git clone https://github.com/YOUR_USERNAME/SIST-CAMPUS-UTILITY.git
cd SIST-CAMPUS-UTILITY

2️⃣ Install Dependencies
npm install

3️⃣ Setup Firebase

Create .env.local:

REACT_APP_API_KEY="your-key"<br>
REACT_APP_AUTH_DOMAIN="your-project.firebaseapp.com"<br>
REACT_APP_PROJECT_ID="your-project-id"<br>
REACT_APP_STORAGE_BUCKET="your-project-id.appspot.com"<br>
REACT_APP_MESSAGING_SENDER_ID="123456789"<br>
REACT_APP_APP_ID="1:123456789:web:abcdef123456"<br>

4️⃣ Start App
npm start


Open:
👉 http://localhost:3000

<br/>
🌟 Future Enhancements<br>
<br>
📱 Native Mobile App
<br>
🔔 Push Notifications
<br>
💬 Real-Time Chat
<br>
🛒 Marketplace Module
<br>
🤖 AI-based lost item matching

<br/>
