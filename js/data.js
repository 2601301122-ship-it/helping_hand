/**
 * FoodBridge - Initial Sample Seed Data
 * Clearly labeled realistic demo data for hackathon demonstration.
 */

const DEMO_REFERENCE_TIME = Date.now();

function demoDate(hoursFromNow) {
  return new Date(DEMO_REFERENCE_TIME + hoursFromNow * 60 * 60 * 1000).toISOString();
}

const SEED_USERS = [
  {
    id: "usr_donor_1",
    name: "Chef Marcus Vance",
    email: "marcus@grandheritagehotel.com",
    role: "donor",
    organization: "Grand Heritage Palace & Banquets",
    orgType: "Hotel & Banquet",
    phone: "+1 (555) 234-5678",
    city: "Metro Central",
    avatar: "MV",
    verified: true
  },
  {
    id: "usr_donor_2",
    name: "Priya Sharma",
    email: "priya@greenrootsbistro.com",
    role: "donor",
    organization: "Green Roots Artisan Bistro",
    orgType: "Restaurant",
    phone: "+1 (555) 876-5432",
    city: "Westside Market District",
    avatar: "PS",
    verified: true
  },
  {
    id: "usr_ngo_1",
    name: "Elena Rostova",
    email: "elena@hopeharborcommunity.org",
    role: "ngo",
    organization: "Hope Harbor Community Shelter",
    orgType: "Homeless Shelter & Soup Kitchen",
    regNumber: "NGO-REG-2022-8841",
    phone: "+1 (555) 345-6789",
    city: "Metro Central",
    avatar: "ER",
    verified: true, // Verified status
    verificationDate: "2024-03-15",
    servingCapacity: "450 meals/day"
  },
  {
    id: "usr_ngo_2",
    name: "Brother David Kim",
    email: "david@feedthelight.org",
    role: "ngo",
    organization: "Feed The Light Outreach",
    orgType: "Community Pantry",
    regNumber: "NGO-REG-2024-9102",
    phone: "+1 (555) 901-2345",
    city: "Eastside Suburbs",
    avatar: "DK",
    verified: false,
    verificationStatus: "pending", // Pending admin verification
    submittedAt: "2024-10-28"
  },
  {
    id: "usr_admin_1",
    name: "Alexandria Stone",
    email: "admin@foodbridge.org",
    role: "admin",
    organization: "FoodBridge Platform Administration",
    orgType: "Platform Operations & Food Safety Audit",
    phone: "+1 (555) 000-FOOD",
    city: "Headquarters",
    avatar: "AS",
    verified: true
  }
];

