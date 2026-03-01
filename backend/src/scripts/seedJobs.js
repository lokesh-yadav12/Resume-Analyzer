require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const jobsData = require('../../database/seeds/jobs.json');

const seedJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert seed data
    const jobs = await Job.insertMany(jobsData);
    console.log(`Inserted ${jobs.length} jobs`);

    console.log('Job seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();