import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packages = [
  {
    name: 'Basic',
    description: 'Perfect for quick sales - Feature your listing for 7 days',
    price: 9.99,
    durationDays: 7,
    features: [
      'Featured badge on listing',
      'Priority in search results',
      'Highlighted in category pages',
      '7 days of featured visibility',
      'Basic analytics',
    ],
    isActive: true,
  },
  {
    name: 'Standard',
    description: 'Most popular choice - Feature your listing for 30 days',
    price: 29.99,
    durationDays: 30,
    features: [
      'Featured badge on listing',
      'Priority in search results',
      'Highlighted in category pages',
      'Homepage carousel placement',
      '30 days of featured visibility',
      'Detailed analytics dashboard',
      'Social media promotion',
      '2x more views on average',
    ],
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Maximum exposure - Feature your listing for 60 days',
    price: 49.99,
    durationDays: 60,
    features: [
      'Featured badge on listing',
      'Top priority in search results',
      'Highlighted in category pages',
      'Premium homepage placement',
      '60 days of featured visibility',
      'Advanced analytics & insights',
      'Social media promotion',
      'Email blast to interested buyers',
      '3x more views on average',
      'Dedicated support',
    ],
    isActive: true,
  },
];

async function seedPackages() {
  try {
    console.log('🌱 Seeding featured packages...');

    // Clear existing packages (optional, comment out in production)
    await prisma.featuredPackage.deleteMany();
    console.log('✓ Cleared existing packages');

    // Insert packages
    for (const pkg of packages) {
      const created = await prisma.featuredPackage.create({
        data: pkg,
      });
      console.log(`✓ Created package: ${created.name} - $${created.price} CAD`);
    }

    console.log('✅ Featured packages seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedPackages()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedPackages;