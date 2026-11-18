import type { SubscriptionPlan } from '../types/index.ts';

export const DELIVERY_AREAS = [
  { name: 'Panaiyur & Uthandi (ECR)', window: '20–30 min' },
  { name: 'Neelankarai & Vettuvankeni', window: '20–30 min' },
  { name: 'Injambakkam & Akkarai', window: '20–30 min' },
  { name: 'Palavakkam & Kottivakkam', window: '25–35 min' },
  { name: 'Thiruvanmiyur & Besant Nagar', window: '30–40 min' },
  { name: 'Sholinganallur & Karapakkam (OMR)', window: '25–35 min' },
];

export const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Kavya Subramanian',
    neighborhood: 'Product Designer, Neelankarai (ECR)',
    dish: 'Idly (2 pcs) & Pongal',
    quote:
      'Before Tiffinbox Stories opened in Panaiyur, weekday mornings along ECR meant skipping breakfast or driving out to Thiruvanmiyur. Their idlies and ghee-tempered pongal arrive genuinely warm at 8:15 AM—food that truly feels like home.',
  },
  {
    id: 'rev-2',
    name: 'Arjun Natarajan',
    neighborhood: 'Architect, Panaiyur (ECR)',
    dish: 'Tamil Nadu Meals',
    quote:
      'Having their cloud kitchen right here in Panaiyur has changed our studio lunches. Every course in the Tamil Nadu Meals box—especially the vatha kuzhambu, rasam, and poriyal—tastes like a proper family lunch.',
  },
  {
    id: 'rev-3',
    name: 'Priya Venkataraman',
    neighborhood: 'Pediatrician, Injambakkam (ECR)',
    dish: 'Aappam (3 pcs), Kuruma',
    quote:
      'Coming home along East Coast Road after an evening clinic shift to lacy warm aappams and gently spiced coconut kuruma has been a lifesaver. Every box feels cooked with quiet care.',
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-weekly-morning',
    title: 'Morning Tiffin Ritual',
    cadence: 'Weekly',
    dietary: 'Veg',
    mealsIncluded: '6 Morning Breakfasts (Mon–Sat)',
    price: 540,
    perMealNote: '₹90 per morning box · Save 14%',
    description:
      'Wake up along ECR & OMR to rotating stone-ground idlies, pongal, crispy dosas, poori, and medhu vada delivered warm from our Panaiyur kitchen between 7:30 AM and 9:00 AM.',
    highlights: [
      'Rotating daily menu from Idly, Pongal, Masala Dosa & Vada',
      'Pause or skip any morning before 8 PM the prior night',
      'Zero delivery fee across Panaiyur, ECR & Sholinganallur',
    ],
  },
  {
    id: 'plan-monthly-meals',
    title: 'Tamil Nadu Meals Club',
    cadence: 'Monthly',
    dietary: 'Veg',
    mealsIncluded: '24 Midday Lunches (Mon–Sat)',
    price: 4990,
    perMealNote: '₹208 per meal · Save 17%',
    description:
      'Our signature full Tamil Nadu Meals (Sambar, Vatha Kuzhambu, Rasam, Mor, Poriyal, Kootu, Appalam, Curd, Pickle) interleaved with Puliyodharai & Curd Rice days.',
    highlights: [
      'Full 9-item homestyle Tamil Nadu Meals 4 days a week',
      'Lemon Rice, Puliyodharai & Curd Rice variety bowls twice a week',
      'Up to 4 meal pauses or address swaps per month',
    ],
    featured: true,
  },
  {
    id: 'plan-weekly-dinner',
    title: 'Evening Tiffin Comfort',
    cadence: 'Weekly',
    dietary: 'Veg',
    mealsIncluded: '6 Dinners (Mon–Sat)',
    price: 780,
    perMealNote: '₹130 per dinner · Save 13%',
    description:
      'Light, wholesome home-style dinners rotating between Aappam & Kuruma, Idiyappam & Kuruma, Chapathi & Kuruma, Ghee Roast, and Onion Uthappam.',
    highlights: [
      'Cooked fresh in the evening batch with zero preservatives',
      'Custom low-oil or mild-spice notes saved to your profile',
      'Delivered warm across ECR & OMR in thermal packs',
    ],
  },
  {
    id: 'plan-monthly-full-day',
    title: 'Full-Day Home Tiffin',
    cadence: 'Monthly',
    dietary: 'Veg',
    mealsIncluded: '48 Meals · Breakfast + Lunch or Dinner (Mon–Sat)',
    price: 7200,
    perMealNote: '₹150 per meal · Save 20%',
    description:
      'Complete daily nourishment for families, remote workers, and seniors around Panaiyur and ECR looking for honest Tamil Nadu home-style cooking twice a day.',
    highlights: [
      'Includes morning breakfast + Tamil Nadu Meals or evening tiffin',
      'Dedicated Panaiyur kitchen coordinator via WhatsApp',
      'Up to 8 carry-forward meal credits each month',
    ],
  },
];

export const KITCHEN_COOKS = [
  {
    name: 'Meenakshi Amma',
    region: 'Madurai & Thanjavur',
    specialty: 'Idly, Medhu Vada & Tamil Nadu Meals',
    years: '34 years of home cooking',
  },
  {
    name: 'Sundari Patti',
    region: 'Kumbakonam & Srirangam',
    specialty: 'Ven Pongal, Puliyodharai & Lemon Rice',
    years: '29 years in heirloom kitchens',
  },
  {
    name: 'Mariamma Chacko',
    region: 'Nagercoil, Tamil Nadu',
    specialty: 'Aappam, Idiyappam & Coconut Kuruma',
    years: '28 years of coastal cooking',
  },
  {
    name: 'Lakshmi Narayanan',
    region: 'Trichy & Pollachi',
    specialty: 'Onion Uthappam, Poori & Thakkali Thokku',
    years: '21 years perfecting tiffin staples',
  },
];
