/**
 * Script para criar usuários de teste no banco de dados
 * 
 * Execução: node scripts/seed-users.mjs
 */

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
  process.exit(1);
}

async function seedUsers() {
  console.log("🔄 Conectando ao banco de dados...");
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Hash da senha padrão (123456)
    const passwordHash = await bcrypt.hash("123456", 10);
    
    console.log("📝 Criando usuários de teste...\n");
    
    // 1. Super Admin
    const superAdminEmail = "admin@casablanca.com";
    const superAdminOpenId = `email:${superAdminEmail}`;
    const [existingSuperAdmin] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [superAdminEmail]
    );
    
    if (existingSuperAdmin.length === 0) {
      await connection.execute(
        `INSERT INTO users (openId, email, passwordHash, name, role, loginMethod, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [superAdminOpenId, superAdminEmail, passwordHash, "Administrador", "super_admin", "email"]
      );
      console.log("✅ Super Admin criado:");
      console.log("   Email: admin@casablanca.com");
      console.log("   Senha: 123456");
      console.log("   Role: super_admin\n");
    } else {
      // Update password and openId if user exists
      await connection.execute(
        "UPDATE users SET passwordHash = ?, role = ?, openId = ? WHERE email = ?",
        [passwordHash, "super_admin", superAdminOpenId, superAdminEmail]
      );
      console.log("✅ Super Admin atualizado:");
      console.log("   Email: admin@casablanca.com");
      console.log("   Senha: 123456");
      console.log("   Role: super_admin\n");
    }
    
    // 2. Verificar se existe um tenant para associar ao lojista
    const [tenants] = await connection.execute(
      "SELECT id, name FROM tenants LIMIT 1"
    );
    
    let tenantId = null;
    let tenantName = "Nenhum";
    
    if (tenants.length > 0) {
      tenantId = tenants[0].id;
      tenantName = tenants[0].name;
    }
    
    // 3. Client Admin (Lojista)
    const lojistaEmail = "lojista@casablanca.com";
    const lojistaOpenId = `email:${lojistaEmail}`;
    const [existingLojista] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [lojistaEmail]
    );
    
    if (existingLojista.length === 0) {
      await connection.execute(
        `INSERT INTO users (openId, email, passwordHash, name, role, tenantId, loginMethod, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [lojistaOpenId, lojistaEmail, passwordHash, "Lojista Demo", "client_admin", tenantId, "email"]
      );
      console.log("✅ Client Admin (Lojista) criado:");
      console.log("   Email: lojista@casablanca.com");
      console.log("   Senha: 123456");
      console.log("   Role: client_admin");
      console.log(`   Tenant: ${tenantName} (ID: ${tenantId})\n`);
    } else {
      // Update password, tenant and openId if user exists
      await connection.execute(
        "UPDATE users SET passwordHash = ?, role = ?, tenantId = ?, openId = ? WHERE email = ?",
        [passwordHash, "client_admin", tenantId, lojistaOpenId, lojistaEmail]
      );
      console.log("✅ Client Admin (Lojista) atualizado:");
      console.log("   Email: lojista@casablanca.com");
      console.log("   Senha: 123456");
      console.log("   Role: client_admin");
      console.log(`   Tenant: ${tenantName} (ID: ${tenantId})\n`);
    }
    
    console.log("🎉 Usuários de teste criados com sucesso!");
    console.log("\n📋 Resumo:");
    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log("│ Tipo          │ Email                    │ Senha       │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log("│ Super Admin   │ admin@casablanca.com     │ 123456      │");
    console.log("│ Lojista       │ lojista@casablanca.com   │ 123456      │");
    console.log("└─────────────────────────────────────────────────────────┘");
    
  } catch (error) {
    console.error("❌ Erro ao criar usuários:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedUsers();
