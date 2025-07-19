import { DataSource } from "typeorm";
import { User } from "../users/user.entity";
import { Role } from "../users/roles.enum";
import { Document } from "../documents/document.entity";
import * as bcrypt from "bcryptjs";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "saikatbishal",
  database: process.env.DB_NAME || "nestjs_docs",
  entities: [User, Document],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const docRepo = AppDataSource.getRepository(Document);

  // Seed users
  const users: User[] = [];
  for (let i = 1; i <= 1000; i++) {
    const role = i <= 10 ? Role.ADMIN : i <= 100 ? Role.EDITOR : Role.VIEWER;
    const user = userRepo.create({
      email: `user${i}@example.com`,
      password: await bcrypt.hash("password", 10),
      role,
      name: `User ${i}`,
    });
    users.push(user);
  }
  await userRepo.save(users);

  // Seed documents
  const docs: Document[] = [];
  for (let i = 1; i <= 5000; i++) {
    const owner = users[Math.floor(Math.random() * users.length)];
    const doc = docRepo.create({
      title: `Document ${i}`,
      content: `This is the content of document ${i}.`,
      owner,
    });
    docs.push(doc);
  }
  await docRepo.save(docs);

  console.log("Seeded 1000 users and 5000 documents.");
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
