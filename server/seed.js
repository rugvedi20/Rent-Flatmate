require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Listing = require("./models/Listing");
const ListingImage = require("./models/ListingImage");
const TenantProfile = require("./models/TenantProfile");
const CompatibilityScore = require("./models/CompatibilityScore");
const InterestRequest = require("./models/InterestRequest");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const SavedListing = require("./models/SavedListing");
const SearchHistory = require("./models/SearchHistory");
const AuditLog = require("./models/AuditLog");
const { getOrGenerateCompatibilityBatch } = require("./services/compatibilityAggregator");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rent-flatmate-finder";

const PUNE_CENTROIDS = {
  baner: [73.7997, 18.5590],
  aundh: [73.8078, 18.5626],
  wakad: [73.7570, 18.5987],
  pashan: [73.7963, 18.5372],
  kothrud: [73.8075, 18.5074],
  hinjewadi: [73.7383, 18.5913],
  kharadi: [73.9405, 18.5516],
  "viman nagar": [73.9143, 18.5679],
  "kalyani nagar": [73.9034, 18.5492],
  "koregaon park": [73.8913, 18.5362],
  hadapsar: [73.9272, 18.5089],
  bavdhan: [73.7780, 18.5087],
  erandwane: [73.8312, 18.5113],
  "senapati bapat road": [73.8291, 18.5342],
  ravet: [73.7431, 18.6432],
  "pimple saudagar": [73.7981, 18.5882],
};

const ownersData = [
  { name: "Rahul Sharma", email: "rugvedi.n20@gmail.com", password: "password123", role: "owner" },
  { name: "Amit Patel", email: "owner2@example.com", password: "password123", role: "owner" },
  { name: "Sneha Kulkarni", email: "owner3@example.com", password: "password123", role: "owner" },
  { name: "Priya Nair", email: "owner4@example.com", password: "password123", role: "owner" },
  { name: "Rajesh Gupta", email: "owner5@example.com", password: "password123", role: "owner" },
];

const tenantsData = [
  { name: "Vikram Singh", email: "tenant1@example.com", password: "password123", role: "tenant" },
  { name: "Rohan Mehta", email: "tenant2@example.com", password: "password123", role: "tenant" },
  { name: "Aditi Joshi", email: "tenant3@example.com", password: "password123", role: "tenant" },
  { name: "Neha Gupta", email: "tenant4@example.com", password: "password123", role: "tenant" },
  { name: "Karan Shah", email: "tenant5@example.com", password: "password123", role: "tenant" },
  { name: "Anjali Rao", email: "tenant6@example.com", password: "password123", role: "tenant" },
  { name: "Sanjay Kumar", email: "tenant7@example.com", password: "password123", role: "tenant" },
  { name: "Divya Deshmukh", email: "tenant8@example.com", password: "password123", role: "tenant" },
  { name: "Manish Pandey", email: "tenant9@example.com", password: "password123", role: "tenant" },
  { name: "Pooja Sen", email: "tenant10@example.com", password: "password123", role: "tenant" },
  { name: "Vivek Varma", email: "tenant11@example.com", password: "password123", role: "tenant" },
  { name: "Shreya Iyer", email: "tenant12@example.com", password: "password123", role: "tenant" },
  { name: "Abhishek Mishra", email: "tenant13@example.com", password: "password123", role: "tenant" },
  { name: "Kriti Malhotra", email: "tenant14@example.com", password: "password123", role: "tenant" },
  { name: "Nitin Joshi", email: "tenant15@example.com", password: "password123", role: "tenant" },
];

