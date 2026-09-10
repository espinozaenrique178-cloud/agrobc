// Destacados: los cultivos relevantes de Baja California, que se muestran
// por defecto en el selector. addCrops() suma aquí los que vienen de Supabase.
export const CROPS = [
  'Tomate', 'Fresa', 'Trigo', 'Lechuga', 'Pepino', 'Vid',
  'Chile', 'Cebolla', 'Brócoli', 'Aguacate', 'Espárrago', 'Alfalfa',
];

// Catálogo completo, depurado de datos oficiales de SIAP (Servicio de
// Información Agroalimentaria y Pesquera). Un mismo producto puede usarse en
// cultivos que no se dan en la localidad del usuario, así que el selector
// permite llegar a cualquiera de estos, no solo a los destacados.
export const ALL_CROPS = [
  'Aceituna', 'Acelga', 'Achiote', 'Agapando', 'Agave', 'Aguacate', 'Ajo', 'Ajonjolí', 'Albahaca',
  'Albricia', 'Alcachofa', 'Alcatraz', 'Alfalfa', 'Algarrobo', 'Algodón hueso', 'Alhelí',
  'Alpiste', 'Alstroemeria', 'Amaranto', 'Anís', 'Anturios', 'Apio', 'Arándano',
  'Árbol de navidad', 'Aretillo', 'Arrayán', 'Arroz palay', 'Arvejón', 'Aster', 'Ave del paraíso',
  'Avena', 'Baby back choi', 'Bambú', 'Bangaña', 'Begonia', 'Belén', 'Berenjena', 'Betabel',
  'Boi choi', 'Brócoli', 'Cacahuate', 'Cacao', 'Café cereza', 'Caimito', 'Calabacita', 'Calabaza',
  'Calabaza semilla o chihua', 'Calancoe', 'Camote', 'Caña de azúcar', 'Canola', 'Capulín',
  'Carambolo', 'Cártamo', 'Cebada', 'Cebolla', 'Centeno grano', 'Cereza', 'Chabacano', 'Chayote',
  'Chía', 'Chícharo', 'Chilacayote', 'Chile seco', 'Chile verde', 'Chirimoya', 'Chives',
  'Cilantro', 'Cineraria', 'Ciruela', 'Clavel', 'Clyptoria', 'Coco fruta', 'Col (repollo)',
  'Col de bruselas', 'Coliflor', 'Comino', 'Copra', 'Coquia', 'Crisantemo', 'Cyclamen', 'Dalia',
  'Dátil', 'Dólar', 'Durazno', 'Ebo (janamargo o veza)', 'Ejote', 'Elote', 'Eneldo', 'Epazote',
  'Espárrago', 'Espinaca', 'Estropajo', 'Eucalipto', 'Flor cera', 'Flor perrito', 'Frambuesa',
  'Fresa', 'Frijol', 'Frijol x pelón', 'Gai lan (kay laan)', 'Garbanzo', 'Geranio', 'Gerbera',
  'Girasol', 'Girasol flor', 'Gladiola', 'Granada', 'Guaje', 'Guamúchil', 'Guanábana', 'Guayaba',
  'Haba grano', 'Haba verde', 'Helecho', 'Henequén', 'Hierbabuena', 'Higo',
  'Hoja de plátano (belillo)', 'Hortensia', 'Huauzontle', 'Hule hevea', 'Inmortal',
  'Jaca (jackfruit)', 'Jamaica', 'Jatropha', 'Jengibre', 'Jícama', 'Kale', 'Kohlrabi', 'Lechuga',
  'Lenteja', 'Lilium', 'Lima', 'Limón', 'Limón real', 'Limonium', 'Litchi', 'Macadamia', 'Maguey',
  'Maguey forrajero', 'Maguey mixiotero', 'Maguey pulquero (miles de lts.)', 'Maíz', 'Malanga',
  'Mamey', 'Mandarina', 'Mango', 'Mangostán', 'Mano de león', 'Manzana', 'Manzanilla', 'Maracuyá',
  'Marañón', 'Margarita', 'Mejorana', 'Melón', 'Melón amargo', 'Membrillo', 'Menta', 'Moringa',
  'Nabo', 'Nanche', 'Napa', 'Naranja', 'Nardo', 'Níspero', 'Nochebuena', 'Noni', 'Nopal forrajero',
  'Nopalitos', 'Nube', 'Nuez', 'Okra (angú o gombo)', 'Orégano', 'Orquídea',
  'Palma africana o de aceite', 'Palma camedor', 'Palma de ornato', 'Palma taco', 'Papa', 'Pápalo',
  'Papaya', 'Pasto tapete (m2)', 'Pastos y praderas', 'Pensamiento', 'Pepino', 'Pera', 'Perejil',
  'Perón', 'Persimonio', 'Petunia', 'Pimienta', 'Piña', 'Piñón', 'Pipicha', 'Pistache', 'Pitahaya',
  'Pitaya', 'Plantero de tabaco', 'Plátano', 'Polar', 'Pon-pon', 'Poro (leek)', 'Quelite',
  'Rábano', 'Rambután', 'Romerito', 'Romero', 'Rosa', 'Sábila', 'Salvia', 'Sandía', 'Saramuyo',
  'Shangai-bock-choy', 'Shop suey', 'Solidago', 'Sorgo', 'Sorgo escobero', 'Soya', 'Statice',
  'Stevia', 'Tabaco', 'Tamarindo', 'Tangelo', 'Tangerina', 'Tarragón', 'Té limón', 'Tejocote',
  'Terciopelo', 'Tomate rojo (jitomate)', 'Tomate verde', 'Tomillo', 'Toronja (pomelo)', 'Trébol',
  'Trigo', 'Triticale', 'Tulipán holandés', 'Tuna', 'Uva', 'Vainilla', 'Verdolaga', 'Yu-choy',
  'Yuca alimenticia', 'Zanahoria', 'Zapote', 'Zapupe', 'Zarzamora', 'Zempoalxochitl',
];

