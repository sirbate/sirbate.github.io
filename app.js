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

// Variables para controlar el idioma actual
let currentLanguage = 'en';

function setLanguage(lang) {
  currentLanguage = lang; // Guardar el idioma actual
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

  // Actualizar el texto del color si hay un color seleccionado
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
  
  // Actualizar el mensaje del estado vacío si es necesario
  if (!svgOriginal || !svgOriginal.includes('<svg')) {
    updatePreview('');
  }
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
  colorCodeText.textContent = `${translations[currentLanguage].colorPickerLabel} ${hex}`;
  if (!svgOriginal) return;
  
  // Aplicar el color al atributo principal detectado (fill o stroke)
  const updated = applyColorToSvg(svgOriginal, hex);
  preview.innerHTML = updated;
  svgInput.value = updated;
  
  // Actualizar el color del botón del selector
  updateColorPickerButton(hex);
});

// Función para limpiar el código SVG (eliminar declaración XML)
function cleanSvgCode(svgCode) {
  // Eliminar la declaración XML si existe
  if (svgCode && typeof svgCode === 'string') {
    return svgCode.replace(/<\?xml[^>]*\?>/g, '').trim();
  }
  return svgCode;
}

// SVG input listener
svgInput.addEventListener('input', () => {
  svgOriginal = cleanSvgCode(svgInput.value);
  updatePreview(svgOriginal);
});

// File Upload
fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'image/svg+xml') {
    showToast('invalidFile', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    // Limpiar el código SVG antes de procesarlo
    svgOriginal = cleanSvgCode(event.target.result);
    svgInput.value = svgOriginal;
    updatePreview(svgOriginal);
  };
  reader.readAsText(file);
});

// Referencias a los botones de copiar
const copyBtn = document.getElementById('copyBtn');
const copyYamlBtn = document.getElementById('copyYamlBtn');

// Función para actualizar el estado de los botones
function updateButtonsState(hasContent) {
  copyBtn.disabled = !hasContent;
  copyYamlBtn.disabled = !hasContent;
  
  // Aplicar estilos visuales para botones deshabilitados
  if (!hasContent) {
    copyBtn.classList.add('btn-disabled');
    copyYamlBtn.classList.add('btn-disabled');
  } else {
    copyBtn.classList.remove('btn-disabled');
    copyYamlBtn.classList.remove('btn-disabled');
  }
}

