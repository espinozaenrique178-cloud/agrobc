export const CROPS = [
  'Tomate', 'Fresa', 'Trigo', 'Lechuga', 'Pepino', 'Vid',
  'Chile', 'Cebolla', 'Brócoli', 'Aguacate', 'Espárrago', 'Alfalfa',
];

export const PROBLEMS = [
  'Plaga', 'Enfermedad', 'Maleza', 'Nutrición',
  'Mosca blanca', 'Pulgón', 'Araña roja', 'Trips',
];

export const CATEGORY_BY_PROBLEM = {
  Plaga: 'plaga', 'Mosca blanca': 'plaga', Pulgón: 'plaga', 'Araña roja': 'plaga', Trips: 'plaga',
  Enfermedad: 'enfermedad',
  Maleza: 'maleza',
  Nutrición: 'nutricion',
};

export const CATEGORY_LABEL = {
  plaga: 'Insecticida',
  enfermedad: 'Fungicida',
  maleza: 'Herbicida',
  nutricion: 'Nutrición',
};

export const PRODUCTS = [
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Sivanto Prime', type: 'Insecticida', ingredient: 'Flupyradifurona', presentation: '1 L', price: 480, category: 'plaga', crops: ['Tomate', 'Fresa', 'Chile', 'Pepino', 'Lechuga'] },
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Confidor', type: 'Insecticida', ingredient: 'Imidacloprid', presentation: '1 L', price: 410, category: 'plaga', crops: ['Tomate', 'Cebolla', 'Brócoli'] },
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Decis', type: 'Insecticida', ingredient: 'Deltametrina', presentation: '500 ml', price: 365, category: 'plaga', crops: ['Fresa', 'Chile', 'Lechuga'] },
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Movento', type: 'Insecticida', ingredient: 'Espirotetramat', presentation: '1 L', price: 590, category: 'plaga', crops: ['Vid', 'Aguacate'] },
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Fitoraz', type: 'Fungicida', ingredient: 'Propineb + Cimoxanilo', presentation: '1 kg', price: 445, category: 'enfermedad', crops: ['Tomate', 'Vid', 'Aguacate'] },
  { mfg: 'Bayer', domain: 'bayer.com', name: 'Aliette', type: 'Fungicida', ingredient: 'Fosetil-Al', presentation: '1 kg', price: 520, category: 'enfermedad', crops: ['Vid', 'Aguacate', 'Fresa'] },

  { mfg: 'Syngenta', domain: 'syngenta.com', name: 'Actara', type: 'Insecticida', ingredient: 'Tiametoxam', presentation: '1 kg', price: 520, category: 'plaga', crops: ['Tomate', 'Chile', 'Lechuga', 'Brócoli'] },
  { mfg: 'Syngenta', domain: 'syngenta.com', name: 'Engeo', type: 'Insecticida', ingredient: 'Tiametoxam + Lambdacihalotrina', presentation: '1 L', price: 610, category: 'plaga', crops: ['Fresa', 'Pepino', 'Chile'] },
  { mfg: 'Syngenta', domain: 'syngenta.com', name: 'Amistar', type: 'Fungicida', ingredient: 'Azoxistrobina', presentation: '1 L', price: 680, category: 'enfermedad', crops: ['Tomate', 'Vid', 'Fresa'] },
  { mfg: 'Syngenta', domain: 'syngenta.com', name: 'Gramoxone', type: 'Herbicida', ingredient: 'Paraquat', presentation: '5 L', price: 390, category: 'maleza', crops: ['any'] },

  { mfg: 'Corteva', domain: 'corteva.com', name: 'Coragen', type: 'Insecticida', ingredient: 'Clorantraniliprol', presentation: '1 L', price: 730, category: 'plaga', crops: ['Tomate', 'Chile', 'Lechuga', 'Brócoli'] },
  { mfg: 'Corteva', domain: 'corteva.com', name: 'Lannate', type: 'Insecticida', ingredient: 'Metomilo', presentation: '1 L', price: 340, category: 'plaga', crops: ['Tomate', 'Fresa', 'Pepino'] },
  { mfg: 'Corteva', domain: 'corteva.com', name: 'Tordon', type: 'Herbicida', ingredient: 'Picloram', presentation: '1 L', price: 455, category: 'maleza', crops: ['Trigo', 'Alfalfa'] },

  { mfg: 'UPL', domain: 'upl-ltd.com', name: 'Lancer Gold', type: 'Insecticida', ingredient: 'Acetamiprid', presentation: '500 g', price: 295, category: 'plaga', crops: ['Tomate', 'Chile'] },
  { mfg: 'UPL', domain: 'upl-ltd.com', name: 'Manzate', type: 'Fungicida', ingredient: 'Mancozeb', presentation: '1 kg', price: 260, category: 'enfermedad', crops: ['Tomate', 'Fresa', 'Vid', 'Cebolla'] },

  { mfg: 'BASF', domain: 'agriculture.basf.com', name: 'Cabrio', type: 'Fungicida', ingredient: 'Piraclostrobina', presentation: '1 L', price: 715, category: 'enfermedad', crops: ['Vid', 'Fresa', 'Aguacate'] },
  { mfg: 'BASF', domain: 'agriculture.basf.com', name: 'Priori Xtra', type: 'Fungicida', ingredient: 'Azoxistrobina + Ciproconazol', presentation: '1 L', price: 750, category: 'enfermedad', crops: ['Tomate', 'Cebolla', 'Lechuga'] },
  { mfg: 'BASF', domain: 'agriculture.basf.com', name: 'Basta', type: 'Herbicida', ingredient: 'Glufosinato de amonio', presentation: '1 L', price: 470, category: 'maleza', crops: ['any'] },

  // Los fertilizantes (categoría 'nutricion') ya no van fijos aquí — se cargan
  // en vivo desde Supabase (tabla `fertilizantes`), administrados desde AdminPanelScreen.
];

