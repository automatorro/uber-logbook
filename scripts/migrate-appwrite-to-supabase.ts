/**
 * Migrare date Appwrite -> Supabase
 * Rulat o singură dată: npx tsx scripts/migrate-appwrite-to-supabase.ts
 *
 * Variabile necesare în .env.local (sau direct în mediu):
 *   SUPABASE_SERVICE_ROLE_KEY  — din Supabase Dashboard → Project Settings → API → service_role
 *   APPWRITE_USER_ID           — $id-ul contului tău din Appwrite Console → Auth → Users
 *   SUPABASE_USER_ID           — UUID-ul contului tău din Supabase → Authentication → Users
 *
 * Opțional (dacă valorile default din cod nu mai sunt corecte):
 *   NEXT_PUBLIC_SUPABASE_URL   — https://gsgjmatvolhoeavosvgt.supabase.co
 */

import { Client, Databases, Query } from 'appwrite';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Încarc .env.local dacă există
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// ── Configurare ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsgjmatvolhoeavosvgt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPWRITE_USER_ID = process.env.APPWRITE_USER_ID;
const SUPABASE_USER_ID = process.env.SUPABASE_USER_ID;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Lipsă: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!APPWRITE_USER_ID) {
  console.error('❌ Lipsă: APPWRITE_USER_ID (caută-l în Appwrite Console → Auth → Users → $id)');
  process.exit(1);
}
if (!SUPABASE_USER_ID) {
  console.error('❌ Lipsă: SUPABASE_USER_ID (caută-l în Supabase Dashboard → Authentication → Users → UUID)');
  process.exit(1);
}

// ── Clienți ──────────────────────────────────────────────────────────────────

const appwriteClient = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69de3f290007512434e5');

const appwriteDb = new Databases(appwriteClient);

// Service role key → ocolește RLS, poate scrie în orice tabel
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DATABASE_ID = 'uber_db';
const ENTRIES_COLLECTION_ID = 'entries';
const SETTINGS_COLLECTION_ID = 'settings';

// ── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Start migrare Appwrite → Supabase');
  console.log(`   Appwrite user: ${APPWRITE_USER_ID}`);
  console.log(`   Supabase user: ${SUPABASE_USER_ID}`);
  console.log('');

  // 1. Setări
  console.log('📋 Citesc setările din Appwrite...');
  try {
    const settingsDocs = await appwriteDb.listDocuments(
      DATABASE_ID,
      SETTINGS_COLLECTION_ID,
      [Query.equal('userId', APPWRITE_USER_ID!)]
    );

    if (settingsDocs.documents.length > 0) {
      const s = settingsDocs.documents[0];
      const { error } = await supabase.from('settings').upsert({
        user_id: SUPABASE_USER_ID,
        pfa_name: s.pfaName || '',
        pfa_cif: s.pfaCif || '',
        car_brand: s.carBrand || '',
        car_model: s.carModel || '',
        car_plate: s.carPlate || '',
        driver_name: s.driverName || '',
        fuel_norm: s.fuelNorm || 8.0,
        default_zone: s.defaultZone || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ Eroare la salvarea setărilor:', error.message);
      } else {
        console.log('✅ Setări migrate');
      }
    } else {
      console.log('⚠️  Nu există setări în Appwrite (sărit)');
    }
  } catch (err: any) {
    console.error('❌ Eroare la citirea setărilor:', err.message);
  }

  // 2. Intrări (entries + fuelings)
  console.log('\n📅 Citesc intrările din Appwrite...');

  let allDocs: any[] = [];
  let offset = 0;
  const PAGE = 100;

  while (true) {
    const page = await appwriteDb.listDocuments(
      DATABASE_ID,
      ENTRIES_COLLECTION_ID,
      [Query.limit(PAGE), Query.offset(offset), Query.equal('userId', APPWRITE_USER_ID!)]
    );
    allDocs = allDocs.concat(page.documents);
    if (page.documents.length < PAGE) break;
    offset += PAGE;
  }

  console.log(`   Găsite ${allDocs.length} intrări în Appwrite`);
  if (allDocs.length === 0) {
    console.log('⚠️  Nimic de migrat.');
    return;
  }

  let ok = 0, skipped = 0, errors = 0;

  for (const doc of allDocs) {
    try {
      // Verifică dacă există deja (după user_id + date)
      const { data: existing } = await supabase
        .from('entries')
        .select('id')
        .eq('user_id', SUPABASE_USER_ID)
        .eq('date', doc.date)
        .maybeSingle();

      if (existing) {
        console.log(`   ⏭️  ${doc.date} — există deja, sărit`);
        skipped++;
        continue;
      }

      // Inserează entry
      const { data: newEntry, error: entryErr } = await supabase
        .from('entries')
        .insert({
          user_id: SUPABASE_USER_ID,
          date: doc.date,
          km_start: doc.kmStart || 0,
          km_end: doc.kmEnd || 0,
          trip_count: doc.tripCount || 0,
          start_time: doc.startTime || '08:00',
          end_time: doc.endTime || '20:00',
          route: doc.route || '',
        })
        .select()
        .single();

      if (entryErr) {
        console.error(`   ❌ ${doc.date} — eroare entry: ${entryErr.message}`);
        errors++;
        continue;
      }

      // Dacă are alimentare, inserează fueling
      if (doc.fueling_liters > 0) {
        const { error: fuelErr } = await supabase.from('fuelings').insert({
          entry_id: newEntry.id,
          user_id: SUPABASE_USER_ID,
          date: doc.date,
          liters: doc.fueling_liters,
          value: doc.fueling_value || 0,
          station: doc.fueling_station || '',
          bill: doc.fueling_bill || null,
        });

        if (fuelErr) {
          console.error(`   ⚠️  ${doc.date} — entry OK, eroare fueling: ${fuelErr.message}`);
        } else {
          console.log(`   ✅ ${doc.date} — ${doc.kmEnd - doc.kmStart} km, ⛽ ${doc.fueling_liters}L`);
        }
      } else {
        console.log(`   ✅ ${doc.date} — ${doc.kmEnd - doc.kmStart} km`);
      }

      ok++;
      // Mică pauză ca să nu hammeram API-ul
      await delay(100);
    } catch (err: any) {
      console.error(`   ❌ ${doc.date} — excepție: ${err.message}`);
      errors++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Migrate cu succes : ${ok}`);
  console.log(`⏭️  Sărite (existau) : ${skipped}`);
  console.log(`❌ Erori             : ${errors}`);
  console.log('═══════════════════════════════════════');

  if (errors > 0) {
    console.log('\n⚠️  Rulează din nou scriptul — intrările sărite nu se duplică (verifică după date).');
  } else {
    console.log('\n🎉 Migrare completă! Verifică datele în Supabase Dashboard → Table Editor.');
  }
}

main().catch(err => {
  console.error('💥 Eroare fatală:', err);
  process.exit(1);
});
