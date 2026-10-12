// ==========================================
// 1. БАЗА ДАНИХ ТА КОНФІГУРАЦІЯ МОДУЛІВ
// ==========================================

// Тепер це просто порожні змінні, які ми заповнимо даними з сервера
let testMeta = {};
let testModules = [];

// ==========================================
// 2. РЕНДЕРИНГ (ГЕНЕРАЦІЯ HTML)
// ==========================================

const appContainer = document.getElementById('app-container');
const sortableInstances = []; 

function renderHeader(number, title, theme) {
    return `
        <div class="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <div class="w-5 h-5 rounded ${theme.bg} ${theme.text} flex items-center justify-center font-bold text-[10px]">${number}</div>
            <h2 class="text-sm font-semibold text-white">${title}</h2>
        </div>
    `;
}

const renderers = {
    'radio': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="mod-${index}">`;
        mod.data.forEach((item, qIdx) => {
            let opts = item.opts.map((opt, oIdx) => `
                <label class="cursor-pointer flex items-center p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors text-[11px] radio-label">
                    <input type="radio" name="q_${index}_${qIdx}" value="${oIdx}" class="peer hidden">
                    <div class="w-3.5 h-3.5 rounded-full border border-slate-500 mr-2 flex-shrink-0 flex items-center justify-center peer-checked:border-cyan-400 peer-checked:bg-cyan-900/20">
                        <div class="w-1.5 h-1.5 rounded-full indicator transition-colors"></div>
                    </div>
                    <span class="text-slate-300 peer-checked:text-white">${opt}</span>
                </label>
            `).join('');
            html += `<div class="bg-slate-800/30 p-2 rounded border border-slate-700/50 test-block" data-ans="${item.ans}"><div class="mb-1.5 font-medium">${item.q}</div><div class="grid gap-1">${opts}</div></div>`;
        });
        return html + `</div>`;
    },
    'pairs': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs" id="mod-${index}">`;
        const selectOptions = mod.data.map(p => `<option value="${p.type}">${p.desc}</option>`).sort(() => Math.random() - 0.5).join('');
        mod.data.forEach((item) => {
            html += `
                <div class="flex justify-between items-center bg-slate-800/30 p-1.5 rounded border border-slate-700/50 pair-block" data-type="${item.type}">
                    <span class="font-mono text-cyan-400">${item.ext}</span>
                    <select class="rounded p-1 text-[11px] w-36"><option value="">-- Оберіть --</option>${selectOptions}</select>
                </div>
            `;
        });
        return html + `</div>`;
    },
    'ordering': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id="mod-${index}">`;
        mod.lists.forEach(list => {
            let itemsHtml = list.items.map(item => `
                <div class="draggable-card bg-slate-800/80 border border-slate-700 rounded py-1.5 px-2 flex gap-2 items-center" data-id="${item.id}">
                    <span class="text-slate-500 cursor-grab">⋮⋮</span> ${item.text}
                </div>
            `).join('');
            html += `
                <div>
                    <h3 class="font-medium text-slate-400 mb-2">${list.name}</h3>
                    <div id="list-${index}-${list.id}" class="space-y-1.5 min-h-[100px] ordering-list" data-correct="${list.correct.join(',')}">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        });
        return html + `</div>`;
    },
    'sorting': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        let filesHtml = [...mod.files].sort(() => Math.random() - 0.5).map(f => 
            `<div class="draggable-card px-1.5 py-0.5 bg-slate-700 rounded border border-slate-500 sorting-item" data-t="${f.t}" data-id="${f.id}">${f.n}</div>`
        ).join('');
        html += `<div id="pool-${index}" class="flex flex-wrap gap-1.5 mb-3 p-2 border border-dashed border-slate-600 rounded bg-black/20 min-h-[40px]">${filesHtml}</div>`;
        html += `<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" id="mod-${index}">`;
        mod.folders.forEach(folder => {
            html += `<div class="bg-slate-800/40 border border-slate-700 rounded p-1.5"><h3 class="font-bold ${folder.color} mb-1 text-center">${folder.name}</h3><div id="folder-${index}-${folder.id}" class="space-y-1 min-h-[50px] sortable-folder" data-ftype="${folder.id}"></div></div>`;
        });
        return html + `</div>`;
    },
    'mistakes': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        if (mod.subtitle) html += `<p class="text-[11px] text-slate-400 mb-2">${mod.subtitle}</p>`;
        html += `<div class="grid gap-1.5" id="mod-${index}">`;
        mod.data.forEach((item) => {
            html += `
                <label class="cursor-pointer flex items-center p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors text-xs mistake-block" data-bad="${item.bad}">
                    <input type="checkbox" class="peer hidden">
                    <div class="w-3.5 h-3.5 rounded border border-slate-500 mr-2 flex items-center justify-center peer-checked:border-cyan-400">
                        <div class="w-2 h-2 rounded-sm indicator transition-colors"></div>
                    </div>
                    <span class="font-mono text-slate-300">${item.n}</span>
                </label>
            `;
        });
        return html + `</div>`;
    },
    'fill-in': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        html += `<div class="text-xs leading-relaxed space-y-3" id="mod-${index}">`;
        mod.data.forEach((item, i) => {
            html += `<p>${item.pre}<input type="text" class="inline-input fill-input bg-black/30 border-b border-dashed border-purple-500 text-cyan-400 text-center outline-none focus:border-cyan-400 focus:border-solid transition-colors w-36 px-1" data-ans="${item.ans}" placeholder="${item.placeholder}" autocomplete="off">${item.post}</p>`;
        });
        return html + `</div>`;
    },
    'open': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        if (mod.subtitle) html += `<p class="text-[11px] text-slate-400 mb-2">${mod.subtitle}</p>`;
        html += `<div class="space-y-2" id="mod-${index}">`;
        mod.data.forEach((item) => {
            if(item.type === 'text') {
                html += `<input type="text" id="${item.id}" class="w-full bg-slate-900/80 border border-slate-700 rounded py-1.5 px-2 text-xs focus:border-cyan-500 transition-colors open-input" placeholder="${item.q}">`;
            } else {
                html += `<textarea id="${item.id}" rows="2" class="w-full bg-slate-900/80 border border-slate-700 rounded py-1.5 px-2 text-xs focus:border-cyan-500 transition-colors open-input" placeholder="${item.q}"></textarea>`;
            }
            html += `<div id="ans-${item.id}" class="hidden text-[10px] text-emerald-400 bg-emerald-900/20 p-1.5 rounded" data-text="${item.ans}"></div>`;
        });
        return html + `</div>`;
    },
    'typing': (mod, index) => {
        let html = renderHeader(index, mod.title, mod.theme);
        html += `
            <div id="mod-${index}">
                <div class="bg-slate-900/80 border border-slate-800 rounded p-2.5 font-mono text-xs leading-relaxed mb-2 relative" id="typing-display-${index}">
                    ${mod.text.split('').map(c => `<span>${c}</span>`).join('')}
                </div>
                <input type="text" id="typing-input-${index}" class="w-full bg-slate-800 border border-cyan-500/30 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-cyan-500 mb-2" placeholder="Почніть друкувати для старту таймера..." autocomplete="off" spellcheck="false" data-text="${mod.text}">
                <div class="flex gap-3 text-[10px] font-mono">
                    <div class="bg-slate-800/50 px-2 py-1 rounded">WPM: <span id="wpm-display-${index}" class="text-cyan-400 font-bold text-xs">0</span></div>
                    <div class="bg-slate-800/50 px-2 py-1 rounded">Точність: <span id="acc-display-${index}" class="text-purple-400 font-bold text-xs">100</span>%</div>
                </div>
            </div>
        `;
        return html;
    }
};

