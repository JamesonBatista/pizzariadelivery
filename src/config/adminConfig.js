export const adminConfig = Object.freeze({
  enabled: false,
  defaultRole: "manager",
  roles: {
    owner: {
      label: "Dono",
      permissions: ["manage_all"]
    },
    manager: {
      label: "Gerente",
      permissions: [
        "manage_banner",
        "manage_products",
        "manage_orders",
        "manage_whatsapp",
        "manage_settings"
      ]
    },
    attendant: {
      label: "Atendente",
      permissions: ["manage_orders", "contact_customer"]
    }
  },
  sections: [
    {
      id: "dashboard",
      label: "Resumo"
    },
    {
      id: "banner",
      label: "Banner"
    },
    {
      id: "products",
      label: "Produtos"
    },
    {
      id: "orders",
      label: "Pedidos"
    },
    {
      id: "customers",
      label: "Clientes"
    },
    {
      id: "whatsapp",
      label: "WhatsApp"
    },
    {
      id: "settings",
      label: "Configuracoes"
    }
  ]
});

export function canAccessAdminSection(roleId, sectionId, config = adminConfig) {
  const role = config.roles[roleId] || config.roles[config.defaultRole];

  if (role.permissions.includes("manage_all")) {
    return true;
  }

  const sectionPermission = {
    banner: "manage_banner",
    products: "manage_products",
    orders: "manage_orders",
    customers: "manage_orders",
    whatsapp: "manage_whatsapp",
    settings: "manage_settings"
  }[sectionId];

  return !sectionPermission || role.permissions.includes(sectionPermission);
}
