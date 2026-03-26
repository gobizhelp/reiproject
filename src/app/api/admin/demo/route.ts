import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

const DEMO_ACCOUNTS = [
  {
    email: 'demo-buyer@dealpacket.test',
    password: 'DemoB!2025',
    role: 'buyer' as const,
    name: 'Demo Buyer',
    company: 'Demo Acquisitions LLC',
    phone: '(555) 100-2000',
    buyerTier: 'pro' as const,
    sellerTier: 'free' as const,
  },
  {
    email: 'demo-seller@dealpacket.test',
    password: 'DemoS!2025',
    role: 'seller' as const,
    name: 'Demo Seller',
    company: 'Demo Wholesale Group',
    phone: '(555) 200-3000',
    buyerTier: 'free' as const,
    sellerTier: 'pro' as const,
  },
  {
    email: 'demo-both@dealpacket.test',
    password: 'DemoA!2025',
    role: 'both' as const,
    name: 'Demo Power User',
    company: 'Demo REI Capital',
    phone: '(555) 300-4000',
    buyerTier: 'elite' as const,
    sellerTier: 'elite' as const,
  },
];

const DEMO_PROPERTIES = [
  {
    title: '3-Bed Flip Opportunity in Riverside',
    street_address: '1420 Maple Drive',
    city: 'Riverside',
    state: 'CA',
    zip_code: '92501',
    property_type: 'Single Family',
    beds: 3,
    baths: 2,
    sqft: 1450,
    year_built: 1978,
    lot_size: '6,200 sqft',
    listing_status: 'Available',
    ideal_investor_strategy: 'Fix & Flip',
    asking_price: 285000,
    arv: 410000,
    repair_estimate: 55000,
    assignment_fee: 12000,
    show_assignment_fee: true,
    light_rehab_budget_low: 25000,
    light_rehab_budget_high: 35000,
    full_rehab_budget_low: 50000,
    full_rehab_budget_high: 65000,
    light_rehab_arv: 370000,
    full_rehab_arv_low: 400000,
    full_rehab_arv_high: 420000,
    rent_after_reno_low: 2200,
    rent_after_reno_high: 2500,
    condition_summary: 'Needs cosmetic updates. Kitchen and bathrooms are dated but functional. New roof in 2020.',
    renovation_overview: 'Kitchen remodel, bathroom updates, new flooring throughout, interior paint. Exterior in good shape.',
    why_deal_is_strong: 'Strong ARV comps within 0.5mi. Motivated seller relocating. Below market by $40K+.',
    showing_instructions: 'Call to schedule. Lockbox on front door.',
    contact_name: 'Demo Seller',
    contact_phone: '(555) 200-3000',
    contact_email: 'demo-seller@dealpacket.test',
    status: 'published',
  },
  {
    title: 'BRRRR Deal - Duplex Near Downtown',
    street_address: '782 Oak Street',
    city: 'Tampa',
    state: 'FL',
    zip_code: '33602',
    property_type: 'Multi Family',
    beds: 4,
    baths: 2,
    sqft: 2100,
    year_built: 1965,
    lot_size: '5,800 sqft',
    listing_status: 'Available',
    ideal_investor_strategy: 'BRRRR',
    asking_price: 195000,
    arv: 320000,
    repair_estimate: 70000,
    assignment_fee: 8000,
    show_assignment_fee: false,
    light_rehab_budget_low: 30000,
    light_rehab_budget_high: 45000,
    full_rehab_budget_low: 65000,
    full_rehab_budget_high: 80000,
    light_rehab_arv: 280000,
    full_rehab_arv_low: 310000,
    full_rehab_arv_high: 330000,
    rent_after_reno_low: 2800,
    rent_after_reno_high: 3200,
    rent_after_reno_basement_low: null,
    rent_after_reno_basement_high: null,
    condition_summary: 'Both units occupied. Deferred maintenance on plumbing and electrical. Solid structure.',
    renovation_overview: 'Full gut rehab on both units. New plumbing, electrical panel upgrade, kitchen/bath remodels.',
    why_deal_is_strong: 'Duplex with strong rental demand. 1.5% rule after rehab. Cash flow positive from day one.',
    showing_instructions: 'Drive by only. Occupied units - do not disturb tenants.',
    contact_name: 'Demo Seller',
    contact_phone: '(555) 200-3000',
    contact_email: 'demo-seller@dealpacket.test',
    status: 'published',
  },
  {
    title: 'Wholesale - Distressed Ranch in Suburbia',
    street_address: '3305 Birchwood Lane',
    city: 'Phoenix',
    state: 'AZ',
    zip_code: '85027',
    property_type: 'Single Family',
    beds: 4,
    baths: 3,
    sqft: 2200,
    year_built: 1992,
    lot_size: '8,100 sqft',
    listing_status: 'Available',
    ideal_investor_strategy: 'Wholesale',
    asking_price: 245000,
    arv: 385000,
    repair_estimate: 80000,
    assignment_fee: 15000,
    show_assignment_fee: true,
    light_rehab_budget_low: 35000,
    light_rehab_budget_high: 50000,
    full_rehab_budget_low: 75000,
    full_rehab_budget_high: 95000,
    light_rehab_arv: 350000,
    full_rehab_arv_low: 375000,
    full_rehab_arv_high: 395000,
    rent_after_reno_low: 2400,
    rent_after_reno_high: 2800,
    condition_summary: 'Estate sale. Property has been vacant 6 months. Pool needs resurfacing. HVAC needs replacement.',
    renovation_overview: 'Pool repair, HVAC replacement, flooring, paint, kitchen countertops, landscaping cleanup.',
    why_deal_is_strong: 'Estate sale with motivated executor. Under contract at 64% of ARV. Great spread for flippers.',
    showing_instructions: 'Vacant property. Access via lockbox - call for code.',
    contact_name: 'Demo Power User',
    contact_phone: '(555) 300-4000',
    contact_email: 'demo-both@dealpacket.test',
    status: 'published',
  },
  {
    title: 'Cash Flow Rental - Turnkey 2-Bed',
    street_address: '519 Elm Court',
    city: 'Indianapolis',
    state: 'IN',
    zip_code: '46201',
    property_type: 'Single Family',
    beds: 2,
    baths: 1,
    sqft: 950,
    year_built: 1955,
    lot_size: '4,000 sqft',
    listing_status: 'Available',
    ideal_investor_strategy: 'Buy & Hold',
    asking_price: 85000,
    arv: 115000,
    repair_estimate: 10000,
    assignment_fee: 5000,
    show_assignment_fee: true,
    light_rehab_budget_low: 5000,
    light_rehab_budget_high: 12000,
    full_rehab_budget_low: 10000,
    full_rehab_budget_high: 18000,
    light_rehab_arv: 105000,
    full_rehab_arv_low: 110000,
    full_rehab_arv_high: 120000,
    rent_after_reno_low: 950,
    rent_after_reno_high: 1100,
    condition_summary: 'Recently updated with new water heater and furnace. Tenant-ready with minor cosmetic work.',
    renovation_overview: 'Paint touch-ups, clean carpet, minor landscaping. Mostly turnkey.',
    why_deal_is_strong: 'Immediate cash flow at 1.2% rule. Stable neighborhood. Low vacancy rate.',
    showing_instructions: 'Available for showing weekdays. Call ahead.',
    contact_name: 'Demo Seller',
    contact_phone: '(555) 200-3000',
    contact_email: 'demo-seller@dealpacket.test',
    status: 'published',
  },
  {
    title: 'Off-Market Foreclosure Lead',
    street_address: '2100 Pine Ridge Road',
    city: 'Atlanta',
    state: 'GA',
    zip_code: '30316',
    property_type: 'Single Family',
    beds: 3,
    baths: 2,
    sqft: 1650,
    year_built: 1985,
    lot_size: '5,500 sqft',
    listing_status: 'Under Contract',
    ideal_investor_strategy: 'Fix & Flip',
    asking_price: 165000,
    arv: 295000,
    repair_estimate: 60000,
    assignment_fee: 10000,
    show_assignment_fee: false,
    light_rehab_budget_low: 25000,
    light_rehab_budget_high: 40000,
    full_rehab_budget_low: 55000,
    full_rehab_budget_high: 70000,
    light_rehab_arv: 260000,
    full_rehab_arv_low: 285000,
    full_rehab_arv_high: 305000,
    rent_after_reno_low: 1800,
    rent_after_reno_high: 2100,
    condition_summary: 'Pre-foreclosure. Owner behind on payments. Interior needs work - water damage in master bath.',
    renovation_overview: 'Master bath rebuild, kitchen update, new flooring, exterior paint, deck repair.',
    why_deal_is_strong: 'Pre-foreclosure with $120K+ spread. Growing Atlanta submarket. Strong buyer demand.',
    showing_instructions: 'Owner-occupied. Must schedule 24hr in advance.',
    contact_name: 'Demo Power User',
    contact_phone: '(555) 300-4000',
    contact_email: 'demo-both@dealpacket.test',
    status: 'draft',
  },
];