function initApp() {
    document.title = testMeta.pageTitle;
    document.getElementById('main-header').innerHTML = `
        <h1 class="text-xl sm:text-2xl font-bold mb-1 tracking-tight">
            <span class="neon-text-cyan">${testMeta.titleHighlight}</span> ${testMeta.titleMain}
        </h1>
        <p class="text-slate-400 text-xs">${testMeta.subtitle}</p>
    `;

    appContainer.innerHTML = ''; 
    
    let gridContainer = null;

    testModules.forEach((mod, index) => {
        const section = document.createElement('section');
        section.className = 'glass-panel p-3 sm:p-4 module-container';
        section.dataset.type = mod.type;
        section.dataset.index = index + 1;
        section.id = `section-mod-${index + 1}`;
        
        if (renderers[mod.type]) {
            section.innerHTML = renderers[mod.type](mod, index + 1);
            
            if(mod.type === 'mistakes' || mod.type === 'fill-in') {
                if(!gridContainer) {
                    gridContainer = document.createElement('div');
                    gridContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
                    appContainer.appendChild(gridContainer);
                }
                gridContainer.appendChild(section);
            } else {
                appContainer.appendChild(section);
            }
        }
    });

    testModules.forEach((mod, index) => {
        const modId = index + 1;
        if (mod.type === 'ordering') {
            mod.lists.forEach(list => {
                sortableInstances.push(new Sortable(document.getElementById(`list-${modId}-${list.id}`), { animation: 150, ghostClass: 'sortable-ghost' }));
            });
        }
        if (mod.type === 'sorting') {
            const pool = document.getElementById(`pool-${modId}`);
            const dndOpts = { group: `sort-${modId}`, animation: 150, ghostClass: 'sortable-ghost' };
            sortableInstances.push(new Sortable(pool, dndOpts));
            mod.folders.forEach(folder => {
                sortableInstances.push(new Sortable(document.getElementById(`folder-${modId}-${folder.id}`), dndOpts));
            });
        }
        if (mod.type === 'typing') {
            const ti = document.getElementById(`typing-input-${modId}`);
            const td = document.getElementById(`typing-display-${modId}`);
            const textToType = ti.dataset.text;
            let startTime = null, tFinished = false;
            
            ti.addEventListener('input', () => {
                if(tFinished) return;
                if(!startTime) startTime = new Date();
                let arr = ti.value.split(''), correct = 0, spans = td.querySelectorAll('span');
                spans.forEach((s, i) => {
                    s.className = '';
                    if(arr[i] == null) {} 
                    else if(arr[i] === s.innerText) { s.classList.add('typed-correct'); correct++; } 
                    else { s.classList.add('typed-wrong'); }
                    if(i === arr.length) s.classList.add('typed-current');
                });
                if(arr.length > 0) {
                    let m = (new Date() - startTime) / 60000;
                    document.getElementById(`wpm-display-${modId}`).innerText = Math.round(arr.length / m || 0);
                    document.getElementById(`acc-display-${modId}`).innerText = Math.round((correct / arr.length) * 100);
                }
                if(arr.length >= textToType.length) { tFinished = true; ti.disabled = true; ti.classList.add('opacity-50'); }
            });
        }
    });

    document.getElementById('controls-container').classList.remove('hidden');
}