const rawListings = [
  { title: "Premium 1BHK Flat in Baner", location: "Baner, Pune", rent: 16000, roomType: "1bhk", furnishing: "furnished", key: "baner" },
  { title: "Shared Double Sharing near Aundh", location: "Aundh, Pune", rent: 5500, roomType: "shared", furnishing: "semi-furnished", key: "aundh" },
  { title: "Single Occupancy Room Hinjewadi Phase 1", location: "Hinjewadi, Pune", rent: 8500, roomType: "single", furnishing: "furnished", key: "hinjewadi" },
  { title: "Spacious 2BHK Appt in Kothrud", location: "Kothrud, Pune", rent: 23000, roomType: "2bhk", furnishing: "unfurnished", key: "kothrud" },
  { title: "Affordable Single Bed in Wakad", location: "Wakad, Pune", rent: 7000, roomType: "single", furnishing: "semi-furnished", key: "wakad" },
  { title: "Private Suite Flat in Pashan", location: "Pashan, Pune", rent: 9000, roomType: "single", furnishing: "furnished", key: "pashan" },
  { title: "Cozy 1BHK in Kharadi IT Corridor", location: "Kharadi, Pune", rent: 14000, roomType: "1bhk", furnishing: "semi-furnished", key: "kharadi" },
  { title: "Double Occupancy room Viman Nagar", location: "Viman Nagar, Pune", rent: 6200, roomType: "shared", furnishing: "furnished", key: "viman nagar" },
  { title: "Modern 1BHK Flat Kalyani Nagar", location: "Kalyani Nagar, Pune", rent: 18000, roomType: "1bhk", furnishing: "furnished", key: "kalyani nagar" },
  { title: "Luxurious Single Bed Koregaon Park", location: "Koregaon Park, Pune", rent: 12000, roomType: "single", furnishing: "furnished", key: "koregaon park" },
  { title: "Flat in Hadapsar near Magarpatta", location: "Hadapsar, Pune", rent: 15000, roomType: "2bhk", furnishing: "semi-furnished", key: "hadapsar" },
  { title: "Single Room in Bavdhan Society", location: "Bavdhan, Pune", rent: 8000, roomType: "single", furnishing: "semi-furnished", key: "bavdhan" },
  { title: "Spacious Room in Erandwane Flat", location: "Erandwane, Pune", rent: 9500, roomType: "single", furnishing: "furnished", key: "erandwane" },
  { title: "Shared Accommodation Senapati Bapat Road", location: "Senapati Bapat Road, Pune", rent: 6800, roomType: "shared", furnishing: "furnished", key: "senapati bapat road" },
  { title: "New 1BHK Studio Apartment Ravet", location: "Ravet, Pune", rent: 10000, roomType: "1bhk", furnishing: "unfurnished", key: "ravet" },
  { title: "Single Bed room Pimple Saudagar", location: "Pimple Saudagar, Pune", rent: 8200, roomType: "single", furnishing: "semi-furnished", key: "pimple saudagar" },
  { title: "Cozy Studio Flat in Baner West", location: "Baner, Pune", rent: 11000, roomType: "1bhk", furnishing: "semi-furnished", key: "baner" },
  { title: "Shared Triple Sharing Bed Aundh Circle", location: "Aundh, Pune", rent: 4500, roomType: "shared", furnishing: "furnished", key: "aundh" },
  { title: "Corporate Suite Hinjewadi Phase 3", location: "Hinjewadi, Pune", rent: 10500, roomType: "single", furnishing: "furnished", key: "hinjewadi" },
  { title: "Luxury 2BHK Residency Kothrud Area", location: "Kothrud, Pune", rent: 26000, roomType: "2bhk", furnishing: "furnished", key: "kothrud" },
  { title: "Private Room near Wakad chowk", location: "Wakad, Pune", rent: 7800, roomType: "single", furnishing: "semi-furnished", key: "wakad" },
  { title: "Single Bed in Pashan Gated Society", location: "Pashan, Pune", rent: 8900, roomType: "single", furnishing: "semi-furnished", key: "pashan" },
  { title: "1BHK Flat near Kharadi Bypass", location: "Kharadi, Pune", rent: 12500, roomType: "1bhk", furnishing: "unfurnished", key: "kharadi" },
  { title: "Flatmate Wanted in Viman Nagar Flat", location: "Viman Nagar, Pune", rent: 7500, roomType: "single", furnishing: "semi-furnished", key: "viman nagar" },
  { title: "Elite 1BHK in Kalyani Nagar", location: "Kalyani Nagar, Pune", rent: 20000, roomType: "1bhk", furnishing: "furnished", key: "kalyani nagar" },
  { title: "Charming Single Room Koregaon Park lane", location: "Koregaon Park, Pune", rent: 11000, roomType: "single", furnishing: "semi-furnished", key: "koregaon park" },
  { title: "2BHK Flat in Phursungi Hadapsar", location: "Hadapsar, Pune", rent: 13500, roomType: "2bhk", furnishing: "unfurnished", key: "hadapsar" },
  { title: "Modern Studio Room Bavdhan", location: "Bavdhan, Pune", rent: 9000, roomType: "1bhk", furnishing: "furnished", key: "bavdhan" },
  { title: "Private Room near SB Road Mall", location: "Senapati Bapat Road, Pune", rent: 9200, roomType: "single", furnishing: "furnished", key: "senapati bapat road" },
  { title: "PG Shared Room Pimple Saudagar Area", location: "Pimple Saudagar, Pune", rent: 5200, roomType: "shared", furnishing: "semi-furnished", key: "pimple saudagar" },
];

