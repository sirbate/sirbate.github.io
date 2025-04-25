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
    manualLink: "Lee este manual práctico",
    toasts: {
      invalidFile: "Por favor, sube un archivo SVG válido.",
      copyPowerFX: "Código Power FX copiado al portapapeles",
      copyYAML: "Bloque YAML copiado al portapapeles"
    },
    emptySvgMessage: "Copia o sube un archivo SVG para comenzar",
    colorPickerLabel: "Color actual (haz clic para cambiar):"
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
    manualLink: "Read this practical guide",
    toasts: {
      invalidFile: "Please upload a valid SVG file.",
      copyPowerFX: "Power FX code copied to clipboard",
      copyYAML: "YAML block copied to clipboard"
    },
    emptySvgMessage: "Copy or upload an SVG file to start",
    colorPickerLabel: "Current color (click to change):"
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
    manualLink: "Leia este guia prático",
    toasts: {
      invalidFile: "Por favor, envie um arquivo SVG válido.",
      copyPowerFX: "Código Power FX copiado para a área de transferência",
      copyYAML: "Bloco YAML copiado para a área de transferência"
    },
    emptySvgMessage: "Copie ou envie um arquivo SVG para começar",
    colorPickerLabel: "Cor atual (clique para alterar):"
  }
};

const dropdown = document.querySelector('.dropdown');
const activeLanguage = document.getElementById('activeLanguage');
activeLanguage.addEventListener('click', () => {
  dropdown.classList.toggle('open');
});

let currentLanguage = 'en';

function setLanguage(lang) {
  currentLanguage = lang; 
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

  if (colorCodeText.textContent && colorCodeText.textContent.includes(':')) {
    const currentColor = colorCodeText.textContent.split(':')[1].trim();
    colorCodeText.textContent = `${t.colorPickerLabel} ${currentColor}`;
  } else {
    colorCodeText.textContent = t.colorPickerLabel;
  }

  const flags = {
    es: { icon: 'fi-es', label: 'Español' },
    en: { icon: 'fi-gb', label: 'English' },
    pt: { icon: 'fi-pt', label: 'Português' }
  };
  const current = flags[lang];
  activeLanguage.innerHTML = `<span class="fi ${current.icon}"></span> ${current.label}`;
  dropdown.classList.remove('open');
  
  if (!svgOriginal || !svgOriginal.includes('<svg')) {
    updatePreview('');
  }
}

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
  colorCodeText.textContent = `${translations[currentLanguage].colorPickerLabel} ${hex}`;
  if (!svgOriginal) return;
  
  const updated = applyColorToSvg(svgOriginal, hex);
  preview.innerHTML = updated;
  svgInput.value = updated;
  
  updateColorPickerButton(hex);
});

function cleanSvgCode(svgCode) {
  if (svgCode && typeof svgCode === 'string') {
    return svgCode.replace(/<\?xml[^>]*\?>/g, '').trim();
  }
  return svgCode;
}

svgInput.addEventListener('input', () => {
  svgOriginal = cleanSvgCode(svgInput.value);
  updatePreview(svgOriginal);
});

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'image/svg+xml') {
    showToast('invalidFile', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    svgOriginal = cleanSvgCode(event.target.result);
    svgInput.value = svgOriginal;
    updatePreview(svgOriginal);
  };
  reader.readAsText(file);
});

const copyBtn = document.getElementById('copyBtn');
const copyYamlBtn = document.getElementById('copyYamlBtn');

function updateButtonsState(hasContent) {
  copyBtn.disabled = !hasContent;
  copyYamlBtn.disabled = !hasContent;
  
  if (!hasContent) {
    copyBtn.classList.add('btn-disabled');
    copyYamlBtn.classList.add('btn-disabled');
  } else {
    copyBtn.classList.remove('btn-disabled');
    copyYamlBtn.classList.remove('btn-disabled');
  }
}