// ==========================================
// 3. ПЕРЕВІРКА ТА ОЦІНЮВАННЯ
// ==========================================

const submitBtn = document.getElementById('submitBtn');
let isSubmitted = false;

const validators = {
    'radio': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .test-block`).forEach(block => {
            let selected = block.querySelector('input:checked');
            if (selected && selected.value === block.dataset.ans) score += mod.points;
        });
        return score;
    },
    'pairs': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .pair-block`).forEach(block => {
            if (block.querySelector('select').value === block.dataset.type) score += mod.points;
        });
        return score;
    },
    'ordering': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .ordering-list`).forEach(list => {
            let currentOrder = Array.from(list.children).map(e => e.dataset.id).join(',');
            if (currentOrder === list.dataset.correct) score += mod.points;
        });
        return score;
    },
    'sorting': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .sortable-folder`).forEach(folder => {
            const folderType = folder.dataset.ftype;
            Array.from(folder.children).forEach(item => {
                if (item.dataset.t === folderType) score += mod.points;
            });
        });
        return score;
    },
    'mistakes': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .mistake-block`).forEach(block => {
            let isChecked = block.querySelector('input').checked;
            let isBad = block.dataset.bad === 'true';
            if (isChecked === isBad) score += mod.points;
        });
        return score;
    },
    'fill-in': (mod, index) => {
        let score = 0;
        document.querySelectorAll(`#mod-${index} .fill-input`).forEach(input => {
            if (input.value.toLowerCase().trim().includes(input.dataset.ans)) score += mod.points;
        });
        return score;
    },
    'open': (mod, index) => {
        let score = 0;
        mod.data.forEach(item => {
            if(document.getElementById(item.id).value.trim().length > 5) score += item.points;
        });
        return score;
    },
    'typing': () => 0
};

