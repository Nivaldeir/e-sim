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

  console.log(`✅ Usuário admin criado: ${adminUser.email} com role ADMINISTRADOR`);

  // 5. Associar usuário admin às empresas (opcional - para não ter o aviso de sem empresa)
  console.log('🏢 Associando usuário admin às empresas...');
  
  // Criar empresas primeiro (se ainda não existirem)
  const companies = [];
  
  // Empresa 1
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
  companies.push(company1);

  // Associar admin à primeira empresa
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

  // 6. Criar usuários adicionais com diferentes roles
  console.log('👥 Criando usuários adicionais...');
  
  // Usuário Editor
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@sim.com' },
    update: {},
    create: {
      name: 'João Editor',
      email: 'editor@sim.com',
      password: await hash('editor123', 10),
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: editorUser.id,
        roleId: editorRole.id,
      },
    },
    update: {},
    create: {
      userId: editorUser.id,
      roleId: editorRole.id,
    },
  });

  // Usuário Leitor
  const readerUser = await prisma.user.upsert({
    where: { email: 'leitor@sim.com' },
    update: {},
    create: {
      name: 'Maria Leitora',
      email: 'leitor@sim.com',
      password: await hash('leitor123', 10),
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: readerUser.id,
        roleId: readerRole.id,
      },
    },
    update: {},
    create: {
      userId: readerUser.id,
      roleId: readerRole.id,
    },
  });

  // Usuário Editor 2
  const editorUser2 = await prisma.user.upsert({
    where: { email: 'editor2@sim.com' },
    update: {},
    create: {
      name: 'Pedro Editor',
      email: 'editor2@sim.com',
      password: await hash('editor123', 10),
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: editorUser2.id,
        roleId: editorRole.id,
      },
    },
    update: {},
    create: {
      userId: editorUser2.id,
      roleId: editorRole.id,
    },
  });

  console.log('✅ Usuários criados com suas respectivas roles');

  // 7. Criar empresas e estabelecimentos adicionais (se ainda não existirem)
  console.log('🏢 Criando empresas e estabelecimentos adicionais...');
  
  // Empresa 2 (se ainda não existe)
  const company2 = await prisma.company.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'TECH SOLUTIONS LTDA',
      cnpj: '12.345.678/0001-90',
      stateRegistration: '123456789012',
      municipalRegistration: '987654-3',
      status: 'ACTIVE',
    },
  });
  companies.push(company2);

  // Estabelecimento da Empresa 1
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

  // Estabelecimento da Empresa 2
  await prisma.establishment.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      companyId: company2.id,
      name: 'Filial Rio de Janeiro',
      code: 'FIL-RJ',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Atlântica, 456',
      district: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22021-000',
      status: 'ACTIVE',
    },
  });

  // Empresa 3
  const company3 = await prisma.company.upsert({
    where: { cnpj: '98.765.432/0001-10' },
    update: {},
    create: {
      name: 'INDUSTRIAL BRASIL S.A.',
      cnpj: '98.765.432/0001-10',
      stateRegistration: '987654321098',
      municipalRegistration: '456789-1',
      status: 'ACTIVE',
    },
  });
  companies.push(company3);

  await prisma.establishment.upsert({
    where: { cnpj: '98.765.432/0001-10' },
    update: {},
    create: {
      companyId: company3.id,
      name: 'Unidade Belo Horizonte',
      code: 'UNI-BH',
      cnpj: '98.765.432/0001-10',
      address: 'Rua da Bahia, 789',
      district: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30160-012',
      status: 'ACTIVE',
    },
  });

  // 8. Associar usuários às empresas
  console.log('🔗 Associando usuários às empresas...');
  
  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: editorUser.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: editorUser.id,
      companyId: company1.id,
      code: 'EDT001',
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: editorUser2.id,
        companyId: company2.id,
      },
    },
    update: {},
    create: {
      userId: editorUser2.id,
      companyId: company2.id,
      code: 'EDT002',
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: readerUser.id,
        companyId: company3.id,
      },
    },
    update: {},
    create: {
      userId: readerUser.id,
      companyId: company3.id,
      code: 'LEI001',
    },
  });

  // 9. Criar órgãos de exemplo
  console.log('🏛️ Criando órgão de exemplo...');
  const organization = await prisma.organization.create({
    data: {
      name: 'PREFEITURA MUNICIPAL DE SÃO PAULO',
      shortName: 'PMSP',
      type: 'MUNICIPAL',
      city: 'São Paulo',
      state: 'SP',
      status: 'ACTIVE',
    },
  });

  // 9. Criar razão social de exemplo
  console.log('📋 Criando razão social de exemplo...');
  await prisma.socialReason.create({
    data: {
      name: 'SANDVIK COROMANT DO BRASIL INDUSTRIA E COMERCIO DE FERRAMENTAS LTDA',
      shortName: 'COROMANT',
      status: 'ACTIVE',
    },
  });

  // 10. Criar template de Extintor de Incêndio
  console.log('🔥 Criando template de Extintor de Incêndio...');
  let extintorTemplate = await prisma.documentTemplate.findFirst({
    where: { name: 'Extintor de Incêndio' },
    include: { fields: true },
  });

  if (!extintorTemplate) {
    extintorTemplate = await prisma.documentTemplate.create({
      data: {
        name: 'Extintor de Incêndio',
        description: 'Template para monitoramento de extintores de incêndio e seus vencimentos',
        classification: 'Segurança',
        isDefault: false,
        fields: {
          create: [
            {
              name: 'numero_serie',
              label: 'Número de Série',
              type: 'TEXT',
              required: true,
              order: 1,
            },
            {
              name: 'capacidade',
              label: 'Capacidade (kg)',
              type: 'NUMBER',
              required: true,
              order: 2,
            },
            {
              name: 'tipo',
              label: 'Tipo de Extintor',
              type: 'SELECT',
              required: true,
              order: 3,
              options: ['Água', 'Espuma', 'Pó Químico', 'CO2', 'Pó ABC'],
            },
            {
              name: 'localizacao',
              label: 'Localização',
              type: 'TEXT',
              required: true,
              order: 4,
            },
            {
              name: 'fabricante',
              label: 'Fabricante',
              type: 'TEXT',
              required: false,
              order: 5,
            },
            {
              name: 'data_fabricacao',
              label: 'Data de Fabricação',
              type: 'DATE',
              required: false,
              order: 6,
            },
          ],
        },
      },
      include: {
        fields: true,
      },
    });
    console.log(`✅ Template "${extintorTemplate.name}" criado com ${extintorTemplate.fields.length} campos`);
  } else {
    console.log(`ℹ️ Template "${extintorTemplate.name}" já existe com ${extintorTemplate.fields.length} campos`);
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`  - ${permissions.length} permissões criadas`);
  console.log(`  - 3 roles criadas (ADMINISTRADOR, EDITOR, LEITOR)`);
  console.log(`  - Role ADMINISTRADOR possui todas as ${permissions.length} permissões`);
  console.log(`  - 4 usuários criados:`);
  console.log(`    • admin@sim.com → ADMINISTRADOR (senha: admin123)`);
  console.log(`    • editor@sim.com → EDITOR (senha: editor123)`);
  console.log(`    • editor2@sim.com → EDITOR (senha: editor123)`);
  console.log(`    • leitor@sim.com → LEITOR (senha: leitor123)`);
  console.log(`  - ${companies.length} empresas criadas com seus estabelecimentos`);
  console.log(`  - Usuários associados às empresas com códigos:`);
  console.log(`    • admin@sim.com → ${company1.name} (ADM001)`);
  console.log(`    • editor@sim.com → ${company1.name} (EDT001)`);
  console.log(`    • editor2@sim.com → ${company2.name} (EDT002)`);
  console.log(`    • leitor@sim.com → ${company3.name} (LEI001)`);
  console.log(`  - 1 órgão criado`);
  console.log(`  - 1 razão social criada`);
  console.log(`  - 1 template de documento criado (Extintor de Incêndio)`);
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
