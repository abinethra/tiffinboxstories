import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  AdminUserModel,
  CounterModel,
  MenuItemModel,
  MetadataModel,
  OrderModel,
} from './models.ts';
import type { MenuItem } from './types.ts';

const CURRENT_SEED_VERSION = 3;
const RECONNECT_COOLDOWN_MS = 15000;
let connectionPromise: Promise<void> | null = null;
let lastConnectionError: string | null = null;
let lastFailedAt = 0;

function resolveMongoUrl(): string | undefined {
  if (process.env.MONGODB_URL?.trim()) {
    return process.env.MONGODB_URL.trim();
  }
  if (process.env.mongodb_url?.trim()) {
    return process.env.mongodb_url.trim();
  }
  if (process.env.DB_PATH?.trim().startsWith('mongodb')) {
    return process.env.DB_PATH.trim();
  }
  return undefined;
}

export function getDatabaseStatus(): { ready: boolean; error: string | null } {
  return {
    ready: mongoose.connection.readyState === 1,
    error: lastConnectionError,
  };
}

/**
 * 23 seeded Tamil Nadu / South Indian home-style tiffin dishes matching the
 * Tiffinbox Stories Breakfast, Lunch, and Dinner menu & rates, each with a
 * dish-accurate photograph.
 */
function getSeedMenuItems(): Array<Omit<MenuItem, 'createdAt' | 'updatedAt'>> {
  return [
    {
      id: 'breakfast-idly',
      name: 'Idly (2 pcs)',
      description:
        'Two pillowy steamed rice-and-lentil idlies served warm with fresh coconut chutney, tomato chutney, and home-style sambar.',
      price: 50,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_mallige_idli_1794992174801.jpg',
      cookName: 'Meenakshi Amma',
      origin: 'Madurai, Tamil Nadu',
      story:
        'Ground in a wet stone grinder at dawn in our Panaiyur kitchen and steamed over unbleached cotton cloth, Meenakshi Amma’s idlies stay soft enough to break with the back of a spoon.',
      isTodaySpecial: true,
      isAvailable: true,
    },
    {
      id: 'breakfast-dosa',
      name: 'Dosa',
      description:
        'Classic golden-crisp fermented rice and urad dal dosa served with coconut chutney, kara chutney, and vegetable sambar.',
      price: 120,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_plain_dosa_1794995971651.jpg',
      cookName: 'Sundari Patti',
      origin: 'Kumbakonam, Tamil Nadu',
      story:
        'Spread on a seasoned iron tawa that has been cured for fifteen years, our classic dosa balances a lacy crisp edge with a tender, tangy fermented centre.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-onion-dosa',
      name: 'Onion Dosa',
      description:
        'Crisp golden dosa topped with finely chopped shallots, green chillies, curry leaves, and fresh coriander.',
      price: 140,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_onion_dosa_1794995972619.jpg',
      cookName: 'Sundari Patti',
      origin: 'Coimbatore, Tamil Nadu',
      story:
        'Sweated sambar onions caramelize gently right into the batter on the griddle, adding a sweet savoury crunch that pairs effortlessly with spicy red chutney.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-onion-uthappam',
      name: 'Onion Uthappam',
      description:
        'Thick, spongy fermented rice-lentil pancake generously studded with sweet onions, green chillies, and curry leaves.',
      price: 150,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_onion_uthappam_1794995971969.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Trichy, Tamil Nadu',
      story:
        'Cooked covered on a low flame just like at home on Sunday mornings, so the batter rises thick and pillowy while the onions blister lightly on top.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-ghee-roast',
      name: 'Ghee Roast',
      description:
        'Paper-thin crispy dosa roasted slowly with aromatic cultured cow ghee until deeply golden, served with three chutneys and sambar.',
      price: 180,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_ghee_roast_1794995971959.jpg',
      cookName: 'Raghavendra Rao',
      origin: 'Erode, Tamil Nadu',
      story:
        'Brushed with hand-clarified cow ghee along the edges at high heat, this roast crackles on first bite and fills the room with nutty aroma.',
      isTodaySpecial: true,
      isAvailable: true,
    },
    {
      id: 'breakfast-masala-dosa',
      name: 'Masala Dosa',
      description:
        'Crisp dosa folded around warm turmeric-spiced potato masala tempered with mustard seeds, chana dal, and curry leaves.',
      price: 150,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_ghee_masala_dosa_1794992174876.jpg',
      cookName: 'Raghavendra Rao',
      origin: 'Chennai, Tamil Nadu',
      story:
        'Our potato filling is mashed by hand with slow-sautéed onions and fresh curry leaves—never watery, never overly spiced—tucked inside a crisp golden shell.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-pongal',
      name: 'Pongal',
      description:
        'Comforting Ven Pongal of new-harvest rice and split moong dal tempered with whole black pepper, cumin, cashews, and ghee.',
      price: 100,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_ven_pongal_1794992176079.jpg',
      cookName: 'Sundari Patti',
      origin: 'Thanjavur, Tamil Nadu',
      story:
        'Inspired by early morning Cauvery-delta temple kitchens, Sundari Patti crushes whole peppercorns in a stone mortar seconds before pouring sizzling ghee over the pot.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-poori',
      name: 'Poori (2 pcs)',
      description:
        'Two puffed golden whole-wheat pooris served hot alongside mildly spiced potato-onion masala and coconut chutney.',
      price: 100,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_poori_masala_1794995972546.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Salem, Tamil Nadu',
      story:
        'Rolled fresh from stone-milled whole wheat dough with a hint of semolina so each poori puffs cleanly without soaking up excess oil.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-medhu-vada',
      name: 'Medhu Vada (2 pcs)',
      description:
        'Two crisp golden urad dal fritters flecked with cracked black pepper, ginger, and curry leaves, with chutney and sambar.',
      price: 80,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_medu_vada_1794992175540.jpg',
      cookName: 'Meenakshi Amma',
      origin: 'Madurai, Tamil Nadu',
      story:
        'Whipped with ice-cold water for twenty-five minutes in a stone grinder so the outside stays audibly crisp while the inside stays cloud-light.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'breakfast-paruppu-vada',
      name: 'Paruppu Vada (2 pcs)',
      description:
        'Two crunchy chana dal masala vadas spiced with fennel seeds, red chillies, shallots, and fresh curry leaves.',
      price: 80,
      dietary: 'veg',
      mealType: 'Breakfast',
      imageUrl: '/src/assets/images/dish_paruppu_vada_1794995972836.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Tirunelveli, Tamil Nadu',
      story:
        'Coarsely pulsed Bengal gram mixed with crushed fennel and crisp shallots—the unmistakable tiffin-side favourite from southern Tamil Nadu.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'lunch-tamil-nadu-meals',
      name: 'Tamil Nadu Meals',
      description:
        'Complete homestyle thali with steamed rice, Sambar, Vatha Kuzhambu, Rasam, Mor, Poriyal, Kootu, Appalam, Curd, and Pickle.',
      price: 250,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_tamil_nadu_meals_1794995973476.jpg',
      cookName: 'Meenakshi Amma',
      origin: 'Thanjavur, Tamil Nadu',
      story:
        'Our flagship midday tiffin carrier: nine balanced flavours—tangy sundakkai vatha kuzhambu, peppery tomato rasam, seasonal poriyal, and cooling buttermilk—packed separately so every course tastes fresh.',
      isTodaySpecial: true,
      isAvailable: true,
    },
    {
      id: 'lunch-lemon-rice',
      name: 'Lemon Rice',
      description:
        'Fragrant turmeric-tinted rice tossed with fresh lemon juice, roasted peanuts, chana dal, mustard seeds, and curry leaves.',
      price: 100,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_lemon_rice_1794995973757.jpg',
      cookName: 'Sundari Patti',
      origin: 'Kanchipuram, Tamil Nadu',
      story:
        'Prepared the way family coastal-drive tiffins were packed in brass boxes—bright citrus squeezed only after the rice cools slightly so the aroma stays vibrant.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'lunch-puliyodharai',
      name: 'Puliyodharai',
      description:
        'Traditional temple-style tamarind rice slow-cooked with sesame oil, roasted fenugreek, coriander, peanuts, and red chillies.',
      price: 120,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_puliyodharai_1794995974541.jpg',
      cookName: 'Sundari Patti',
      origin: 'Srirangam, Tamil Nadu',
      story:
        'Sundari Patti reduces aged tamarind pulp with cold-pressed gingelly oil and freshly roasted sesame-fenugreek powder—a recipe that only deepens in flavour by noon.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'lunch-tomato-rice',
      name: 'Tomato Rice',
      description:
        'Spiced South Indian thakkali sadam simmered with ripe country tomatoes, shallots, ginger-garlic, mint, and whole spices.',
      price: 120,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_tomato_rice_1794995975083.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Madurai, Tamil Nadu',
      story:
        'Cooked with tart country naatu tomatoes and fragrant fennel-cinnamon tempering, served with cool onion raita and crisp appalam.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'lunch-curd-rice',
      name: 'Curd Rice',
      description:
        'Creamy Thayir Sadam folded with fresh farm curd, milk, mustard-curry leaf tempering, ginger, and traditional mango pickle.',
      price: 100,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_curd_rice_1794992176983.jpg',
      cookName: 'Meenakshi Amma',
      origin: 'Srirangam, Tamil Nadu',
      story:
        'Whisked warm with milk before adding cultured curd so it arrives silky and cool along ECR without ever turning sour during midday delivery.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'lunch-chapathi-thokku',
      name: 'Chapathi (2 pcs) with Thakkali Thokku',
      description:
        'Two soft home-style whole-wheat chapathis paired with slow-cooked tangy-spiced tomato thokku tempered in gingelly oil.',
      price: 120,
      dietary: 'veg',
      mealType: 'Lunch',
      imageUrl: '/src/assets/images/dish_chapathi_thokku_1794995974972.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Pollachi, Tamil Nadu',
      story:
        'Our thakkali thokku is simmered down for ninety minutes until the country tomatoes jam into a glossy, comforting relish that hugs soft chapathis.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-idly',
      name: 'Idly (2 pcs)',
      description:
        'Light, easy-to-digest evening steamed idlies served hot with freshly ground coconut chutney and warm sambar.',
      price: 50,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_mallige_idli_1794992174801.jpg',
      cookName: 'Meenakshi Amma',
      origin: 'Madurai, Tamil Nadu',
      story:
        'Steamed fresh for the evening batch—a gentle, comforting end to a long workday just like a warm home dinner.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-dosa',
      name: 'Dosa',
      description:
        'Evening-batch crisp dosa cooked fresh to order on our seasoned iron tawa, paired with chutney and sambar.',
      price: 120,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_plain_dosa_1794995971651.jpg',
      cookName: 'Sundari Patti',
      origin: 'Kumbakonam, Tamil Nadu',
      story:
        'Fermented from our afternoon stone-ground batch so every evening dosa carries bright warmth and crispness.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-aappam-kuruma',
      name: 'Aappam (3 pcs), Kuruma',
      description:
        'Three lacy-edged rice hoppers with soft fluffy centres served alongside fragrant coconut-cashew vegetable kuruma.',
      price: 150,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_appam_stew_1794992177677.jpg',
      cookName: 'Mariamma Chacko',
      origin: 'Nagercoil, Tamil Nadu',
      story:
        'Mariamma swirls fermented rice-and-coconut batter in curved iron aappachattis each evening, pairing them with a creamy fennel-and-poppy-seed vegetable kuruma.',
      isTodaySpecial: true,
      isAvailable: true,
    },
    {
      id: 'dinner-idiyappam-kuruma',
      name: 'Idiyappam (3 pcs), Kuruma',
      description:
        'Three delicate steamed rice string-hopper nests paired with aromatic South Indian vegetable kuruma.',
      price: 150,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_idiyappam_kuruma_1794995975934.jpg',
      cookName: 'Mariamma Chacko',
      origin: 'Karaikudi, Tamil Nadu',
      story:
        'Hand-pressed through brass moulds over boiling water using roasted rice flour, creating feather-light strands that soak up spiced coconut kuruma effortlessly.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-chapathi-kuruma',
      name: 'Chapathi (2 pcs), Kuruma',
      description:
        'Two soft whole-wheat chapathis served hot with rich Chettinad-style coconut and mixed vegetable kuruma.',
      price: 180,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_chapathi_kuruma_1794995976107.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Karaikudi, Tamil Nadu',
      story:
        'Freshly rolled chapathis paired with a slow-simmered kuruma ground from fresh coconut, roasted gram, fennel, and star anise.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-ghee-roast',
      name: 'Ghee Roast',
      description:
        'Evening crisp ghee roast dosa with fragrant cultured cow ghee, served with sambar and freshly ground chutneys.',
      price: 180,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_ghee_roast_1794995971959.jpg',
      cookName: 'Raghavendra Rao',
      origin: 'Erode, Tamil Nadu',
      story:
        'Our signature crisp evening indulgence—slow-roasted in pure ghee until amber and aromatic.',
      isTodaySpecial: false,
      isAvailable: true,
    },
    {
      id: 'dinner-onion-uthappam',
      name: 'Onion Uthappam',
      description:
        'Warm, comforting thick uthappam topped with caramelized shallots, green chillies, and fresh curry leaves.',
      price: 150,
      dietary: 'veg',
      mealType: 'Dinner',
      imageUrl: '/src/assets/images/dish_onion_uthappam_1794995971969.jpg',
      cookName: 'Lakshmi Narayanan',
      origin: 'Trichy, Tamil Nadu',
      story:
        'Hearty enough to be a complete dinner on its own, finished with a brush of gingelly oil and crisp sambar onions.',
      isTodaySpecial: false,
      isAvailable: true,
    },
  ];
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function getNextOrderId(): Promise<string> {
  const counter = await CounterModel.findByIdAndUpdate(
    'orderSequence',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TBS-${counter.seq}`;
}

async function seedDatabaseIfNeeded(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tiffinboxstories.in').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'tiffin-kitchen-2026';

  const existingAdminCount = await AdminUserModel.countDocuments();
  if (existingAdminCount === 0) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    await AdminUserModel.create({
      id: 'admin-1',
      email: adminEmail,
      name: 'Kitchen Manager',
      passwordHash,
    });
  }

  const seedMeta = await MetadataModel.findById('seedState');
  const existingMenuCount = await MenuItemModel.countDocuments();

  if (!seedMeta || seedMeta.seedVersion < CURRENT_SEED_VERSION || existingMenuCount === 0) {
    const seedItems = getSeedMenuItems();
    for (const item of seedItems) {
      await MenuItemModel.findOneAndUpdate(
        { id: item.id },
        { $set: item },
        { upsert: true, new: true }
      );
    }

    await MetadataModel.findByIdAndUpdate(
      'seedState',
      { $set: { seedVersion: CURRENT_SEED_VERSION } },
      { upsert: true }
    );
  }

  const existingOrdersCount = await OrderModel.countDocuments();
  if (existingOrdersCount === 0) {
    await OrderModel.create({
      id: 'TBS-1001',
      customerName: 'Ananya Krishnan',
      phone: '9845012345',
      address: '18, Sea Cliff Avenue, Panaiyur, ECR',
      area: 'Panaiyur & Uthandi (ECR)',
      deliverySlot: 'Morning (7:30 AM – 9:30 AM)',
      notes: 'Please ring the bell once, leave on the veranda bench.',
      items: [
        {
          menuItemId: 'breakfast-idly',
          name: 'Idly (2 pcs)',
          price: 50,
          quantity: 2,
          dietary: 'veg',
        },
        {
          menuItemId: 'breakfast-pongal',
          name: 'Pongal',
          price: 100,
          quantity: 1,
          dietary: 'veg',
        },
        {
          menuItemId: 'breakfast-medhu-vada',
          name: 'Medhu Vada (2 pcs)',
          price: 80,
          quantity: 1,
          dietary: 'veg',
        },
      ],
      subtotal: 280,
      deliveryFee: 35,
      total: 315,
      status: 'Preparing',
    });

    await CounterModel.findByIdAndUpdate(
      'orderSequence',
      { $setOnInsert: { seq: 1001 } },
      { upsert: true }
    );
  } else {
    const counter = await CounterModel.findById('orderSequence');
    if (!counter) {
      await CounterModel.create({ _id: 'orderSequence', seq: 1001 + existingOrdersCount });
    }
  }
}

/**
 * Connects Mongoose to MongoDB Atlas using MONGODB_URL and seeds initial data.
 */
export async function connectToDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    lastConnectionError = null;
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (lastFailedAt > 0 && Date.now() - lastFailedAt < RECONNECT_COOLDOWN_MS) {
    return;
  }

  const mongoUrl = resolveMongoUrl();
  if (!mongoUrl) {
    lastConnectionError =
      'MONGODB_URL is not configured. Set MONGODB_URL in your .env file or AI Studio Secrets.';
    console.warn(lastConnectionError);
    return;
  }

  connectionPromise = (async () => {
    try {
      const dbName = process.env.MONGODB_DB_NAME || 'tiffinbox_stories';
      await mongoose.connect(mongoUrl, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      });
      lastConnectionError = null;
      lastFailedAt = 0;
      console.log(`Connected to MongoDB Atlas database "${dbName}"`);
      await seedDatabaseIfNeeded();
    } catch (err) {
      lastFailedAt = Date.now();
      const rawMessage = err instanceof Error ? err.message : 'Unable to reach MongoDB Atlas.';
      if (
        rawMessage.toLowerCase().includes('bad auth') ||
        rawMessage.toLowerCase().includes('authentication failed')
      ) {
        lastConnectionError =
          'MongoDB Atlas authentication failed (bad auth). Verify the database username and password in MONGODB_URL.';
      } else if (rawMessage.includes('whitelist')) {
        lastConnectionError =
          'Could not reach MongoDB Atlas. Ensure your cluster Network Access allows connections (e.g. 0.0.0.0/0) and MONGODB_URL is valid.';
      } else {
        lastConnectionError = `Could not connect to MongoDB Atlas: ${rawMessage}`;
      }
      throw err;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}