const DEMO_BUY_BOXES = [
  {
    name: 'SFR Flips - Southeast',
    property_types: ['Single Family'],
    locations: 'Atlanta, GA; Tampa, FL; Charlotte, NC',
    min_price: 100000,
    max_price: 300000,
    min_beds: 3,
    min_baths: 2,
    min_sqft: 1200,
    max_sqft: 2500,
    financing_types: ['Cash', 'Hard Money'],
    proof_of_funds: true,
    closing_timeline: '14-21 days',
    property_conditions: ['Light Rehab', 'Full Rehab'],
    additional_notes: 'Looking for properties with strong ARV comps. Prefer neighborhoods with rising values.',
  },
  {
    name: 'Multi-Family Cash Flow',
    property_types: ['Multi Family', 'Duplex'],
    locations: 'Indianapolis, IN; Cleveland, OH; Memphis, TN',
    min_price: 80000,
    max_price: 250000,
    min_beds: 4,
    min_baths: 2,
    min_sqft: 1800,
    max_sqft: 4000,
    financing_types: ['Conventional', 'DSCR'],
    proof_of_funds: true,
    closing_timeline: '30-45 days',
    property_conditions: ['Turnkey', 'Light Rehab'],
    additional_notes: 'Targeting 1% rule minimum. Prefer tenant-occupied with existing lease agreements.',
  },
  {
    name: 'Wholesale Assignments - Sunbelt',
    property_types: ['Single Family', 'Townhouse'],
    locations: 'Phoenix, AZ; Dallas, TX; Jacksonville, FL',
    min_price: 150000,
    max_price: 400000,
    min_beds: 3,
    min_baths: 2,
    min_sqft: 1400,
    max_sqft: 3000,
    financing_types: ['Cash'],
    proof_of_funds: true,
    closing_timeline: '7-14 days',
    property_conditions: ['Full Rehab', 'Tear Down'],
    additional_notes: 'Need minimum $20K assignment fee. Can close within 7 days with clear title.',
  },
  {
    name: 'BRRRR Strategy Deals',
    property_types: ['Single Family', 'Multi Family'],
    locations: 'Riverside, CA; San Antonio, TX; Raleigh, NC',
    min_price: 120000,
    max_price: 350000,
    min_beds: 2,
    min_baths: 1,
    min_sqft: 900,
    max_sqft: 2200,
    financing_types: ['Hard Money', 'Private Money'],
    proof_of_funds: false,
    closing_timeline: '21-30 days',
    property_conditions: ['Light Rehab', 'Full Rehab'],
    additional_notes: 'Looking for deals where post-rehab refinance covers full purchase + rehab cost.',
  },
];