export function addCrops(rows) {
  (rows || []).forEach((row) => {
    if (!CROPS.includes(row.name)) CROPS.push(row.name);
  });
}

// Destacados: los 4 genéricos y los 4 específicos que ya existían.
export const PROBLEMS = [
  'Plaga', 'Enfermedad', 'Maleza', 'Nutrición',
  'Mosca blanca', 'Pulgón', 'Araña roja', 'Trips',
];

// Catálogo completo: selección curada de plagas, enfermedades, malezas y
// deficiencias nutricionales comunes en cultivos de México. No existe una
// fuente oficial única como SIAP para este caso.
export const ALL_PROBLEMS = [
  'Plaga', 'Enfermedad', 'Maleza', 'Nutrición', 'Mosca blanca', 'Pulgón', 'Araña roja', 'Trips',
  'Minador de la hoja', 'Gusano cogollero', 'Gusano soldado', 'Palomilla dorso de diamante',
  'Barrenador del tallo', 'Picudo del algodonero', 'Mosca de la fruta', 'Gallina ciega',
  'Gusano de alambre', 'Chapulín', 'Cochinilla', 'Escama', 'Nematodos', 'Barrenador del fruto',
  'Chinche apestosa', 'Rata de campo', 'Caracol y babosa', 'Ácaro blanco', 'Ácaro del bronceado',
  'Diabrótica', 'Barrenador del brote', 'Psílido asiático de los cítricos',
  'Barrenador del hueso (aguacate)', 'Falso medidor', 'Tizón tardío', 'Tizón temprano',
  'Cenicilla (oídio)', 'Mildiu velloso', 'Roya', 'Antracnosis', 'Fusarium (marchitez)',
  'Verticilosis', 'Pudrición de raíz', 'Pudrición gris (Botritis)', 'Mancha bacteriana',
  'Cancro bacteriano', 'Virus del mosaico', 'Virus del rizado amarillo',
  'Damping-off (ahogamiento de plántula)', 'Carbón', 'Huanglongbing (dragón amarillo)', 'Sarna',
  'Zacate Johnson', 'Coquillo (coyolillo)', 'Correhuela', 'Zacate pata de gallina',
  'Diente de león', 'Quelite cenizo', 'Campanilla (Ipomoea)', 'Golondrina (lechosa)', 'Malva',
  'Zacate Bermuda', 'Toloache', 'Rábano silvestre', 'Cardo', 'Trompillo',
  'Deficiencia de nitrógeno', 'Deficiencia de fósforo', 'Deficiencia de potasio',
  'Deficiencia de calcio', 'Deficiencia de magnesio', 'Deficiencia de azufre',
  'Deficiencia de hierro', 'Deficiencia de zinc', 'Deficiencia de boro',
  'Deficiencia de manganeso', 'Deficiencia de cobre', 'Deficiencia de molibdeno',
];