const rawProfiles = [
  { preferredLocation: "Baner, Pune", budgetMin: 8000, budgetMax: 17000, preferredRoomType: "single", preferredFurnishing: "furnished", key: "baner" },
  { preferredLocation: "Hinjewadi, Pune", budgetMin: 7000, budgetMax: 12000, preferredRoomType: "single", preferredFurnishing: "semi-furnished", key: "hinjewadi" },
  { preferredLocation: "Aundh, Pune", budgetMin: 4000, budgetMax: 8000, preferredRoomType: "shared", preferredFurnishing: "furnished", key: "aundh" },
  { preferredLocation: "Viman Nagar, Pune", budgetMin: 5000, budgetMax: 10000, preferredRoomType: "shared", preferredFurnishing: "semi-furnished", key: "viman nagar" },
  { preferredLocation: "Kharadi, Pune", budgetMin: 9000, budgetMax: 16000, preferredRoomType: "1bhk", preferredFurnishing: "furnished", key: "kharadi" },
  { preferredLocation: "Kothrud, Pune", budgetMin: 14000, budgetMax: 24000, preferredRoomType: "2bhk", preferredFurnishing: "unfurnished", key: "kothrud" },
  { preferredLocation: "Wakad, Pune", budgetMin: 6000, budgetMax: 10000, preferredRoomType: "single", preferredFurnishing: "semi-furnished", key: "wakad" },
  { preferredLocation: "Pashan, Pune", budgetMin: 7000, budgetMax: 11000, preferredRoomType: "single", preferredFurnishing: "furnished", key: "pashan" },
  { preferredLocation: "Kalyani Nagar, Pune", budgetMin: 12000, budgetMax: 22000, preferredRoomType: "1bhk", preferredFurnishing: "furnished", key: "kalyani nagar" },
  { preferredLocation: "Koregaon Park, Pune", budgetMin: 10000, budgetMax: 15000, preferredRoomType: "single", preferredFurnishing: "furnished", key: "koregaon park" },
  { preferredLocation: "Hadapsar, Pune", budgetMin: 12000, budgetMax: 18000, preferredRoomType: "2bhk", preferredFurnishing: "semi-furnished", key: "hadapsar" },
  { preferredLocation: "Bavdhan, Pune", budgetMin: 6000, budgetMax: 10000, preferredRoomType: "single", preferredFurnishing: "semi-furnished", key: "bavdhan" },
  { preferredLocation: "Erandwane, Pune", budgetMin: 8000, budgetMax: 12000, preferredRoomType: "single", preferredFurnishing: "furnished", key: "erandwane" },
  { preferredLocation: "Senapati Bapat Road, Pune", budgetMin: 5000, budgetMax: 10000, preferredRoomType: "shared", preferredFurnishing: "furnished", key: "senapati bapat road" },
  { preferredLocation: "Ravet, Pune", budgetMin: 7000, budgetMax: 11000, preferredRoomType: "1bhk", preferredFurnishing: "unfurnished", key: "ravet" },
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully. Clearing existing collections...");

    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      ListingImage.deleteMany({}),
      TenantProfile.deleteMany({}),
      CompatibilityScore.deleteMany({}),
      InterestRequest.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      SavedListing.deleteMany({}),
      SearchHistory.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log("Collections cleared. Seeding owners...");
    const owners = await User.create(ownersData);
    console.log(`Seeded ${owners.length} owners.`);

    console.log("Seeding tenants...");
    const tenants = await User.create(tenantsData);
    console.log(`Seeded ${tenants.length} tenants.`);

    console.log("Seeding listings...");
    const listings = [];
    for (let i = 0; i < rawListings.length; i++) {
      const ownerIndex = i % owners.length;
      const data = rawListings[i];
      const coords = PUNE_CENTROIDS[data.key] || PUNE_CENTROIDS.pune;

      const listing = await Listing.create({
        title: data.title,
        location: data.location,
        rent: data.rent,
        availableFrom: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000),
        roomType: data.roomType,
        furnishing: data.furnishing,
        description: `Stunning ${data.roomType} room listing situated in high-demand ${data.location}. No smoking allowed. Dedicated parking is available. Pets are negotiable.`,
        locationCoords: { type: "Point", coordinates: coords },
        ownerId: owners[ownerIndex]._id,
        status: "available",
      });

      // Seed association Images in ListingImages
      await ListingImage.create([
        { listingId: listing._id, url: `https://images.unsplash.com/photo-1513694203232?w=500&sig=${i}`, isPrimary: true, caption: "Spacious Living Room" },
        { listingId: listing._id, url: `https://images.unsplash.com/photo-1522708323590?w=500&sig=${i}`, isPrimary: false, caption: "Bedroom View" },
      ]);

      listings.push(listing);
    }
    console.log(`Seeded ${listings.length} listings with detailed ListingImages.`);

    console.log("Seeding tenant profiles...");
    const profiles = [];
    for (let i = 0; i < rawProfiles.length; i++) {
      const data = rawProfiles[i];
      const coords = PUNE_CENTROIDS[data.key] || PUNE_CENTROIDS.pune;

      const profile = await TenantProfile.create({
        tenantId: tenants[i]._id,
        preferredLocation: data.preferredLocation,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        moveInDate: new Date(Date.now() + (i % 10) * 24 * 60 * 60 * 1000),
        preferredRoomType: data.preferredRoomType,
        preferredFurnishing: data.preferredFurnishing,
        parkingRequired: i % 2 === 0,
        petsAllowed: i % 3 === 0,
        smokingAllowed: i % 4 === 0,
        genderPreference: i % 5 === 0 ? "female" : i % 6 === 0 ? "male" : "any",
        notes: `Looking for a friendly place near my work. High priority values: clean kitchen and dedicated bike parking space.`,
        locationCoords: { type: "Point", coordinates: coords },
      });
      profiles.push(profile);
    }
    console.log(`Seeded ${profiles.length} tenant profiles.`);

    console.log("Pre-calculating compatibility cache scores...");
    // Pre-calculate compatibility scores for Tenant 1 (Vikram Singh) and all listings
    const tenant1 = tenants[0];
    const profile1 = profiles[0];
    await getOrGenerateCompatibilityBatch(tenant1._id, listings, profile1);

    console.log("Seeding demo conversations & messages...");
    // Tenant 1 (Vikram) has an accepted interest with Listing 1 (Rahul Owner)
    const listing1 = listings[0];
    const owner1 = owners[0];
    const interest = await InterestRequest.create({
      tenantId: tenant1._id,
      listingId: listing1._id,
      ownerId: owner1._id,
      status: "accepted",
      compatibilityScoreAtRequest: 95,
    });

    const convo = await Conversation.create({
      listingId: listing1._id,
      tenantId: tenant1._id,
      ownerId: owner1._id,
    });

    const msg1 = await Message.create({
      conversationId: convo._id,
      listingId: listing1._id,
      sender: tenant1._id,
      receiver: owner1._id,
      message: "Hi Rahul! I'm interested in your flat in Baner. Can we coordinate a visit tomorrow?",
    });

    const msg2 = await Message.create({
      conversationId: convo._id,
      listingId: listing1._id,
      sender: owner1._id,
      receiver: tenant1._id,
      message: "Hi Vikram! Sure, tomorrow afternoon around 3 PM works fine for me. See you there!",
    });

    convo.lastMessage = msg2._id;
    await convo.save();

    console.log("Seeding notifications...");
    await Notification.create([
      { userId: tenant1._id, type: "interest_request", title: "Request Accepted", body: `Your interest request for "${listing1.title}" has been accepted!` },
      { userId: owner1._id, type: "interest_request", title: "New Match Interest", body: `${tenant1.name} has expressed interest in your flat in Baner.` },
    ]);

    console.log("Seeding saved listings...");
    await SavedListing.create([
      { tenantId: tenant1._id, listingId: listings[0]._id },
      { tenantId: tenant1._id, listingId: listings[1]._id },
    ]);

    console.log("Seeding search history logs...");
    await SearchHistory.create([
      { tenantId: tenant1._id, query: { location: "Baner", minRent: 10000, maxRent: 15000, roomType: "1bhk", furnishing: "furnished" } },
    ]);

    console.log("Seeding system audit logs...");
    await AuditLog.create([
      { userId: tenant1._id, action: "profile_upsert", endpoint: "/api/tenants/profile", ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0" },
      { userId: owner1._id, action: "listing_publish", endpoint: "/api/listings", ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0" },
    ]);

    console.log("\n==================================================");
    console.log("🎉 ENTERPRISE DATABASE SEEDING COMPLETED!");
    console.log("==================================================");
    console.log("\n🔑 DEMO OWNER LOGINS:");
    owners.forEach((o, index) => {
      console.log(`Owner ${index + 1}: ${o.email} / password123 (Name: ${o.name})`);
    });
    console.log("\n🔑 DEMO TENANT LOGINS (Vikram tenant1 is ready with active threads):");
    tenants.slice(0, 5).forEach((t, index) => {
      console.log(`Tenant ${index + 1}: ${t.email} / password123 (Name: ${t.name})`);
    });
    console.log("==================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();
