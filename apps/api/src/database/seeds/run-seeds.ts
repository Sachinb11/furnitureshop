import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Load .env from api directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/furnishop',
  entities: [path.join(__dirname, '../../modules/**/*.entity.{ts,js}')],
  synchronize: true,
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  console.log('\n🌱 Starting database seed...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    console.error('\nMake sure PostgreSQL is running: docker-compose up -d\n');
    process.exit(1);
  }

  try {
    // ── Categories ──────────────────────────────────────────────────────
    console.log('📁 Seeding categories...');
    await AppDataSource.query(`
      INSERT INTO categories (id, name, slug, description, sort_order, is_active)
      VALUES
        (gen_random_uuid(), 'Living Room', 'living-room', 'Sofas, armchairs and coffee tables', 1, true),
        (gen_random_uuid(), 'Bedroom',     'bedroom',     'Beds, wardrobes and bedside tables',  2, true),
        (gen_random_uuid(), 'Dining',      'dining',      'Dining tables and chairs',             3, true),
        (gen_random_uuid(), 'Storage',     'storage',     'Shelves, racks and storage units',     4, true),
        (gen_random_uuid(), 'Office',      'office',      'Desks, chairs and office storage',     5, true)
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log('   ✓ 5 categories created');

    // ── Admin user ───────────────────────────────────────────────────────
    console.log('👤 Seeding admin user...');
    const hash = await bcrypt.hash('Admin@123', 12);
    await AppDataSource.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified)
      VALUES (gen_random_uuid(), 'admin@furnishop.com', $1, 'Admin', 'User', 'admin', true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'admin'
    `, [hash]);
    console.log('   ✓ Admin user: admin@furnishop.com / Admin@123');

    // ── Get category IDs ─────────────────────────────────────────────────
    const categories = await AppDataSource.query(
      `SELECT id, slug FROM categories WHERE is_active = true`
    );
    const catMap: Record<string, string> = {};
    categories.forEach((c: any) => { catMap[c.slug] = c.id; });

    // ── Sample products ──────────────────────────────────────────────────
    console.log('📦 Seeding products...');
    const products = [
      {
        category: 'living-room',
        name: 'KLIPPAN Sofa',
        slug: 'klippan-sofa',
        desc: 'Compact 2-seat sofa. A small sofa that is easy to furnish with, even in a small living room.',
        price: 14999, salePrice: null, stock: 42, sku: 'KLP-GRY-2S', featured: true,
        specs: '{"material":"polyester","width":"180cm","depth":"88cm","height":"66cm","color":"Vissle grey"}',
      },
      {
        category: 'living-room',
        name: 'POÄNG Armchair',
        slug: 'poang-armchair',
        desc: 'Layer-glued bent birch frame gives the armchair a comfortable resilience.',
        price: 7499, salePrice: null, stock: 8, sku: 'PNG-BRK-1S', featured: false,
        specs: '{"material":"birch veneer","width":"68cm","depth":"82cm","height":"100cm"}',
      },
      {
        category: 'living-room',
        name: 'EKTORP Sofa',
        slug: 'ektorp-sofa',
        desc: 'Generous seating comfort in a traditional style. High back provides good support for neck and head.',
        price: 38999, salePrice: null, stock: 15, sku: 'EKT-BEI-3S', featured: true,
        specs: '{"material":"cotton","width":"218cm","depth":"88cm","height":"88cm","seats":3}',
      },
      {
        category: 'bedroom',
        name: 'MALM Bed Frame',
        slug: 'malm-bed-frame',
        desc: 'A clean design that fits right in — in the bedroom or wherever you place it.',
        price: 21999, salePrice: null, stock: 24, sku: 'MLM-WHT-Q', featured: true,
        specs: '{"material":"fibreboard","width":"168cm","length":"209cm","height":"100cm","size":"Queen"}',
      },
      {
        category: 'bedroom',
        name: 'PAX Wardrobe',
        slug: 'pax-wardrobe',
        desc: 'You can choose between many interior fittings, adapted for different needs.',
        price: 31999, salePrice: 38999, stock: 0, sku: 'PAX-WHT-L', featured: false,
        specs: '{"material":"particleboard","width":"150cm","depth":"60cm","height":"201cm"}',
      },
      {
        category: 'dining',
        name: 'EKEDALEN Dining Table',
        slug: 'ekedalen-dining-table',
        desc: 'The table can seat 4-6 people depending on the extension leaf.',
        price: 28500, salePrice: null, stock: 18, sku: 'EKD-OAK-6S', featured: false,
        specs: '{"material":"solid oak","width":"120-180cm","depth":"80cm","height":"75cm"}',
      },
      {
        category: 'storage',
        name: 'KALLAX Shelf Unit',
        slug: 'kallax-shelf-unit',
        desc: 'A simple shelf unit that you can place anywhere in the home.',
        price: 12999, salePrice: null, stock: 55, sku: 'KLX-WHT-4X4', featured: false,
        specs: '{"material":"fibreboard","width":"147cm","depth":"39cm","height":"147cm","compartments":16}',
      },
      {
        category: 'office',
        name: 'MICKE Desk',
        slug: 'micke-desk',
        desc: 'Keep your work stuff organized with the cable management features.',
        price: 8999, salePrice: null, stock: 30, sku: 'MCK-WHT-DS', featured: false,
        specs: '{"material":"fibreboard","width":"105cm","depth":"50cm","height":"75cm"}',
      },
    ];

    let created = 0;
    for (const p of products) {
      const catId = catMap[p.category];
      if (!catId) { console.warn(`   ⚠ Category not found: ${p.category}`); continue; }

      await AppDataSource.query(`
        INSERT INTO products (
          id, category_id, name, slug, description,
          base_price, sale_price, stock_quantity, sku,
          is_active, is_featured, specs, tags,
          avg_rating, review_count
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4,
          $5, $6, $7, $8,
          true, $9, $10::jsonb, '{}',
          0, 0
        )
        ON CONFLICT (slug) DO UPDATE SET
          base_price     = EXCLUDED.base_price,
          stock_quantity = EXCLUDED.stock_quantity,
          is_featured    = EXCLUDED.is_featured
      `, [
        catId, p.name, p.slug, p.desc,
        p.price, p.salePrice, p.stock, p.sku,
        p.featured, p.specs,
      ]);
      created++;
    }
    console.log(`   ✓ ${created} products seeded`);

    // ── Summary ──────────────────────────────────────────────────────────
    const [userCount]    = await AppDataSource.query('SELECT COUNT(*) FROM users');
    const [catCount]     = await AppDataSource.query('SELECT COUNT(*) FROM categories');
    const [productCount] = await AppDataSource.query('SELECT COUNT(*) FROM products');

    console.log('\n✅ Seed complete!\n');
    console.log('─'.repeat(45));
    console.log(`   Users:      ${userCount.count}`);
    console.log(`   Categories: ${catCount.count}`);
    console.log(`   Products:   ${productCount.count}`);
    console.log('─'.repeat(45));
    console.log('\n🔐 Admin login:');
    console.log('   Email:    admin@furnishop.com');
    console.log('   Password: Admin@123');
    console.log('\n🌐 Open: http://localhost:3000\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
