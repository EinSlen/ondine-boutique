// Prints, for each paid and not yet shipped order, a ready-to-send message for the supplier (Nora, Shenzhen Ksl, English)
// using her SKUs. Test orders are skipped unless --test is passed.
// node commandes.mjs             -> all orders to ship
// node commandes.mjs 1003        -> only order #1003
// node commandes.mjs --test      -> include test orders
import { gql } from './shop.mjs';

const only = process.argv.slice(2).find((a) => /^\d+$/.test(a));
const q = `query($q: String!) {
  orders(first: 50, query: $q, sortKey: CREATED_AT) {
    nodes {
      name createdAt test
      shippingAddress { name address1 address2 zip city country countryCodeV2 phone }
      lineItems(first: 20) { nodes { title variantTitle sku quantity } }
    }
  }
}`;
const filtre = `financial_status:paid fulfillment_status:unfulfilled${only ? ` name:#${only}` : ''}`;
const { orders } = await gql(q, { q: filtre });

// Supplier SKU for each shop SKU. Camera alone can also be ordered on the Alibaba listing (cheaper, 26,59 EUR).
const supplier = (sku) => {
  if (!sku) return null;
  if (sku === 'KC-KIT') return '64GB with Mount (64 GB U3 card + tripod mount, no camera)';
  if (sku.startsWith('KC1080-')) return `Alibaba listing: Multi-pack SANS CARTE SD - ${sku.includes('BLANC') ? 'Blanc' : 'Noir'}, Lot 1080P (20,27 EUR)`;
  if (!sku.startsWith('KC4K-')) return null;
  const color = sku.includes('BLANC') ? 'White' : 'Black';
  if (sku.endsWith('-DUO')) return `2 Pack H88-4K-FULL (2 cameras), ${color}`;
  if (sku.endsWith('-PACK')) return `H88-4K-FULL-64GB with Mount, ${color}`;
  return `H88-4K-FULL, ${color} (or Alibaba listing: Multi-pack SANS CARTE SD - ${color === 'White' ? 'Blanc' : 'Noir'}, 4K)`;
};

const list = orders.nodes.filter((o) => !o.test || process.argv.includes('--test'));
if (!list.length) console.log('Aucune commande payée à expédier.');
for (const o of list) {
  const a = o.shippingAddress || {};
  const items = [];
  const others = [];
  for (const li of o.lineItems.nodes) {
    const s = supplier(li.sku);
    if (s) items.push(`${li.quantity} x ${s}`);
    else others.push(`${li.quantity} x ${li.title}${li.variantTitle ? ` (${li.variantTitle})` : ''}`);
  }
  console.log(`\n===== Commande ${o.name} du ${o.createdAt.slice(0, 10)}${o.test ? ' (TEST)' : ''} =====`);
  if (items.length) {
    console.log('--- Message pour le fournisseur ---');
    console.log(`Hello Nora, new dropshipping order ${o.name}, DDP, blind shipping (no brand, no invoice or price inside), please send me the tracking number:`);
    items.forEach((c) => console.log(`- ${c}`));
    console.log(`Ship to: ${a.name}, ${a.address1}${a.address2 ? `, ${a.address2}` : ''}, ${a.zip} ${a.city}, ${a.country}${a.phone ? `, phone ${a.phone}` : ''}`);
    console.log('Thank you!');
    console.log(`--- Note à mettre dans la commande Alibaba (Nora en a besoin pour le suivi) ---\nShopify order ${o.name} - blind shipping (no brand, no invoice, no price inside)`);
    console.log('--- Avant de payer : envoyer à Nora le numéro de la commande Alibaba, elle la vérifie ---');
  }
  if (others.length) console.log(`--- Autres articles ---\n${others.map((e) => `- ${e}`).join('\n')}`);
}