function updatePreview(svg) {
  // Comprobar si hay contenido SVG
  const hasSvgContent = svg && svg.trim() && svg.includes('<svg');
  
  // Actualizar el estado de los botones
  updateButtonsState(hasSvgContent);
  
  if (!hasSvgContent) {
    // Mostrar estado vacío con ícono SVG y mensaje
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

  // Detectar si el SVG usa principalmente fill o stroke para el color
  const fillMatches = [...svg.matchAll(/fill=['"](.*?)['"]/g)];
  const strokeMatches = [...svg.matchAll(/stroke=['"](.*?)['"]/g)];
  
  const uniqueFills = [...new Set(fillMatches.map(m => m[1]))].filter(c => c !== 'none');
  const uniqueStrokes = [...new Set(strokeMatches.map(m => m[1]))].filter(c => c !== 'none');

  // Contar colores totales únicos (combinando fill y stroke)
  const allColors = [...uniqueFills, ...uniqueStrokes];
  const totalUniqueColors = new Set(allColors).size;
  
  // Solo mostrar el selector si hay exactamente un color único en total
  // o si solo hay un tipo de atributo con un solo color
  const showColorPicker = totalUniqueColors === 1 || 
    (uniqueFills.length === 1 && uniqueStrokes.length === 0) || 
    (uniqueStrokes.length === 1 && uniqueFills.length === 0);

  if (showColorPicker) {
    colorControls.style.display = 'flex';
    
    // Identificar qué atributo es el principal para mostrar el color actual
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

// Función para aplicar color al atributo correcto del SVG
function applyColorToSvg(svg, newColor) {
  // Detectar si el SVG usa principalmente fill o stroke
  const fillMatches = [...svg.matchAll(/fill=['"](.*?)['"]/g)];
  const strokeMatches = [...svg.matchAll(/stroke=['"](.*?)['"]/g)];
  
  const uniqueFills = [...new Set(fillMatches.map(m => m[1]))].filter(c => c !== 'none');
  const uniqueStrokes = [...new Set(strokeMatches.map(m => m[1]))].filter(c => c !== 'none');
  
  let updatedSvg = svg;
  
  // Si hay solo un color de relleno principal, actualizar todos los fills
  if (uniqueFills.length === 1 && uniqueFills[0] !== 'none') {
    updatedSvg = updatedSvg.replace(/fill=['"]((?!none)[^'"]*)['"]/g, `fill='${newColor}'`);
  }
  
  // Si hay solo un color de trazo principal, actualizar todos los strokes
  if (uniqueStrokes.length === 1 && uniqueStrokes[0] !== 'none') {
    updatedSvg = updatedSvg.replace(/stroke=['"]((?!none)[^'"]*)['"]/g, `stroke='${newColor}'`);
  }
  
  // Si hay 'currentColor', reemplazarlo también
  updatedSvg = updatedSvg.replace(/fill=['"]currentColor['"]/g, `fill='${newColor}'`);
  updatedSvg = updatedSvg.replace(/stroke=['"]currentColor['"]/g, `stroke='${newColor}'`);
  
  return updatedSvg.replace(/"/g, "'");
}

// Función para actualizar el color del botón del selector
function updateColorPickerButton(color) {
  const colorPickerButton = document.querySelector('.pcr-button');
  if (colorPickerButton) {
    // Aplicar directamente los estilos RGB como se ve en la inspección del DOM
    const rgbColor = hexToRgb(color);
    if (rgbColor) {
      // Establecer el estilo inline como se muestra en la inspección DOM
      colorPickerButton.style = `--pcr-color: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}); color: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}); background: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b});`;
    } else {
      // Fallback en caso de que no podamos convertir a RGB
      colorPickerButton.style.setProperty('--pcr-color', color);
      colorPickerButton.style.color = color;
      colorPickerButton.style.background = color;
    }
    
    // También actualizar el color en la instancia del Pickr
    if (pickr) {
      pickr.setColor(color, true); // El segundo parámetro evita disparar el evento change
    }
  }
}

// Función auxiliar para convertir hex a rgb
function hexToRgb(hex) {
  // Remover el # si existe
  hex = hex.replace(/^#/, '');
  
  // Parsear el hex a rgb
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  
  return {r, g, b};
}

// Función para mostrar notificaciones toast con traducciones
function showToast(messageKey, type = 'info', params = {}) {
  const toastContainer = document.getElementById('toastContainer');
  
  // Obtener el mensaje traducido o usar el mensaje directamente si no es una clave
  let message;
  if (translations[currentLanguage]?.toasts?.[messageKey]) {
    message = translations[currentLanguage].toasts[messageKey];
    
    // Reemplazar parámetros si existen
    if (params.color) {
      message = `${message} ${params.color}`;
    }
  } else {
    message = messageKey; // Usar el mensaje directamente si no se encuentra la traducción
  }
  
  // Crear el elemento toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Iconos según el tipo
  let icon = '📋';
  if (type === 'error') icon = '❌';
  if (type === 'success') icon = '✅';
  
  // Contenido del toast
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  // Agregar al contenedor
  toastContainer.appendChild(toast);
  
  // Manejador para cerrar el toast
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.remove();
  });
  
  // Eliminar automáticamente después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

// 📋 Copiar Power FX
function copyPowerFX() {
  const svg = preview.innerHTML.replace(/"/g, "'");
  const fxCode = `"data:image/svg+xml;utf8," & EncodeUrl("${svg}")`;
  navigator.clipboard.writeText(fxCode).then(() =>
    showToast('copyPowerFX', 'success')
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
    showToast('copyYAML', 'success')
  );
}

// Idioma por defecto
setLanguage('en');

// Mostrar el estado vacío al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar la vista previa con el estado vacío
  updatePreview('');
});
