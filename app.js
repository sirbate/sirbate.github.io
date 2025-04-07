let svgOriginal = '';
const svgInput = document.getElementById('svgInput');
const preview = document.getElementById('preview');
const fileUpload = document.getElementById('fileUpload');
const colorControls = document.getElementById('colorControls');
const colorCodeText = document.getElementById('colorCode');

const translations = {
  es: {
    title: "SVG Magic para Power Apps",
    subtitle: "De SVG a fragmentos de Power FX y YAML — sin complicaciones.",
    placeholder: "Pega tu SVG aquí",
    upload: "Subir archivo",
    preview: "Vista previa",
    copy: "COPIAR CÓDIGO POWER FX",
    copyYaml: "COPIAR BLOQUE YAML",
    footer: "Desarrollado con ❤️ para la comunidad de Power Platform",
    guide: "Cómo usar esta herramienta",
    manual: "¿Nuevo usando SVG en Power Apps?",
    manualLink: "Lee este manual práctico"
  },
  en: {
    title: "SVG Magic for Power Apps",
    subtitle: "From SVG to fully usable Power FX and YAML — no hassle.",
    placeholder: "Paste your SVG here",
    upload: "Upload file",
    preview: "Preview",
    copy: "COPY POWER FX CODE",
    copyYaml: "COPY YAML BLOCK",
    footer: "Developed with ❤️ for the Power Platform community",
    guide: "Learn how this tool works",
    manual: "New to SVG in Power Apps?",
    manualLink: "Read this practical guide"
  },
  pt: {
    title: "SVG Magic para Power Apps",
    subtitle: "De SVG para trechos de Power FX e YAML — sem complicações.",
    placeholder: "Cole seu SVG aqui",
    upload: "Enviar arquivo",
    preview: "Pré-visualização",
    copy: "COPIAR CÓDIGO POWER FX",
    copyYaml: "COPIAR BLOCO YAML",
    footer: "Desenvolvido com ❤️ para a comunidade Power Platform",
    guide: "Como usar esta ferramenta",
    manual: "Novo no uso de SVG no Power Apps?",
    manualLink: "Leia este guia prático"
  }
};

const dropdown = document.querySelector('.dropdown');
const activeLanguage = document.getElementById('activeLanguage');
activeLanguage.addEventListener('click', () => {
  dropdown.classList.toggle('open');
});

function setLanguage(lang) {
  const t = translations[lang];
  document.getElementById('title').textContent = t.title;
  document.getElementById('subtitle').textContent = t.subtitle;
  document.getElementById('svgInput').placeholder = t.placeholder;
  document.getElementById('uploadLabel').textContent = t.upload;
  document.getElementById('previewLabel').textContent = t.preview;
  document.getElementById('copyBtn').textContent = t.copy;
  document.getElementById('copyYamlBtn').textContent = t.copyYaml;
  document.getElementById('footerText').textContent = t.footer;
  document.getElementById('guideLink').textContent = t.guide;
  document.getElementById('manualText').textContent = t.manual;
  document.getElementById('manualLink').textContent = t.manualLink;

  const flags = {
    es: { icon: 'fi-co', label: 'Español' },
    en: { icon: 'fi-us', label: 'English' },
    pt: { icon: 'fi-br', label: 'Português' }
  };
  const current = flags[lang];
  activeLanguage.innerHTML = `<span class="fi ${current.icon}"></span> ${current.label}`;
  dropdown.classList.remove('open');
}

// 🎨 Color Picker
const pickr = Pickr.create({
  el: '#colorPickerContainer',
  theme: 'classic',
  default: '#1D5FC9',
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      input: true,
      save: false
    }
  }
});

pickr.on('change', (color) => {
  const hex = color.toHEXA().toString();
  colorCodeText.textContent = `Color actual (haz clic para cambiar): ${hex}`;
  if (!svgOriginal) return;
  const updated = svgOriginal.replace(/fill=['"](.*?)['"]/g, `fill='${hex}'`).replace(/"/g, "'");
  preview.innerHTML = updated;
  svgInput.value = updated;
});

// SVG input listener
svgInput.addEventListener('input', () => {
  svgOriginal = svgInput.value;
  updatePreview(svgOriginal);
});

// File Upload
fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'image/svg+xml') {
    alert('Por favor, sube un archivo SVG válido.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    svgOriginal = event.target.result;
    svgInput.value = svgOriginal;
    updatePreview(svgOriginal);
  };
  reader.readAsText(file);
});

function updatePreview(svg) {
  if (!svg) {
    preview.innerHTML = '';
    colorControls.style.display = 'none';
    return;
  }

  const matches = [...svg.matchAll(/fill=['"](.*?)['"]/g)];
  const coloresUnicos = [...new Set(matches.map(m => m[1]))];

  if (coloresUnicos.length === 1) {
    colorControls.style.display = 'flex';
  } else {
    colorControls.style.display = 'none';
  }

  preview.innerHTML = svg.replace(/"/g, "'");
}

// 📋 Copiar Power FX
function copyPowerFX() {
  const svg = preview.innerHTML.replace(/"/g, "'");
  const fxCode = `"data:image/svg+xml;utf8," & EncodeUrl("${svg}")`;
  navigator.clipboard.writeText(fxCode).then(() =>
    alert('Código Power FX copiado al portapapeles 📋')
  );
}

// 🆕 Copiar bloque YAML
function copyYAML() {
  const svg = preview.innerHTML
    .replace(/"/g, "''") // escapa comillas dobles como Power FX espera
    .replace(/\n/g, '') // remueve saltos de línea

  const fxCode = `= "data:image/svg+xml; utf-8, " & EncodeUrl($"${svg}")`;

  const yaml = `- SVGMagic:
    Control: Image
    Properties:
        Image: '${fxCode}'
        Height: =150
        Width: =150
        X: =50
        Y: =50`;

  navigator.clipboard.writeText(yaml).then(() =>
    alert('Bloque YAML copiado al portapapeles 📋')
  );
}


// Idioma por defecto
setLanguage('en');