const PROBLEM_CATEGORY_ADDITIONS = {
  'Minador de la hoja': 'plaga', 'Gusano cogollero': 'plaga', 'Gusano soldado': 'plaga',
  'Palomilla dorso de diamante': 'plaga', 'Barrenador del tallo': 'plaga',
  'Picudo del algodonero': 'plaga', 'Mosca de la fruta': 'plaga', 'Gallina ciega': 'plaga',
  'Gusano de alambre': 'plaga', 'Chapulín': 'plaga', 'Cochinilla': 'plaga', 'Escama': 'plaga',
  'Nematodos': 'plaga', 'Barrenador del fruto': 'plaga', 'Chinche apestosa': 'plaga',
  'Rata de campo': 'plaga', 'Caracol y babosa': 'plaga', 'Ácaro blanco': 'plaga',
  'Ácaro del bronceado': 'plaga', 'Diabrótica': 'plaga', 'Barrenador del brote': 'plaga',
  'Psílido asiático de los cítricos': 'plaga', 'Barrenador del hueso (aguacate)': 'plaga',
  'Falso medidor': 'plaga',
  'Tizón tardío': 'enfermedad', 'Tizón temprano': 'enfermedad', 'Cenicilla (oídio)': 'enfermedad',
  'Mildiu velloso': 'enfermedad', 'Roya': 'enfermedad', 'Antracnosis': 'enfermedad',
  'Fusarium (marchitez)': 'enfermedad', 'Verticilosis': 'enfermedad',
  'Pudrición de raíz': 'enfermedad', 'Pudrición gris (Botritis)': 'enfermedad',
  'Mancha bacteriana': 'enfermedad', 'Cancro bacteriano': 'enfermedad',
  'Virus del mosaico': 'enfermedad', 'Virus del rizado amarillo': 'enfermedad',
  'Damping-off (ahogamiento de plántula)': 'enfermedad', 'Carbón': 'enfermedad',
  'Huanglongbing (dragón amarillo)': 'enfermedad', 'Sarna': 'enfermedad',
  'Zacate Johnson': 'maleza', 'Coquillo (coyolillo)': 'maleza', 'Correhuela': 'maleza',
  'Zacate pata de gallina': 'maleza', 'Diente de león': 'maleza', 'Quelite cenizo': 'maleza',
  'Campanilla (Ipomoea)': 'maleza', 'Golondrina (lechosa)': 'maleza', 'Malva': 'maleza',
  'Zacate Bermuda': 'maleza', 'Toloache': 'maleza', 'Rábano silvestre': 'maleza',
  'Cardo': 'maleza', 'Trompillo': 'maleza',
  'Deficiencia de nitrógeno': 'nutricion', 'Deficiencia de fósforo': 'nutricion',
  'Deficiencia de potasio': 'nutricion', 'Deficiencia de calcio': 'nutricion',
  'Deficiencia de magnesio': 'nutricion', 'Deficiencia de azufre': 'nutricion',
  'Deficiencia de hierro': 'nutricion', 'Deficiencia de zinc': 'nutricion',
  'Deficiencia de boro': 'nutricion', 'Deficiencia de manganeso': 'nutricion',
  'Deficiencia de cobre': 'nutricion', 'Deficiencia de molibdeno': 'nutricion',
};

export const CATEGORY_BY_PROBLEM = {
  Plaga: 'plaga', 'Mosca blanca': 'plaga', Pulgón: 'plaga', 'Araña roja': 'plaga', Trips: 'plaga',
  Enfermedad: 'enfermedad',
  Maleza: 'maleza',
  Nutrición: 'nutricion',
  ...PROBLEM_CATEGORY_ADDITIONS,
};

export const CATEGORY_LABEL = {
  plaga: 'Insecticida',
  enfermedad: 'Fungicida',
  maleza: 'Herbicida',
  nutricion: 'Nutrición',
};

// Respaldo mientras carga Supabase o si falla la conexión.
const FALLBACK_PRODUCTS = [
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
];

// Todo el catálogo real vive en Supabase (`productos`), administrado desde
// AdminPanelScreen. PRODUCTS se reemplaza por completo cuando llega esa data.
export let PRODUCTS = FALLBACK_PRODUCTS;

export function setProducts(rows) {
  if (!rows || rows.length === 0) return;
  PRODUCTS = rows.map((row) => ({
    mfg: row.mfg || '',
    domain: '',
    fichaUrl: row.ficha_tecnica || '',
    name: row.name,
    type: row.type || '',
    ingredient: row.ingredient || '',
    presentation: row.presentation || '',
    price: Number(row.price) || 0,
    category: row.category,
    crops: row.crops && row.crops.length ? row.crops : ['any'],
  }));
}

// Fisher-Yates: baraja sin mutar el arreglo original. Se usa para que, dentro
// de cada nivel de prioridad, no siempre ganen los mismos fabricantes por
// venir primero en orden alfabético (ej. "Ácido..." de Servicios NH3 tapando
// para siempre a cualquier producto de un distribuidor nuevo).
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Nunca mezcla categorías: primero coincidencia exacta de cultivo dentro
// de la categoría pedida, luego el resto de esa misma categoría. Dentro de
// cada nivel, el orden es aleatorio en cada búsqueda (ver shuffle arriba).
export function matchProducts(cropValue, problemValue) {
  const category = CATEGORY_BY_PROBLEM[problemValue] || null;
  const inCategory = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS.slice();

  const cropSpecific = shuffle(inCategory.filter((p) => p.crops.includes(cropValue)));
  const cropAny = shuffle(inCategory.filter((p) => p.crops.includes('any')));
  const rest = shuffle(inCategory.filter((p) => !p.crops.includes(cropValue) && !p.crops.includes('any')));

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
