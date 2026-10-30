# 🌱 FoodBridge – Turning Surplus Into Smiles

<p align="center">
  <strong>Rescue Food. Reduce Waste. Share Hope.</strong>
</p>

<p align="center">
  An open-source food waste reduction platform connecting surplus food donors with NGOs and community organisations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Open%20Source-brightgreen" alt="Open Source">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-orange" alt="Frontend">
  <img src="https://img.shields.io/badge/Backend-Python%20%7C%20Flask-blue" alt="Backend">
  <img src="https://img.shields.io/badge/Database-SQLite-lightgrey" alt="Database">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow" alt="Status">
</p>

---

## 📌 Table of Contents

1. [About the Project](#-about-the-project)
2. [The Problem](#-the-problem)
3. [Our Solution](#-our-solution)
4. [Project Objectives](#-project-objectives)
5. [Key Features](#-key-features)
6. [User Roles](#-user-roles)
7. [How FoodBridge Works](#-how-foodbridge-works)
8. [Technology Stack](#-technology-stack)
9. [Project Architecture](#-project-architecture)
10. [Installation and Setup](#-installation-and-setup)
11. [Project Structure](#-project-structure)
12. [Database Design](#-database-design)
13. [Food Safety and Trust](#-food-safety-and-trust)
14. [Security and Privacy](#-security-and-privacy)
15. [Future Enhancements](#-future-enhancements)
16. [Contributing](#-contributing)
17. [Roadmap](#-roadmap)
18. [License](#-license)
19. [Project Vision](#-project-vision)

---

## 🌍 About the Project

**FoodBridge** is an open-source food waste reduction and redistribution platform designed to connect food donors with NGOs and community organisations.

Restaurants, hotels, hostels, supermarkets, event organisers, and other food businesses may have surplus food that could otherwise go to waste.

At the same time, community organisations often need access to food resources to support people who require assistance.

FoodBridge aims to bridge this gap through a simple digital platform that helps donors publish surplus food donations and enables eligible organisations to discover, request, collect, and track those donations.

Our mission is to make food donation coordination easier, more transparent, and more accessible.

## 🚨 The Problem

Food waste and food insecurity exist alongside each other.

Some common challenges include:

- Restaurants and food businesses struggle to find organisations that can collect surplus food.
- NGOs may not know where surplus food is available.
- Food donation coordination often happens through disconnected communication channels.
- Collection deadlines can be missed.
- Donors and organisations may lack transparent donation tracking.
- Organisations may struggle to coordinate collection capacity.
- There may be limited records of completed donations and their impact.

FoodBridge aims to address these coordination problems through technology.

## 💡 Our Solution

FoodBridge creates a digital connection between food donors and verified community organisations.

The platform enables:

- Donors to publish surplus food information.
- NGOs to browse available donations.
- Organisations to request food collection.
- Donors to accept or reject collection requests.
- Both parties to track donation progress.
- Users to coordinate collection verification.
- Administrators to manage platform users and organisation verification.
- Communities to understand the impact of food redistribution.

FoodBridge is designed to be adaptable to different cities, communities, languages, and regional requirements.

---

## 🎯 Project Objectives

- Reduce avoidable food waste.
- Improve access to surplus food donations.
- Connect food donors with community organisations.
- Make donation coordination easier.
- Improve transparency through donation tracking.
- Encourage responsible food redistribution.
- Build a scalable, open-source solution.
- Support community-driven social impact.

---

## 🚀 Key Features

### 1. User Authentication and Role Management

Separate account experiences for different users.

Features:

- User registration.
- User login interface.
- Password validation.
- Role selection.
- Donor accounts.
- NGO and community organisation accounts.
- Admin interface.
- User profile management.

Account roles:

- Food Donor
- NGO / Community Organisation
- Platform Administrator

Real authentication and role-based permissions require secure backend implementation.

### 2. Food Donation Management

Donors can create and manage food donation listings.

Donation information includes:

- Food name.
- Food description.
- Food category.
- Food image.
- Available quantity.
- Measurement unit.
- Preparation date.
- Preparation time.
- Storage conditions.
- Allergen information.
- General pickup location.
- Collection deadline.
- Special instructions.

Donor capabilities:

- Create donations.
- Edit donations.
- Delete available listings.
- View collection requests.
- Accept or reject requests.
- Update donation status.
- View donation history.

### 3. NGO Donation Discovery

NGOs can discover food donations available in their service areas.

Features:

- Browse available donations.
- Search by food name.
- Filter by category.
- Filter by location.
- Filter by quantity.
- Filter by collection deadline.
- View donation details.
- Request food collection.
- Track collection requests.
- View accepted donations.
- View completed collections.

### 4. Smart Nearby Donation Finder

A location-oriented donation discovery feature.

Features:

- Display donation locations on a map.
- Search for donations by area.
- Show approximate distance when location data is available.
- Find nearby food donations.
- Filter donations by location.
- Highlight urgent collection opportunities.

Future improvements:

- Real-time geolocation.
- Map integration.
- Distance-based matching.
- Route optimisation.

Location-based features will require appropriate location permissions and backend or mapping service integration.

### 5. QR Collection Verification

A collection coordination feature designed to improve transparency.

Proposed workflow:

1. An NGO requests a donation.
2. The donor accepts the request.
3. A collection code or QR code is generated.
4. The authorised collector presents the code during handover.
5. The donor or authorised party verifies the collection.
6. The donation status is updated.
7. The completed donation is recorded in the history.

Benefits:

- Better collection records.
- Reduced confusion during handover.
- Improved coordination.
- Transparent donation history.

A secure implementation requires server-generated, one-time verification tokens, expiry rules, and backend validation. Frontend-only codes are demonstration features, not security mechanisms.

### 6. Food Impact Calculator

A dashboard to understand the platform's estimated social impact.

Metrics:

- Total food donated.
- Total completed donations.
- Available donations.
- Collected donations.
- Estimated meals supported.
- Estimated food waste avoided.
- Participating organisations.

Impact calculations must use documented assumptions.

For example, estimated meals supported can be calculated using a configurable quantity-per-meal assumption.

Do not present estimates as independently measured results.

### 7. Expiry and Collection Alerts

A system to help users identify urgent donations.

Features:

- Collection deadline countdown.
- Urgent donation indicators.
- Upcoming deadline alerts.
- Expired listing detection.
- Automatic unavailability of expired listings.
- Notification interface.

Future improvements:

- Email notifications.
- SMS notifications.
- Push notifications.
- Scheduled background expiry checks.

### 8. NGO Capacity Management

A feature that helps organisations manage their collection commitments.

NGOs can:

- Set their maximum collection capacity.
- Update available capacity.
- View accepted collection commitments.
- Monitor remaining capacity.
- Track pending requests.
- Avoid accepting requests beyond declared capacity.

The system should validate new requests against the organisation's declared capacity.

### 9. Donation Tracking System

Track each donation through different stages.

Donation statuses:

| Status | Description |
|---|---|
| Available | Donation is open for requests |
| Requested | An organisation has requested collection |
| Accepted | Donor has accepted a request |
| Rejected | Request has been declined |
| Collected | Food handover has been confirmed |
| Completed | Donation process is completed |
| Expired | Collection deadline has passed |

### 10. Notification Centre

A notification interface for important platform activities.

Potential notifications:

- New collection request.
- Request accepted.
- Request rejected.
- Collection deadline approaching.
- Donation successfully collected.
- Organisation verification update.
- Donation expired.

Real-time and external notifications require backend integration.

### 11. Admin Dashboard

An administration interface for managing platform activity.

Features:

- Total users.
- Total donors.
- Total NGOs.
- Total donations.
- Pending organisation verification requests.
- User management.
- Donation management.
- Organisation verification interface.
- Reports and analytics.
- Recent activity.

Actual administrator permissions must be enforced by the backend.

### 12. AI-Powered Food Categorisation

A planned intelligent feature.

Potential capabilities:

- Analyse uploaded food images.
- Suggest food categories.
- Generate suggested descriptions.
- Help donors organise donation listings.

AI-generated information must be reviewed and confirmed by the donor.

AI must never independently certify food as safe or determine whether it is suitable for consumption.

### 13. Multilingual Support

FoodBridge aims to support communities with different language preferences.

Planned languages:

- English.
- Hindi.
- Additional regional and international languages.

The interface should be designed so additional languages can be added without rewriting the entire application.

### 14. Additional Features

Other planned capabilities:

- Volunteer coordination.
- Bulk donation uploads.
- Recurring donations.
- Donor reputation and donation history.
- Organisation capacity reports.
- Downloadable donation records.
- Search and filtering.
- Responsive mobile interface.
- Dark and light themes.
- Accessibility improvements.

---

## 👥 User Roles

### Food Donors

Examples:

- Restaurants.
- Hotels.
- Hostels.
- Supermarkets.
- Event organisers.
- Food businesses.

Responsibilities:

- Provide accurate food information.
- Publish available surplus food.
- Disclose preparation time, storage conditions, and allergens.
- Set realistic collection deadlines.
- Coordinate collection requests.

### NGOs and Community Organisations

Responsibilities:

- Provide accurate organisation information.
- Complete the verification process.
- Browse suitable donations.
- Request collection.
- Coordinate responsible distribution.
- Confirm completed collections.

### Platform Administrators

Responsibilities:

- Review organisation verification submissions.
- Manage user accounts.
- Monitor donation listings.
- Handle reports.
- Maintain platform integrity.

---

## 🔄 How FoodBridge Works

```mermaid
flowchart TD
    A[Food Donor] --> B[Create Food Donation]
    B --> C[Publish Donation]
    C --> D[FoodBridge Platform]
    D --> E[Verified NGO Browses Donation]
    E --> F[Request Collection]
    F --> G[Donor Reviews Request]
    G --> H{Request Accepted?}
    H -->|Yes| I[Collection Scheduled]
    H -->|No| J[Request Rejected]
    I --> K[QR / Collection Verification]
    K --> L[Food Collected]
    L --> M[Donation Completed]
```

### Example Use Case

A restaurant has surplus food after its daily operations.

1. The restaurant logs into FoodBridge.
2. It creates a donation listing.
3. The platform makes the listing available to eligible organisations.
4. A verified NGO discovers the donation.
5. The NGO requests collection.
6. The restaurant accepts the request.
7. Both parties coordinate collection.
8. The handover is confirmed.
9. The donation is marked completed.

This process helps coordinate surplus food redistribution.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend interactions |
| Lucide / Font Awesome | Icons |
| Google Fonts | Typography |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web framework and API development |
| SQLite | Database storage |

### Development Tools

| Tool | Purpose |
|---|---|
| Git | Version control |
| GitHub | Open-source collaboration |
| VS Code | Code editor |
| Antigravity | AI-assisted development |
| Browser Developer Tools | Debugging and testing |

### Future Integrations

- Mapping services.
- AI image classification APIs.
- Email and notification services.
- QR code generation and verification.
- Data visualisation tools.

---

## 🏗️ Project Architecture

FoodBridge follows a frontend-backend architecture.

```mermaid
flowchart TD
    A[Users] --> B[Frontend]
    B --> C[HTML CSS JavaScript]
    C --> D[Flask API]
    D --> E[Authentication and Authorisation]
    D --> F[Donation Management]
    D --> G[Organisation Management]
    D --> H[Collection Verification]
    D --> I[Impact Analytics]
    E --> J[(SQLite Database)]
    F --> J
    G --> J
    H --> J
    I --> J
```

The frontend handles user interaction and presentation.

The Flask backend will handle business logic, authentication, permissions, validation, and database operations.

SQLite will store user, organisation, donation, and collection information.

---

## 💻 Installation and Setup

### Prerequisites

Install the following:

- Python 3.10 or newer.
- Git.
- Visual Studio Code or another code editor.
- A modern web browser.

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/FoodBridge.git
```

Replace `YOUR-USERNAME` with the actual GitHub username or repository owner.

### Step 2: Enter the Project Directory

```bash
cd FoodBridge
```

### Step 3: Create a Virtual Environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Step 4: Install Dependencies

Once the Flask backend and `requirements.txt` have been created:

```bash
pip install -r requirements.txt
```

### Step 5: Run the Backend

Once the Flask application is implemented:

```bash
python app.py
```

### Step 6: Open the Frontend

If the frontend is standalone, open `index.html` in your browser or use the VS Code Live Server extension.

When Flask API integration is complete, use the configured Flask development server and API endpoints.

**Note:** The exact run instructions may change as the project architecture develops.

---

## 📁 Project Structure

The proposed project structure:

```text
FoodBridge/
│
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── browse.html
│   ├── login.html
│   ├── register.html
│   ├── donation-details.html
│   ├── donor-dashboard.html
│   ├── ngo-dashboard.html
│   ├── admin-dashboard.html
│   ├── profile.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── dashboard.js
│   │   └── storage.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── routes/
│   └── requirements.txt
│
├── tests/
│
├── docs/
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

The actual folder structure may evolve during development.

---

## 🗄️ Database Design

The planned SQLite database may contain the following tables.

### Users

| Field | Description |
|---|---|
| user_id | Unique user identifier |
| name | Full name |
| email | User email |
| password_hash | Secure password hash |
| role | Donor, NGO, or Admin |
| created_at | Account creation time |

### Organisations

| Field | Description |
|---|---|
| organisation_id | Unique organisation ID |
| user_id | Associated user |
| organisation_name | Organisation name |
| organisation_type | Organisation category |
| service_area | Operating location |
| verification_status | Pending, verified, or rejected |
| collection_capacity | Declared collection capacity |

### Donations

| Field | Description |
|---|---|
| donation_id | Unique donation ID |
| donor_id | Donor reference |
| food_name | Food name |
| description | Food details |
| category | Food category |
| quantity | Available quantity |
| unit | Measurement unit |
| preparation_time | Preparation information |
| storage_conditions | Storage details |
| allergens | Allergen information |
| pickup_location | Restricted pickup information |
| collection_deadline | Pickup deadline |
| status | Current donation status |

### Collection Requests

| Field | Description |
|---|---|
| request_id | Unique request ID |
| donation_id | Donation reference |
| organisation_id | Requesting organisation |
| request_status | Current request status |
| requested_at | Request creation time |
| collection_time | Agreed collection time |

### Collection Verifications

| Field | Description |
|---|---|
| verification_id | Unique verification ID |
| request_id | Collection request reference |
| token_hash | Secure token hash |
| expires_at | Token expiry time |
| verified_at | Verification time |
| verified_by | Authorised user |

Additional tables may be introduced for notifications, activity logs, and impact records.

---

## 🥗 Food Safety and Trust

FoodBridge is a coordination platform, not a food safety certification authority.

The platform should collect relevant food information, including:

- Food preparation date and time.
- Storage conditions.
- Allergen details.
- Collection deadline.
- Donor information.
- Responsible collection organisation.

Important principles:

1. Donors must provide accurate information.
2. Food safety requirements must be followed.
3. Applicable local regulations must be respected.
4. Expired listings must not remain available for collection.
5. FoodBridge must not automatically certify food as safe.
6. Only appropriately authorised and verified organisations should access restricted collection information.

For development and deployment in India, the project should account for applicable FSSAI requirements, including the Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019.

---

## 🔐 Security and Privacy

Security is important because FoodBridge handles user and organisation information.

Planned security measures:

- Password hashing.
- Server-side input validation.
- Role-based authorisation.
- Secure session management.
- Restricted access to pickup information.
- Server-side donation ownership checks.
- Secure collection verification tokens.
- Protection against unauthorised data modification.
- Minimal personal data collection.
- Safe handling of uploaded images.
- Environment variables for sensitive configuration.
- No passwords, API keys, or secrets committed to GitHub.

Frontend-only checks are not security controls. Important permissions must be enforced by Flask.

---

## 🔮 Future Enhancements

FoodBridge is designed with future expansion in mind.

### Artificial Intelligence

- AI-assisted food categorisation.
- Image-based food category suggestions.
- Automated donation description suggestions.
- Demand forecasting.
- Smart donor–NGO matching.

### Location Intelligence

- Real-time location discovery.
- Nearby donation recommendations.
- Distance-based matching.
- Collection route suggestions.

### Community Features

- Volunteer coordination.
- Organisation partnerships.
- Community impact reporting.
- Recurring donation schedules.
- Donor contribution history.

### Global Adaptability

- Multilingual interface.
- Multiple currencies.
- Local measurement units.
- Time-zone support.
- Region-specific food safety rules.
- Configurable organisation verification workflows.

### Platform Expansion

- Mobile application.
- Advanced notification system.
- More scalable backend infrastructure.
- Data analytics.
- Public impact reports.

---

## 🗺️ Development Roadmap

| Phase | Development Goals |
|---|---|
| Phase 1 | Landing page, authentication UI, donor and NGO dashboards |
| Phase 2 | Donation creation, browsing, searching, and collection requests |
| Phase 3 | Flask backend and SQLite integration |
| Phase 4 | Nearby donation finder and QR collection verification |
| Phase 5 | Expiry alerts, impact calculator, and NGO capacity management |
| Phase 6 | AI categorisation and multilingual support |
| Phase 7 | Testing, security improvements, and supervised pilot |
| Phase 8 | Multi-location expansion and startup development |

Features are planned development goals, not claims that every feature is already implemented.

---

## 🤝 Contributing

FoodBridge is an open-source project. Contributions, suggestions, bug reports, and improvements are welcome.

You can contribute by:

- Reporting bugs.
- Suggesting new features.
- Improving the user interface.
- Improving accessibility.
- Optimising frontend performance.
- Developing backend APIs.
- Improving database design.
- Writing documentation.
- Adding tests.
- Improving security.

### Contribution Process

1. Fork the repository.
2. Clone your fork.
3. Create a new feature branch.
4. Make your changes.
5. Test your implementation.
6. Commit your changes.
7. Push your branch.
8. Open a Pull Request.

Example:

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

Please keep contributions focused, documented, and tested.

---

## 📜 License

FoodBridge is intended to be an open-source project.

The repository should use the **MIT License** once the license file has been added and the project owner has confirmed that licensing choice.

See the `LICENSE` file for the applicable terms.

---

## 🌱 Project Vision

We believe that surplus food should have an opportunity to reach people who need it instead of being unnecessarily wasted.

FoodBridge aims to use technology to simplify the connection between food donors and community organisations.

Our long-term vision is to create an adaptable, transparent, and community-driven food redistribution ecosystem that can be used across different cities and communities.

**Every donation matters. Every connection counts. Every meal deserves a chance.**

<p align="center">
  <strong>FoodBridge – Turning Surplus Into Smiles. 🌍</strong>
</p>

<p align="center">
  Built with ❤️ for communities, sustainability, and a better future.
</p>

---

## 📬 Contact and Project Links

**Project:** FoodBridge

**Repository:** Add your GitHub repository URL here.

**Project Maintainer:** Add your name and contact details here.

**Project Status:** In Development