// Catálogo dinámico de fertilizantes, llenado por setFertilizantes() tras
// consultar Supabase. Vive aparte de PRODUCTS para no tocar el resto del archivo.
let fertilizantes = [];

export function setFertilizantes(rows) {
  fertilizantes = (rows || []).map((row) => ({
    mfg: row.mfg || 'Fertilizante',
    domain: '',
    fichaUrl: row.ficha_tecnica || '',
    name: row.name,
    type: 'Fertilizante',
    ingredient: '',
    presentation: row.presentation,
    price: Number(row.price) || 0,
    category: 'nutricion',
    crops: ['any'],
  }));
}

function allProducts() {
  return PRODUCTS.concat(fertilizantes);
}

// Nunca mezcla categorías: primero coincidencia exacta de cultivo dentro
// de la categoría pedida, luego el resto de esa misma categoría.
export function matchProducts(cropValue, problemValue) {
  const category = CATEGORY_BY_PROBLEM[problemValue] || null;
  const all = allProducts();
  const inCategory = category ? all.filter((p) => p.category === category) : all.slice();

  const cropSpecific = inCategory.filter((p) => p.crops.includes(cropValue));
  const cropAny = inCategory.filter((p) => p.crops.includes('any'));
  const rest = inCategory.filter((p) => !p.crops.includes(cropValue) && !p.crops.includes('any'));

  const seen = new Set();
  const out = [];
  [cropSpecific, cropAny, rest].forEach((pool) => {
    pool.forEach((p) => {
      if (out.length >= 3) return;
      const key = p.mfg + '|' + p.name;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(p);
    });
  });
  return out.slice(0, 3);
}

export const MANUFACTURERS = [
  { name: 'Bayer', domain: 'bayer.com', categories: 'Insecticidas · Fungicidas' },
  { name: 'Syngenta', domain: 'syngenta.com', categories: 'Insecticidas · Fungicidas · Herbicidas' },
  { name: 'Corteva', domain: 'corteva.com', categories: 'Herbicidas · Insecticidas' },
  { name: 'UPL', domain: 'upl-ltd.com', categories: 'Insecticidas · Fungicidas' },
  { name: 'BASF', domain: 'agriculture.basf.com', categories: 'Fungicidas · Herbicidas' },
  { name: 'Yara', domain: 'yara.com', categories: 'Nutrición vegetal' },
  { name: 'ICL', domain: 'icl-group.com', categories: 'Nutrición vegetal' },
  { name: 'SQM', domain: 'sqm.com', categories: 'Nutrición vegetal' },
  { name: 'Haifa', domain: 'haifa-group.com', categories: 'Nutrición vegetal' },
  { name: 'Mosaic', domain: 'mosaicco.com', categories: 'Nutrición vegetal' },
  { name: 'Nutrien Ag Solutions', domain: 'nutrien.com', categories: 'Nutrición vegetal' },
  { name: 'Compo Expert', domain: 'compo-expert.com', categories: 'Nutrición vegetal' },
  { name: 'Van Iperen', domain: 'vaniperen.com', categories: 'Nutrición vegetal' },
];
