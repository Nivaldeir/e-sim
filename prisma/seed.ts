import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db",
    },
  },
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Criar todas as permissões necessárias
  console.log('📝 Criando permissões...');
  
  const permissionsToCreate = [
    // Documents
    { name: 'documents:read', description: 'Visualizar documentos', resource: 'documents', action: 'read' },
    { name: 'documents:create', description: 'Criar documentos', resource: 'documents', action: 'create' },
    { name: 'documents:update', description: 'Editar documentos', resource: 'documents', action: 'update' },
    { name: 'documents:delete', description: 'Excluir documentos', resource: 'documents', action: 'delete' },
    
    // Companies
    { name: 'companies:read', description: 'Visualizar empresas', resource: 'companies', action: 'read' },
    { name: 'companies:create', description: 'Criar empresas', resource: 'companies', action: 'create' },
    { name: 'companies:update', description: 'Editar empresas', resource: 'companies', action: 'update' },
    { name: 'companies:delete', description: 'Excluir empresas', resource: 'companies', action: 'delete' },
    
    // Establishments
    { name: 'establishments:read', description: 'Visualizar estabelecimentos', resource: 'establishments', action: 'read' },
    { name: 'establishments:create', description: 'Criar estabelecimentos', resource: 'establishments', action: 'create' },
    { name: 'establishments:update', description: 'Editar estabelecimentos', resource: 'establishments', action: 'update' },
    { name: 'establishments:delete', description: 'Excluir estabelecimentos', resource: 'establishments', action: 'delete' },
    
    // Organizations
    { name: 'organizations:read', description: 'Visualizar órgãos', resource: 'organizations', action: 'read' },
    { name: 'organizations:create', description: 'Criar órgãos', resource: 'organizations', action: 'create' },
    { name: 'organizations:update', description: 'Editar órgãos', resource: 'organizations', action: 'update' },
    { name: 'organizations:delete', description: 'Excluir órgãos', resource: 'organizations', action: 'delete' },
    
    // Document Types
    { name: 'documentTypes:read', description: 'Visualizar tipos de documento', resource: 'documentTypes', action: 'read' },
    { name: 'documentTypes:create', description: 'Criar tipos de documento', resource: 'documentTypes', action: 'create' },
    { name: 'documentTypes:update', description: 'Editar tipos de documento', resource: 'documentTypes', action: 'update' },
    { name: 'documentTypes:delete', description: 'Excluir tipos de documento', resource: 'documentTypes', action: 'delete' },
    
    // Access Management
    { name: 'accesses:read', description: 'Visualizar acessos', resource: 'accesses', action: 'read' },
    { name: 'accesses:manage', description: 'Gerenciar acessos', resource: 'accesses', action: 'manage' },
    
    // Files
    { name: 'files:read', description: 'Visualizar arquivos', resource: 'files', action: 'read' },
    { name: 'files:create', description: 'Criar arquivos', resource: 'files', action: 'create' },
    { name: 'files:delete', description: 'Excluir arquivos', resource: 'files', action: 'delete' },
    
    // Social Reasons
    { name: 'socialReasons:read', description: 'Visualizar razões sociais', resource: 'socialReasons', action: 'read' },
    { name: 'socialReasons:create', description: 'Criar razões sociais', resource: 'socialReasons', action: 'create' },
    { name: 'socialReasons:update', description: 'Editar razões sociais', resource: 'socialReasons', action: 'update' },
    { name: 'socialReasons:delete', description: 'Excluir razões sociais', resource: 'socialReasons', action: 'delete' },
    
    // Dashboard
    { name: 'dashboard:read', description: 'Acessar dashboard', resource: 'dashboard', action: 'read' },
    
    // Admin (permissão especial)
    { name: 'admin', description: 'Acesso total ao sistema', resource: '*', action: '*' },
  ];

  const permissions = [];
  for (const perm of permissionsToCreate) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(created);
  }

  // 2. Criar roles
  console.log('👥 Criando roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRADOR' },
    update: {},
    create: {
      name: 'ADMINISTRADOR',
      description: 'Acesso total ao sistema',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Pode criar e editar documentos',
    },
  });

  const readerRole = await prisma.role.upsert({
    where: { name: 'LEITOR' },
    update: {},
    create: {
      name: 'LEITOR',
      description: 'Apenas visualização de documentos',
    },
  });

  // 3. Associar permissões às roles
  console.log('🔐 Associando permissões às roles...');
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Editor: create, read, update
  for (const permission of permissions.filter((p) =>
    ['documents:read', 'documents:create', 'documents:update'].includes(p.name)
  )) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: editorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: editorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Leitor: apenas read
  const readPermission = permissions.find((p) => p.name === 'documents:read');
  if (readPermission) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: readerRole.id,
          permissionId: readPermission.id,
        },
      },
      update: {},
      create: {
        roleId: readerRole.id,
        permissionId: readPermission.id,
      },
    });
  }

  // 3b. Criar role SUPERADMIN
  console.log('👑 Criando role SUPERADMIN...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {},
    create: {
      name: 'SUPERADMIN',
      description: 'Acesso total ao sistema — gerencia empresas e usuários',
    },
  });

  const adminPermission = permissions.find((p) => p.name === 'admin');
  if (adminPermission) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: adminPermission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: adminPermission.id,
      },
    });
  }

  // 4. Criar usuário admin e associar role ADMINISTRADOR
  console.log('👤 Criando usuário admin...');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sim.com' },
    update: {
      name: 'Administrador do Sistema',
      password: await hash('admin123', 10),
      emailVerified: new Date(),
    },
    create: {
      name: 'Administrador do Sistema',
      email: 'admin@sim.com',
      password: await hash('admin123', 10),
      emailVerified: new Date(),
    },
  });

  // Remover roles existentes do usuário admin (se houver)
  await prisma.userRole.deleteMany({
    where: { userId: adminUser.id },
  });

  // Associar role ADMINISTRADOR ao usuário admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Associar role SUPERADMIN ao usuário admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`✅ Usuário admin criado: ${adminUser.email} com roles ADMINISTRADOR e SUPERADMIN`);

  // 5. Uma empresa e estabelecimento para o admin (evita aviso de "sem empresa")
  console.log('🏢 Criando empresa para o admin...');
  const company1 = await prisma.company.upsert({
    where: { cnpj: '60.680.279/0001-23' },
    update: {},
    create: {
      name: 'SANDVIK MGS S.A.',
      cnpj: '60.680.279/0001-23',
      stateRegistration: '407651385112',
      municipalRegistration: '129103-3',
      status: 'ACTIVE',
    },
  });

  await prisma.establishment.upsert({
    where: { cnpj: '60.680.279/0001-23' },
    update: {},
    create: {
      companyId: company1.id,
      name: 'Matriz São Paulo',
      code: 'MTZ-SP',
      cnpj: '60.680.279/0001-23',
      address: 'Rua Example, 123',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      status: 'ACTIVE',
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: adminUser.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      companyId: company1.id,
      code: 'ADM001',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`  - ${permissions.length} permissões criadas`);
  console.log(`  - 3 roles criadas (ADMINISTRADOR, EDITOR, LEITOR)`);
  console.log(`  - 1 usuário: admin@sim.com com role ADMINISTRADOR`);
  console.log(`  - 1 empresa (${company1.name}) com 1 estabelecimento, admin associado (ADM001)`);
  console.log('\n🔑 Credenciais do Admin:');
  console.log(`  Email: admin@sim.com`);
  console.log(`  Senha: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