const SEED_DONATIONS = [
  {
    id: "FB-DON-101",
    title: "Surplus Banquet Gourmet Buffet: Roasted Chicken & Rice Pilaf",
    description: "Surplus unserved food from an evening corporate gala. Maintained in commercial insulated hot warmers above 65°C. Packed cleanly in food-grade aluminum chafing trays.",
    category: "Cooked Meals",
    quantity: 45,
    unit: "Servings / Trays",
    approxWeightKg: 28,
    prepDateTime: demoDate(-1),
    pickupDeadline: demoDate(6),
    storageCondition: "Heated Warmer (>60°C)",
    allergens: ["Gluten", "Dairy"],
    dietary: ["Halal Certified"],
    donorId: "usr_donor_1",
    donorName: "Grand Heritage Palace & Banquets",
    donorType: "Hotel & Banquet",
    city: "Metro Central",
    generalLocation: "Metro Central Convention Corridor",
    pickupInstructions: "Disclosed upon NGO acceptance: Security Gate B, Service Loading Dock 3.",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
    status: "Available",
    createdAt: demoDate(-1)
  },
  {
    id: "FB-DON-102",
    title: "Fresh Artisan Sourdough, Baguettes & Pastries",
    description: "Daily surplus from bakery closing inventory. Freshly baked this morning, unsweetened and sweet pastries individually bagged in recyclable wax paper.",
    category: "Bakery",
    quantity: 60,
    unit: "Items / Loaves",
    approxWeightKg: 18,
    prepDateTime: demoDate(-8),
    pickupDeadline: demoDate(20),
    storageCondition: "Ambient / Dry Storage",
    allergens: ["Gluten", "Eggs", "Dairy"],
    dietary: ["Vegetarian"],
    donorId: "usr_donor_2",
    donorName: "Green Roots Artisan Bistro",
    donorType: "Restaurant & Bakery",
    city: "Westside Market District",
    generalLocation: "Westside Organic Market",
    pickupInstructions: "Disclosed upon NGO acceptance: Rear alley entrance, ring bell #2.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    status: "Available",
    createdAt: demoDate(-4)
  },
  {
    id: "FB-DON-103",
    title: "Fresh Organic Vegetable Crates (Spinach, Tomatoes, Carrots)",
    description: "Wholesale surplus farm crates with minor cosmetic blemishes. Perfect culinary grade, harvested yesterday. Needs immediate distribution to soup kitchens.",
    category: "Fresh Produce",
    quantity: 12,
    unit: "Wholesale Crates (~15kg each)",
    approxWeightKg: 180,
    prepDateTime: demoDate(-24),
    pickupDeadline: demoDate(48),
    storageCondition: "Chilled Produce Cooler (4°C - 8°C)",
    allergens: [],
    dietary: ["Vegan", "Organic"],
    donorId: "usr_donor_1",
    donorName: "SuperFresh Hypermarket #14",
    donorType: "Supermarket",
    city: "North Park Logistics",
    generalLocation: "North Industrial Park",
    pickupInstructions: "Warehouse Bay 4. Bring pallet jack or light truck.",
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80",
    status: "Requested",
    requestedBy: "usr_ngo_1",
    requestedOrg: "Hope Harbor Community Shelter",
    createdAt: demoDate(-6)
  },
  {
    id: "FB-DON-104",
    title: "Vegetarian Mediterranean Mezze, Falafel & Hummus Bowls",
    description: "Prepared lunch catering event surplus. Unopened pre-portioned containers packed under clean HACCP standards.",
    category: "Cooked Meals",
    quantity: 35,
    unit: "Individual Bowls",
    approxWeightKg: 14,
    prepDateTime: demoDate(-5),
    pickupDeadline: demoDate(2),
    storageCondition: "Refrigerated (4°C)",
    allergens: ["Sesame"],
    dietary: ["Vegan", "Gluten-Free Option"],
    donorId: "usr_donor_2",
    donorName: "Green Roots Artisan Bistro",
    donorType: "Restaurant",
    city: "Westside Market District",
    generalLocation: "Westside Avenue",
    pickupInstructions: "Kitchen dispatch door near alleyway.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    status: "Accepted",
    acceptedNgoId: "usr_ngo_1",
    acceptedNgoName: "Hope Harbor Community Shelter",
    createdAt: demoDate(-3)
  },
  {
    id: "FB-DON-105",
    title: "Grade-A Whole Pasteurized Milk, Yogurt & Cottage Cheese",
    description: "Short-dated dairy stock from cold inventory rotation. 3-4 days remaining to best-before date. Stored uninterrupted in commercial walk-in chiller at 2°C.",
    category: "Dairy & Packaged",
    quantity: 80,
    unit: "Liters / Tubs",
    approxWeightKg: 65,
    prepDateTime: demoDate(-48),
    pickupDeadline: demoDate(72),
    storageCondition: "Refrigerated (2°C - 4°C)",
    allergens: ["Dairy"],
    dietary: ["Vegetarian"],
    donorId: "usr_donor_1",
    donorName: "Grand Heritage Palace & Banquets",
    donorType: "Hotel Logistics",
    city: "Metro Central",
    generalLocation: "Central Freight Terminal",
    pickupInstructions: "Refrigerated van recommended.",
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80",
    status: "Available",
    createdAt: demoDate(-5)
  },
  {
    id: "FB-DON-106",
    title: "University Hostel Mess: Lentil Dal, Steamed Rice & Chapatis",
    description: "Surplus prepared dinner from student residential campus. Safe, clean, untouched food cooked in high-volume hygienic steam kettles.",
    category: "Cooked Meals",
    quantity: 110,
    unit: "Full Meal Portions",
    approxWeightKg: 55,
    prepDateTime: demoDate(-2),
    pickupDeadline: demoDate(12),
    storageCondition: "Hot Insulated Urns (>65°C)",
    allergens: ["Gluten"],
    dietary: ["Vegetarian"],
    donorId: "usr_donor_1",
    donorName: "Campus Hall Dining Services",
    donorType: "Hostel / University",
    city: "University District",
    generalLocation: "South Quad Gate 3",
    pickupInstructions: "Enter North Dining loading bay, call kitchen manager on arrival.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    status: "Available",
    createdAt: demoDate(-2)
  },
  {
    id: "FB-DON-107",
    title: "Catering Event Assorted Fruit Juices & Sparkling Ciders",
    description: "Unopened sealed glass and carton bottles from charity marathon finish line. Room temperature stable, long shelf life.",
    category: "Beverages",
    quantity: 140,
    unit: "Bottles (500ml)",
    approxWeightKg: 70,
    prepDateTime: demoDate(-120),
    pickupDeadline: demoDate(-24),
    storageCondition: "Ambient / Dry Storage",
    allergens: [],
    dietary: ["Vegan"],
    donorId: "usr_donor_2",
    donorName: "Sports & Event Catering Collective",
    donorType: "Event Organiser",
    city: "Olympic Park",
    generalLocation: "Athletic Village Storage Unit 9",
    pickupInstructions: "Access code sent upon request confirmation.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    status: "Collected",
    collectedBy: "usr_ngo_1",
    collectedAt: demoDate(-24),
    createdAt: demoDate(-120)
  },
  {
    id: "FB-DON-108",
    title: "Packaged Pantry Staples: Canned Legumes, Pasta & Oats",
    description: "Surplus pantry donations from supermarket charity bin clearing. Intact factory-sealed non-perishable goods.",
    category: "Dairy & Packaged",
    quantity: 95,
    unit: "Cans & Packs",
    approxWeightKg: 45,
    prepDateTime: demoDate(-1440),
    pickupDeadline: demoDate(-72),
    storageCondition: "Ambient / Dry Storage",
    allergens: ["Gluten"],
    dietary: ["Vegetarian", "Vegan"],
    donorId: "usr_donor_1",
    donorName: "SuperFresh Hypermarket #14",
    donorType: "Supermarket",
    city: "North Park Logistics",
    generalLocation: "North Industrial Park",
    pickupInstructions: "Customer Service Desk, ask for Community Pantry Lead.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    status: "Completed",
    completedBy: "usr_ngo_1",
    completedAt: demoDate(-72),
    createdAt: demoDate(-144)
  }
];

