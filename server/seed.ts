import { storage } from "./storage";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Create demo customers
    const customer1 = await storage.createCustomer({
      name: "Sarah Johnson",
      phone: "+1 (555) 234-5678",
    });

    const customer2 = await storage.createCustomer({
      name: "Michael Chen",
      phone: "+1 (555) 345-6789",
    });

    const customer3 = await storage.createCustomer({
      name: "Emma Rodriguez",
      phone: "+1 (555) 456-7890",
    });

    console.log(`✅ Created ${3} customers`);

    // Create demo help requests
    const request1 = await storage.createHelpRequest({
      customerId: customer1.id,
      question: "Do you offer bridal makeup packages for weddings?",
      status: "pending",
    });

    const request2 = await storage.createHelpRequest({
      customerId: customer2.id,
      question: "Can I get a same-day appointment for men's haircut this afternoon?",
      status: "pending",
    });

    const request3 = await storage.createHelpRequest({
      customerId: customer3.id,
      question: "What's the difference between your regular facial and the deep cleansing facial?",
      status: "resolved",
      answer: "Our regular facial is a 60-minute treatment focusing on cleansing, exfoliation, and hydration. The deep cleansing facial is 75 minutes and includes steam, extractions, and a purifying mask - it's better for acne-prone or congested skin. Both are $80, but the deep cleansing is $95.",
    });

    console.log(`✅ Created ${3} help requests`);

    // Create demo knowledge base entries
    await storage.createKnowledgeBaseEntry({
      question: "Do you accept walk-ins?",
      answer: "Yes, we accept walk-ins based on availability, but we highly recommend booking an appointment to ensure your preferred time and stylist. You can book online or call us at (555) 123-4567.",
      category: "scheduling",
    });

    await storage.createKnowledgeBaseEntry({
      question: "What should I do if I need to cancel my appointment?",
      answer: "We require 24-hour notice for cancellations to avoid a cancellation fee. You can cancel by calling us at (555) 123-4567 or through our online booking system. Same-day cancellations may incur a $25 fee.",
      category: "policies",
    });

    await storage.createKnowledgeBaseEntry({
      question: "Do you sell gift certificates?",
      answer: "Yes! We offer gift certificates in any amount. They make perfect gifts and never expire. You can purchase them in person at our salon or call us to arrange delivery.",
      category: "general",
    });

    await storage.createKnowledgeBaseEntry({
      question: "Can I bring my child to my appointment?",
      answer: "We love kids! However, for safety and to ensure you can fully relax during your service, we kindly ask that children be supervised. If you need to bring your child, please let us know in advance so we can accommodate you.",
      category: "policies",
    });

    await storage.createKnowledgeBaseEntry({
      question: "What products do you use?",
      answer: "We use premium professional products including Redken, Olaplex for hair treatments, OPI for nails, and Dermalogica for skincare. All our products are high-quality and recommended by our stylists.",
      category: "products",
    });

    console.log(`✅ Created ${5} knowledge base entries`);

    console.log("\n✨ Database seeding complete!\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };
