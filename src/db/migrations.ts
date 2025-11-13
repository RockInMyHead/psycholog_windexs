import { db } from './index';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

// Initialize database with default data
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables
    await createTables();

    // Insert default quotes
    await seedQuotes();

    // Create default user if not exists
    await createDefaultUser();

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function createTables() {
  // Tables are created automatically by drizzle when we run the first query
  // But we can add any additional setup here if needed
}

async function seedQuotes() {
  // Check if quotes already exist
  const existingQuotes = await db.select().from(schema.quotes).limit(1);
  if (existingQuotes.length > 0) {
    console.log('Quotes already seeded, skipping...');
    return;
  }

  const defaultQuotes = [
    {
      text: "Единственный способ сделать что-то хорошо — полюбить то, что вы делаете.",
      author: "Стив Джобс",
      category: "Мотивация"
    },
    {
      text: "Жизнь — это то, что происходит с вами, пока вы строите другие планы.",
      author: "Джон Леннон",
      category: "Жизнь"
    },
    {
      text: "Путь в тысячу миль начинается с первого шага.",
      author: "Лао-цзы",
      category: "Начинания"
    },
    {
      text: "Не важно, как медленно вы идете, главное — не останавливаться.",
      author: "Конфуций",
      category: "Настойчивость"
    },
    {
      text: "Счастье — это не цель, а способ жить.",
      author: "Далай-лама",
      category: "Счастье"
    },
    {
      text: "Будьте тем изменением, которое хотите видеть в мире.",
      author: "Махатма Ганди",
      category: "Вдохновение"
    },
    {
      text: "Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.",
      author: "Китайская пословица",
      category: "Действие"
    },
    {
      text: "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.",
      author: "Уинстон Черчилль",
      category: "Успех"
    },
    {
      text: "Ваше время ограничено, не тратьте его на жизнь чужой жизнью.",
      author: "Стив Джобс",
      category: "Аутентичность"
    },
    {
      text: "Единственная невозможная вещь — это та, которую вы не пытались сделать.",
      author: "Неизвестный автор",
      category: "Возможности"
    },
    {
      text: "Падать — это нормально. Подниматься — обязательно.",
      author: "Конфуций",
      category: "Стойкость"
    },
    {
      text: "Мудрость приходит с опытом, а опыт — с ошибками.",
      author: "Оскар Уайльд",
      category: "Мудрость"
    },
  ];

  for (const quote of defaultQuotes) {
    await db.insert(schema.quotes).values({
      ...quote,
      createdAt: new Date(),
    });
  }

  console.log('Quotes seeded successfully!');
}

async function createDefaultUser() {
  // Check if default user exists
  const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, 'user@zenmindmate.com')).limit(1);

  if (existingUser.length > 0) {
    console.log('Default user already exists, skipping...');
    return;
  }

  const now = new Date();

  // Create default user
  const [user] = await db.insert(schema.users).values({
    name: 'Пользователь',
    email: 'user@zenmindmate.com',
    createdAt: now,
    updatedAt: now,
  }).returning();

  // Create user stats
  await db.insert(schema.userStats).values({
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  });

  console.log('Default user created successfully!');
}