const SEED_REQUESTS = [
  {
    id: "REQ-901",
    donationId: "FB-DON-103",
    donationTitle: "Fresh Organic Vegetable Crates (Spinach, Tomatoes, Carrots)",
    ngoId: "usr_ngo_1",
    ngoName: "Hope Harbor Community Shelter",
    ngoContact: "Elena Rostova (+1 555-345-6789)",
    servingEstimate: "Approx. 250 evening dinners",
    vehicleType: "Insulated Van (1.5 Ton)",
    estimatedPickupTime: demoDate(4),
    notes: "Our team has standard food transport crates and refrigeration ready.",
    status: "Pending", // Pending Donor acceptance
    createdAt: demoDate(-2)
  },
  {
    id: "REQ-902",
    donationId: "FB-DON-104",
    donationTitle: "Vegetarian Mediterranean Mezze, Falafel & Hummus Bowls",
    ngoId: "usr_ngo_1",
    ngoName: "Hope Harbor Community Shelter",
    ngoContact: "Elena Rostova (+1 555-345-6789)",
    servingEstimate: "35 individuals in transition housing",
    vehicleType: "Station Wagon with Thermal Coolers",
    estimatedPickupTime: demoDate(1),
    notes: "Will arrive in 40 minutes with thermal food bags.",
    status: "Accepted",
    createdAt: demoDate(-1)
  }
];

const SEED_ACTIVITIES = [
  {
    id: "ACT-01",
    text: "Hope Harbor Community Shelter completed pickup of 140 Bottles of Juice from Sports & Event Catering.",
    time: "3 hours ago",
    type: "pickup"
  },
  {
    id: "ACT-02",
    text: "Grand Heritage Palace published a new donation: 45 Servings Gourmet Buffet.",
    time: "5 hours ago",
    type: "donation"
  },
  {
    id: "ACT-03",
    text: "Feed The Light Outreach submitted NGO verification documentation.",
    time: "1 day ago",
    type: "verification"
  },
  {
    id: "ACT-04",
    text: "Green Roots Artisan Bistro accepted collection request REQ-902.",
    time: "1 day ago",
    type: "request"
  }
];