function updatePreview(svg) {
  const hasSvgContent = svg && svg.trim() && svg.includes('<svg');
  
  updateButtonsState(hasSvgContent);
  
  if (!hasSvgContent) {
    const emptyMessage = translations[currentLanguage].emptySvgMessage;
    preview.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
          <path d="M14 2v6h6"></path>
          <path d="M2 15h10"></path>
          <path d="M9 18l3-3-3-3"></path>
        </svg>
        <p class="empty-state-text">${emptyMessage}</p>
      </div>
    `;
    colorControls.style.display = 'none';
    return;
  }

  const fillMatches = [...svg.matchAll(/fill=['"](.*?)['"]/g)];
  const strokeMatches = [...svg.matchAll(/stroke=['"](.*?)['"]/g)];
  
  const uniqueFills = [...new Set(fillMatches.map(m => m[1]))].filter(c => c !== 'none');
  const uniqueStrokes = [...new Set(strokeMatches.map(m => m[1]))].filter(c => c !== 'none');

  const allColors = [...uniqueFills, ...uniqueStrokes];
  const totalUniqueColors = new Set(allColors).size;
  
  const showColorPicker = totalUniqueColors === 1 || 
    (uniqueFills.length === 1 && uniqueStrokes.length === 0) || 
    (uniqueStrokes.length === 1 && uniqueFills.length === 0);

  if (showColorPicker) {
    colorControls.style.display = 'flex';
    
    let colorValue;
    if (uniqueFills.length === 1) {
      colorValue = uniqueFills[0];
    } else if (uniqueStrokes.length === 1) {
      colorValue = uniqueStrokes[0];
    }
    
    if (colorValue && colorValue !== 'currentColor' && colorValue !== 'none') {
      try {
        pickr.setColor(colorValue);
        updateColorPickerButton(colorValue);
      } catch (e) {
        console.log('No se pudo establecer el color:', e);
      }
    }
  } else {
    colorControls.style.display = 'none';
  }

  preview.innerHTML = svg.replace(/"/g, "'");
}

function applyColorToSvg(svg, newColor) {
  const fillMatches = [...svg.matchAll(/fill=['"](.*?)['"]/g)];
  const strokeMatches = [...svg.matchAll(/stroke=['"](.*?)['"]/g)];
  
  const uniqueFills = [...new Set(fillMatches.map(m => m[1]))].filter(c => c !== 'none');
  const uniqueStrokes = [...new Set(strokeMatches.map(m => m[1]))].filter(c => c !== 'none');
  
  let updatedSvg = svg;
  
  if (uniqueFills.length === 1 && uniqueFills[0] !== 'none') {
    updatedSvg = updatedSvg.replace(/fill=['"]((?!none)[^'"]*)['"]/g, `fill='${newColor}'`);
  }
  
  if (uniqueStrokes.length === 1 && uniqueStrokes[0] !== 'none') {
    updatedSvg = updatedSvg.replace(/stroke=['"]((?!none)[^'"]*)['"]/g, `stroke='${newColor}'`);
  }
  
  updatedSvg = updatedSvg.replace(/fill=['"]currentColor['"]/g, `fill='${newColor}'`);
  updatedSvg = updatedSvg.replace(/stroke=['"]currentColor['"]/g, `stroke='${newColor}'`);
  
  return updatedSvg.replace(/"/g, "'");
}

function updateColorPickerButton(color) {
  const colorPickerButton = document.querySelector('.pcr-button');
  if (colorPickerButton) {
    const rgbColor = hexToRgb(color);
    if (rgbColor) {
      colorPickerButton.style = `--pcr-color: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}); color: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}); background: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b});`;
    } else {
      colorPickerButton.style.setProperty('--pcr-color', color);
      colorPickerButton.style.color = color;
      colorPickerButton.style.background = color;
    }
    
    if (pickr) {
      pickr.setColor(color, true);
    }
  }
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  
  return {r, g, b};
}

function showToast(messageKey, type = 'info', params = {}) {
  const toastContainer = document.getElementById('toastContainer');
  
  let message;
  if (translations[currentLanguage]?.toasts?.[messageKey]) {
    message = translations[currentLanguage].toasts[messageKey];
    
    if (params.color) {
      message = `${message} ${params.color}`;
    }
  } else {
    message = messageKey;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '📋';
  if (type === 'error') icon = '❌';
  if (type === 'success') icon = '✅';
  
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.remove();
  });
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

function copyPowerFX() {
  const svg = preview.innerHTML.replace(/"/g, "'");
  const fxCode = `"data:image/svg+xml;utf8," & EncodeUrl("${svg}")`;
  navigator.clipboard.writeText(fxCode).then(() =>
    showToast('copyPowerFX', 'success')
  );
}

function copyYAML() {
  const svg = preview.innerHTML
    .replace(/"/g, "''")
    .replace(/\n/g, '')

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
    showToast('copyYAML', 'success')
  );
}

setLanguage('en');

document.addEventListener('DOMContentLoaded', function() {
  updatePreview('');
});
