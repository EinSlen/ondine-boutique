export function verifyTheme(files) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  const json = {};
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.json')) {
      try { json[path] = JSON.parse(content); } catch (error) { failures.push(path + ': ' + error.message); }
    }
  }
  const getKey = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.liquid')) {
      for (const match of content.matchAll(/{%[-]?\s*render\s+'([^']+)'/g)) check(Boolean(files['snippets/' + match[1] + '.liquid']), path + ': missing snippet ' + match[1]);
      for (const match of content.matchAll(/{%[-]?\s*sections\s+'([^']+)'/g)) check(Boolean(files['sections/' + match[1] + '.json']), path + ': missing section group ' + match[1]);
      for (const match of content.matchAll(/'([^']+)'\s*\|\s*t\b/g)) {
        for (const locale of ['en.default', 'fr']) check(getKey(json['locales/' + locale + '.json'], match[1]) !== undefined, path + ': missing ' + locale + ' translation ' + match[1]);
      }
      const schema = content.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
      if (schema) {
        try { json[path] = JSON.parse(schema[1]); } catch (error) { failures.push(path + ': schema ' + error.message); }
      }
      const script = content.match(/{%\s*javascript\s*%}([\s\S]*?){%\s*endjavascript\s*%}/);
      if (script) { try { new Function(script[1]); } catch (error) { failures.push(path + ': JavaScript ' + error.message); } }
    }
    if (path.endsWith('.js')) { try { new Function(content); } catch (error) { failures.push(path + ': ' + error.message); } }
  }
  for (const [path, data] of Object.entries(json)) {
    if (!path.startsWith('templates/') && !path.endsWith('-group.json')) continue;
    const sections = data.sections || {};
    check(Array.isArray(data.order), path + ': missing section order');
    for (const id of data.order || []) check(Boolean(sections[id]), path + ': unknown section ' + id);
    for (const [id, section] of Object.entries(sections)) {
      const filename = 'sections/' + section.type + '.liquid';
      check(Boolean(files[filename]), path + ': unknown section type ' + section.type);
      const schema = json[filename];
      if (!schema) continue;
      const validateSettings = (settings, definitions, where) => {
        const definitionsById = Object.fromEntries((definitions || []).filter(item => item.id).map(item => [item.id, item]));
        for (const [key, value] of Object.entries(settings || {})) {
          const definition = definitionsById[key];
          check(Boolean(definition), where + ': unknown setting ' + key);
          if (!definition) continue;
          if (definition.type === 'range') check(typeof value === 'number' && value >= definition.min && value <= definition.max && (value - definition.min) % definition.step === 0, where + ': invalid range ' + key);
          if (definition.type === 'select') check(definition.options.some(option => option.value === value), where + ': invalid option ' + key);
          if (definition.type === 'checkbox') check(typeof value === 'boolean', where + ': invalid checkbox ' + key);
        }
      };
      validateSettings(section.settings, schema.settings, path + '/' + id);
      for (const blockId of section.block_order || []) check(Boolean(section.blocks?.[blockId]), path + ': unknown block ' + blockId);
      for (const [blockId, block] of Object.entries(section.blocks || {})) {
        const blockSchema = schema.blocks?.find(item => item.type === block.type);
        check(Boolean(blockSchema), path + ': unknown block type ' + block.type);
        if (blockSchema) validateSettings(block.settings, blockSchema.settings, path + '/' + id + '/' + blockId);
      }
    }
    if (data.layout) check(Boolean(files['layout/' + data.layout + '.liquid']), path + ': missing layout ' + data.layout);
  }
  for (const template of ['index', 'product', 'collection', 'cart', 'search', 'page', 'page.contact', 'password', '404', 'list-collections']) check(Boolean(files['templates/' + template + '.json']), 'Missing template: ' + template);
  const layout = files['layout/theme.liquid'] || '';
  check(layout.includes('{{ content_for_header }}') && layout.includes('{{ content_for_layout }}'), 'Required Shopify layout objects are missing');
  check(!layout.includes('studio-gate'), 'Secondary routes must remain accessible');
  for (const match of layout.matchAll(/'([^']+)'\s*\|\s*asset_url/g)) check(Boolean(files['assets/' + match[1]]), 'Missing asset: ' + match[1]);
  check(json['config/settings_data.json']?.current?.showcase_mode === true, 'Package must start in preview mode');
  check((files['sections/main-product.liquid'] || '').includes("render 'purchase-state'"), 'Product readiness check is missing');
  check((files['sections/main-cart.liquid'] || '').includes("render 'purchase-state'"), 'Cart readiness check is missing');
  check((files['snippets/purchase-state.liquid'] || '').includes('product.price <= 0'), 'Unpriced product check is missing');
  check((files['snippets/purchase-state.liquid'] || '').includes('eprolo-a-raccorder'), 'Supplier linkage check is missing');
  if (failures.length) throw new Error(failures.join('\n'));
  return { files: Object.keys(files).length, json: Object.keys(json).filter(path => path.endsWith('.json')).length, result: 'passed' };
}