const answerRevealers = {
    'radio': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .test-block`).forEach(b => {
            let ans = b.dataset.ans;
            let selectedInput = b.querySelector('input:checked');
            
            if (selectedInput) {
                let selectedLabel = selectedInput.closest('.radio-label');
                selectedLabel.classList.remove('bg-white/5');
                selectedLabel.classList.add('border');
                
                if (selectedInput.value === ans) {
                    selectedLabel.classList.add('border-green-500', 'bg-green-900/40');
                } else {
                    selectedLabel.classList.add('border-red-500', 'bg-red-900/40');
                }
            }
        });
    },
    'pairs': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .pair-block`).forEach(b => {
            let sel = b.querySelector('select');
            if (sel.value) {
                if (sel.value === b.dataset.type) {
                    b.classList.add('border-green-500', 'bg-green-900/20');
                } else {
                    b.classList.add('border-red-500', 'bg-red-900/20');
                }
            }
        });
    },
    'ordering': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .ordering-list`).forEach(list => {
            let correctArr = list.dataset.correct.split(',');
            Array.from(list.children).forEach((el, i) => {
                if (el.dataset.id === correctArr[i]) {
                    el.classList.replace('bg-slate-800/80', 'bg-green-900/40');
                    el.classList.add('border-green-500/50');
                } else {
                    el.classList.replace('bg-slate-800/80', 'bg-red-900/40');
                    el.classList.add('border-red-500/50');
                }
            });
        });
    },
    'sorting': (mod, index) => {
        document.querySelectorAll(`#section-mod-${index} .sortable-folder`).forEach(folder => {
            const folderType = folder.dataset.ftype;
            Array.from(folder.children).forEach(item => {
                if (item.dataset.t === folderType) {
                    item.classList.replace('bg-slate-700', 'bg-green-800');
                    item.classList.replace('border-slate-500', 'border-green-400');
                } else {
                    item.classList.replace('bg-slate-700', 'bg-red-800');
                    item.classList.replace('border-slate-500', 'border-red-400');
                }
            });
        });
    },
    'mistakes': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .mistake-block`).forEach(b => {
            let isChecked = b.querySelector('input').checked;
            let isBad = b.dataset.bad === 'true';
            
            if (isChecked) {
                b.classList.remove('bg-white/5');
                b.classList.add('border');
                
                if (isBad) {
                    b.classList.add('border-green-500', 'bg-green-900/40'); 
                } else {
                    b.classList.add('border-red-500', 'bg-red-900/40'); 
                }
            }
        });
    },
    'fill-in': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .fill-input`).forEach(input => {
            if (input.value.trim() !== '') {
                input.classList.remove('text-cyan-400', 'border-purple-500');
                
                if (input.value.toLowerCase().trim().includes(input.dataset.ans)) {
                    input.classList.add('text-emerald-400', 'border-emerald-500');
                } else {
                    input.classList.add('text-red-400', 'border-red-500');
                }
            }
        });
    },
    'open': (mod, index) => {
        document.querySelectorAll(`#mod-${index} .open-input`).forEach(input => {
            if (input.value.trim() !== '') {
                if (input.value.trim().length > 5) {
                    input.classList.add('border-green-500', 'text-emerald-400');
                } else {
                    input.classList.add('border-red-500', 'text-red-400');
                }
            }
        });
    },
    'typing': () => {}
};

submitBtn.addEventListener('click', () => {
    if (isSubmitted) return;
    isSubmitted = true;
    let totalScore = 0;

    testModules.forEach((mod, index) => {
        if (validators[mod.type]) totalScore += validators[mod.type](mod, index + 1);
    });

    testModules.forEach((mod, index) => {
        if (answerRevealers[mod.type]) answerRevealers[mod.type](mod, index + 1);
    });

    submitBtn.classList.add('hidden');
    
    const resultBox = document.getElementById('result-box');
    resultBox.classList.remove('hidden');
    
    document.getElementById('final-score').innerText = `${Math.min(totalScore, 100)} / 100`;
    document.getElementById('feedback-msg').innerText = totalScore >= 85 ? "Чудово!" : (totalScore >= 60 ? "Добре!" : "Треба повторити.");
    
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    document.querySelectorAll('.draggable-card').forEach(e => e.style.pointerEvents = 'none');
});

// ==========================================
// 4. ЗАВАНТАЖЕННЯ ДАНИХ З БЕКЕНДУ
// ==========================================

async function loadTestFromAPI() {
    // Шукаємо параметр id у посиланні, наприклад: ?id=test_a1b2c3
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id');

    const header = document.getElementById('main-header');

    if (!testId) {
        header.innerHTML = `<h1 class="text-xl font-bold text-red-500 mt-10">Помилка: ID тесту не вказано в посиланні</h1><p class="text-slate-400 text-xs mt-2">Додайте ?id=ваш_id до URL</p>`;
        return;
    }

    try {
        // Показуємо індикатор завантаження
        header.innerHTML = `<div class="mt-10"><p class="text-cyan-400 font-mono animate-pulse">З'єднання з базою даних...</p></div>`;
        
        // Звертаємось до FastAPI сервера (переконайся, що він запущений на 8000 порту)
        const response = await fetch(`http://127.0.0.1:8000/api/tests/${testId}`);
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            testMeta = result.data.meta;
            testModules = result.data.modules;
            
            // Якщо дані успішно отримані — запускаємо генерацію сторінки
            initApp(); 
        } else {
            header.innerHTML = `<h1 class="text-xl font-bold text-red-500 mt-10">Помилка: ${result.detail || "Тест не знайдено"}</h1>`;
        }
    } catch (error) {
        header.innerHTML = `<h1 class="text-xl font-bold text-red-500 mt-10">Помилка підключення до сервера</h1><p class="text-slate-400 text-xs mt-2">Перевірте, чи запущено FastAPI на порту 8000</p>`;
        console.error(error);
    }
}

// Замість ручного виклику initApp(), тепер ми спершу тягнемо дані з бекенду
loadTestFromAPI();