function generateSlug(address: string, city: string): string {
  const base = `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

// POST: Seed demo data
export async function POST() {
  try {
    const { adminSupabase } = await requireAdmin();

    const results: string[] = [];
    const userIdMap = new Map<string, string>();

    // 1. Create demo auth accounts + profiles
    for (const account of DEMO_ACCOUNTS) {
      // Check if user already exists
      const { data: existingUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = existingUsers?.users?.find((u) => u.email === account.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        results.push(`Account ${account.email} already exists (${userId})`);
      } else {
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        });

        if (createError) {
          results.push(`Failed to create ${account.email}: ${createError.message}`);
          continue;
        }

        userId = newUser.user.id;
        results.push(`Created account ${account.email} (${userId})`);
      }

      userIdMap.set(account.email, userId);

      // Upsert profile (core fields only - tier columns may not exist yet)
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert({
          id: userId,
          user_role: account.role,
          active_view: account.role === 'buyer' ? 'buyer' : 'seller',
          full_name: account.name,
          company_name: account.company,
          phone: account.phone,
          is_admin: false,
        });

      if (profileError) {
        results.push(`Failed to update profile for ${account.email}: ${profileError.message}`);
      }

      // Try to set tier columns (may not exist if migration hasn't been run)
      try {
        await adminSupabase
          .from('profiles')
          .update({ buyer_tier: account.buyerTier, seller_tier: account.sellerTier })
          .eq('id', userId);
      } catch {
        // Tier columns don't exist yet - that's fine
      }
    }

    // 2. Create demo properties (assigned to seller and both accounts)
    const sellerUserId = userIdMap.get('demo-seller@dealpacket.test');
    const bothUserId = userIdMap.get('demo-both@dealpacket.test');
    const buyerUserId = userIdMap.get('demo-buyer@dealpacket.test');

    if (sellerUserId || bothUserId) {
      // Delete existing demo properties first
      const demoUserIds = [sellerUserId, bothUserId].filter(Boolean) as string[];
      await adminSupabase.from('properties').delete().in('user_id', demoUserIds);

      for (const prop of DEMO_PROPERTIES) {
        const ownerId = prop.contact_email === 'demo-both@dealpacket.test' ? bothUserId : sellerUserId;
        if (!ownerId) continue;

        const slug = generateSlug(prop.street_address, prop.city);

        const { error: propError } = await adminSupabase.from('properties').insert({
          ...prop,
          user_id: ownerId,
          slug,
          is_featured: false,
          moderation_status: 'approved',
        });

        if (propError) {
          results.push(`Failed to create property "${prop.title}": ${propError.message}`);
        } else {
          results.push(`Created property: ${prop.title}`);
        }
      }
    }

    // 3. Create demo buy boxes (assigned to buyer and both accounts)
    if (buyerUserId || bothUserId) {
      const buyerIds = [buyerUserId, bothUserId].filter(Boolean) as string[];
      await adminSupabase.from('buyer_buy_boxes').delete().in('user_id', buyerIds);

      for (let i = 0; i < DEMO_BUY_BOXES.length; i++) {
        const box = DEMO_BUY_BOXES[i];
        // First 2 go to buyer, last 2 go to both
        const ownerId = i < 2 ? buyerUserId : bothUserId;
        if (!ownerId) continue;

        const { error: boxError } = await adminSupabase.from('buyer_buy_boxes').insert({
          ...box,
          user_id: ownerId,
        });

        if (boxError) {
          results.push(`Failed to create buy box "${box.name}": ${boxError.message}`);
        } else {
          results.push(`Created buy box: ${box.name}`);
        }
      }
    }

    // 4. Create some demo messages between buyer and seller
    if (buyerUserId && sellerUserId) {
      await adminSupabase.from('listing_messages').delete().eq('sender_id', buyerUserId);

      // Get a published property from seller
      const { data: sellerProps } = await adminSupabase
        .from('properties')
        .select('id')
        .eq('user_id', sellerUserId)
        .eq('status', 'published')
        .limit(2);

      if (sellerProps && sellerProps.length > 0) {
        const messages = [
          {
            sender_id: buyerUserId,
            recipient_id: sellerUserId,
            property_id: sellerProps[0].id,
            message_type: 'ask_question',
            message: 'Hi, is the repair estimate based on contractor bids or your own estimate? Also, any issues with the foundation?',
            is_read: false,
          },
          {
            sender_id: buyerUserId,
            recipient_id: sellerUserId,
            property_id: sellerProps[0].id,
            message_type: 'request_showing',
            message: 'I would like to schedule a showing this week if possible. I can come anytime Wednesday or Thursday.',
            is_read: true,
          },
        ];

        if (sellerProps.length > 1) {
          messages.push({
            sender_id: buyerUserId,
            recipient_id: sellerUserId,
            property_id: sellerProps[1].id,
            message_type: 'make_offer',
            message: 'Interested in making an offer. My target is $180K cash, close in 14 days. Let me know if that works.',
            is_read: false,
          });
        }

        const { error: msgError } = await adminSupabase.from('listing_messages').insert(messages);
        if (msgError) {
          results.push(`Failed to create messages: ${msgError.message}`);
        } else {
          results.push(`Created ${messages.length} demo messages`);
        }
      }
    }

    // 5. Create saved listings for buyer
    if (buyerUserId) {
      await adminSupabase.from('saved_listings').delete().eq('user_id', buyerUserId);

      const { data: allPublished } = await adminSupabase
        .from('properties')
        .select('id')
        .eq('status', 'published')
        .limit(3);

      if (allPublished && allPublished.length > 0) {
        const saves = allPublished.map((p) => ({
          user_id: buyerUserId,
          property_id: p.id,
        }));

        const { error: saveError } = await adminSupabase.from('saved_listings').insert(saves);
        if (saveError) {
          results.push(`Failed to save listings: ${saveError.message}`);
        } else {
          results.push(`Saved ${saves.length} listings for demo buyer`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      accounts: DEMO_ACCOUNTS.map((a) => ({
        email: a.email,
        password: a.password,
        role: a.role,
        buyerTier: a.buyerTier,
        sellerTier: a.sellerTier,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

// DELETE: Remove all demo data
export async function DELETE() {
  try {
    const { adminSupabase } = await requireAdmin();

    const results: string[] = [];

    // Find demo users
    const { data: authData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    const demoUsers = authData?.users?.filter((u) =>
      u.email?.endsWith('@dealpacket.test')
    ) || [];

    const demoUserIds = demoUsers.map((u) => u.id);

    if (demoUserIds.length === 0) {
      return NextResponse.json({ success: true, results: ['No demo accounts found'] });
    }

    // Delete in order: messages, saved_listings, buy_boxes, properties, profiles, auth
    await adminSupabase.from('listing_messages').delete().in('sender_id', demoUserIds);
    await adminSupabase.from('listing_messages').delete().in('recipient_id', demoUserIds);
    results.push('Deleted demo messages');

    await adminSupabase.from('saved_listings').delete().in('user_id', demoUserIds);
    results.push('Deleted demo saved listings');

    await adminSupabase.from('buyer_buy_boxes').delete().in('user_id', demoUserIds);
    results.push('Deleted demo buy boxes');

    await adminSupabase.from('properties').delete().in('user_id', demoUserIds);
    results.push('Deleted demo properties');

    // Delete auth users (cascade deletes profiles)
    for (const user of demoUsers) {
      const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
      if (error) {
        results.push(`Failed to delete user ${user.email}: ${error.message}`);
      } else {
        results.push(`Deleted account: ${user.email}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
