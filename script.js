/**
 * CODE TRANSLATOR 2026 - ENGINE
 * Авторы: Шевцов Даниил и команда
 * Исправленная версия
 */

document.addEventListener('DOMContentLoaded', () => {
    initInterface();
});

// Глобальное состояние
let currentSource = 'python';
let currentTarget = 'pascal';

// === ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ===
function initInterface() {
    setupLanguageSelectors('source-selector', (lang) => {
        currentSource = lang;
        updateUI();
    });

    setupLanguageSelectors('target-selector', (lang) => {
        currentTarget = lang;
        updateUI();
    });

    document.getElementById('translateBtn').addEventListener('click', performTranslation);

    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('source-code').value = '';
        document.getElementById('result-code').value = '';
        showNotification('Поля очищены', 'success');
    });

    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('swapBtn').addEventListener('click', swapLanguages);
    document.getElementById('examples-dropdown').addEventListener('change', loadExample);

    updateUI();
}

function setupLanguageSelectors(containerId, callback) {
    const container = document.getElementById(containerId);
    const options = container.querySelectorAll('.lang-option');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            callback(opt.getAttribute('data-value'));
        });
    });
}

function updateUI() {
    document.getElementById('source-badge').textContent = formatLangName(currentSource);
    document.getElementById('target-badge').textContent = formatLangName(currentTarget);
    document.getElementById('display-source').textContent = formatLangName(currentSource);
    document.getElementById('display-target').textContent = formatLangName(currentTarget);
}

function formatLangName(lang) {
    const map = {
        python: 'Python',
        pascal: 'Pascal',
        java: 'Java',
        cpp: 'C++'
    };
    return map[lang] || lang;
}

function swapLanguages() {
    const oldSource = currentSource;
    const oldTarget = currentTarget;

    currentSource = oldTarget;
    currentTarget = oldSource;

    updateSelectorVisuals('source-selector', currentSource);
    updateSelectorVisuals('target-selector', currentTarget);

    const sourceArea = document.getElementById('source-code');
    const resultArea = document.getElementById('result-code');

    sourceArea.value = resultArea.value;
    resultArea.value = '';

    updateUI();
    showNotification('Языки поменяны местами', 'success');
}

function updateSelectorVisuals(containerId, value) {
    const container = document.getElementById(containerId);
    const options = container.querySelectorAll('.lang-option');

    options.forEach(opt => {
        if (opt.getAttribute('data-value') === value) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

// === ОСНОВНАЯ ЛОГИКА ===
function performTranslation() {
    const code = document.getElementById('source-code').value.trim();

    if (!code) {
        showNotification('Введите код для перевода!', 'error');
        return;
    }

    if (currentSource === currentTarget) {
        document.getElementById('result-code').value = code;
        showNotification('Языки совпадают', 'warning');
        return;
    }

    try {
        let result = translateCode(code, currentSource, currentTarget);

        if (!result || !result.trim()) {
            document.getElementById('result-code').value = '// Не удалось выполнить перевод для данного фрагмента.';
            showNotification('Перевод не выполнен', 'error');
            return;
        }

        document.getElementById('result-code').value = result;
        showNotification('Успешно переведено!', 'success');
    } catch (e) {
        console.error(e);
        document.getElementById('result-code').value = '// Ошибка перевода. Проверьте синтаксис входного кода.';
        showNotification('Ошибка перевода', 'error');
    }
}

function translateCode(code, from, to) {
    if (from === 'python') {
        if (to === 'pascal') return pythonToPascal(code);
        if (to === 'java') return pythonToJava(code);
        if (to === 'cpp') return pythonToCpp(code);
    }

    if (to === 'python') {
        return toPythonCommon(code, from);
    }

    if (from === 'pascal' && to === 'java') return pascalToJava(code);
    if (from === 'pascal' && to === 'cpp') return pascalToCpp(code);
    if (from === 'java' && to === 'pascal') return javaToPascal(code);
    if (from === 'java' && to === 'cpp') return javaToCpp(code);
    if (from === 'cpp' && to === 'pascal') return cppToPascal(code);
    if (from === 'cpp' && to === 'java') return cppToJava(code);

    return '';
}

// === ВСПОМОГАТЕЛЬНЫЕ ПАРСЕРЫ ===
function getIndentLevel(line) {
    const match = line.match(/^(\s*)/);
    const spaces = match ? match[1].replace(/\t/g, '    ').length : 0;
    return Math.floor(spaces / 4);
}

function normalizeLines(code) {
    return code.replace(/\r\n/g, '\n').split('\n');
}

function detectPythonVarType(value) {
    const v = value.trim();

    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) return 'string';
    if (/^\d+$/.test(v)) return 'int';
    if (/^\d+\.\d+$/.test(v)) return 'double';
    if (/^(true|false)$/i.test(v)) return 'bool';
    return 'auto';
}

function escapePascalString(str) {
    return str.replace(/'/g, "''");
}

// === PYTHON -> JAVA ===
function pythonToJava(code) {
    const lines = normalizeLines(code);
    const out = [];
    const blockStack = [];

    out.push('public class Main {');
    out.push('    public static void main(String[] args) {');

    let prevIndent = 0;

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        const indent = getIndentLevel(rawLine);

        while (blockStack.length > indent) {
            out.push('    '.repeat(blockStack.length + 1) + '}');
            blockStack.pop();
        }

        if (/^else:$/.test(trimmed)) {
            if (blockStack.length > indent) {
                out.push('    '.repeat(blockStack.length + 1) + '}');
                blockStack.pop();
            }
            out.push('    '.repeat(indent + 2) + 'else {');
            blockStack.push('else');
            prevIndent = indent;
            continue;
        }

        let converted = null;

        let match;

        match = trimmed.match(/^print\(f"(.*?)\{(.*?)\}(.*?)"\)$/);
        if (match) {
            converted = `System.out.println("${match[1]}" + (${match[2]}) + "${match[3]}");`;
        }

        if (!converted) {
            match = trimmed.match(/^print\("(.*)"\)$/);
            if (match) {
                converted = `System.out.println("${match[1]}");`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^print\((.+)\)$/);
            if (match) {
                converted = `System.out.println(${match[1]});`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):$/);
            if (match) {
                converted = `for (int ${match[1]} = ${match[2]}; ${match[1]} < ${match[3]}; ${match[1]}++) {`;
                out.push('    '.repeat(indent + 2) + converted);
                blockStack.push('for');
                prevIndent = indent;
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^if\s+(.+):$/);
            if (match) {
                converted = `if (${match[1]}) {`;
                out.push('    '.repeat(indent + 2) + converted);
                blockStack.push('if');
                prevIndent = indent;
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (match) {
                const varName = match[1];
                const value = match[2];
                const type = detectPythonVarType(value);

                if (type === 'string') converted = `String ${varName} = ${value};`;
                else if (type === 'int') converted = `int ${varName} = ${value};`;
                else if (type === 'double') converted = `double ${varName} = ${value};`;
                else if (type === 'bool') converted = `boolean ${varName} = ${value.toLowerCase()};`;
                else converted = `var ${varName} = ${value};`;
            }
        }

        if (!converted) {
            converted = `// Не удалось распознать: ${trimmed}`;
        }

        out.push('    '.repeat(indent + 2) + converted);
        prevIndent = indent;
    }

    while (blockStack.length > 0) {
        out.push('    '.repeat(blockStack.length + 1) + '}');
        blockStack.pop();
    }

    out.push('    }');
    out.push('}');

    return out.join('\n');
}

// === PYTHON -> C++ ===
function pythonToCpp(code) {
    const lines = normalizeLines(code);
    const out = [];
    const blockStack = [];

    out.push('#include <iostream>');
    out.push('using namespace std;');
    out.push('');
    out.push('int main() {');

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        const indent = getIndentLevel(rawLine);

        while (blockStack.length > indent) {
            out.push('    '.repeat(blockStack.length) + '}');
            blockStack.pop();
        }

        if (/^else:$/.test(trimmed)) {
            if (blockStack.length > indent) {
                out.push('    '.repeat(blockStack.length) + '}');
                blockStack.pop();
            }
            out.push('    '.repeat(indent + 1) + 'else {');
            blockStack.push('else');
            continue;
        }

        let converted = null;
        let match;

        match = trimmed.match(/^print\(f"(.*?)\{(.*?)\}(.*?)"\)$/);
        if (match) {
            converted = `cout << "${match[1]}" << (${match[2]}) << "${match[3]}" << endl;`;
        }

        if (!converted) {
            match = trimmed.match(/^print\("(.*)"\)$/);
            if (match) {
                converted = `cout << "${match[1]}" << endl;`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^print\((.+)\)$/);
            if (match) {
                converted = `cout << ${match[1]} << endl;`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):$/);
            if (match) {
                converted = `for (int ${match[1]} = ${match[2]}; ${match[1]} < ${match[3]}; ${match[1]}++) {`;
                out.push('    '.repeat(indent + 1) + converted);
                blockStack.push('for');
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^if\s+(.+):$/);
            if (match) {
                converted = `if (${match[1]}) {`;
                out.push('    '.repeat(indent + 1) + converted);
                blockStack.push('if');
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (match) {
                const varName = match[1];
                const value = match[2];
                const type = detectPythonVarType(value);

                if (type === 'string') converted = `string ${varName} = ${value};`;
                else if (type === 'int') converted = `int ${varName} = ${value};`;
                else if (type === 'double') converted = `double ${varName} = ${value};`;
                else if (type === 'bool') converted = `bool ${varName} = ${value.toLowerCase()};`;
                else converted = `auto ${varName} = ${value};`;
            }
        }

        if (!converted) {
            converted = `// Не удалось распознать: ${trimmed}`;
        }

        out.push('    '.repeat(indent + 1) + converted);
    }

    while (blockStack.length > 0) {
        out.push('    '.repeat(blockStack.length) + '}');
        blockStack.pop();
    }

    out.push('    return 0;');
    out.push('}');

    return out.join('\n');
}

// === PYTHON -> PASCAL ===
function pythonToPascal(code) {
    const lines = normalizeLines(code);
    const body = [];
    const blockStack = [];
    const vars = new Map();

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        const indent = getIndentLevel(rawLine);

        while (blockStack.length > indent) {
            body.push('    '.repeat(blockStack.length) + 'end;');
            blockStack.pop();
        }

        if (/^else:$/.test(trimmed)) {
            if (blockStack.length > indent) {
                body.push('    '.repeat(blockStack.length) + 'end');
                blockStack.pop();
            }
            body.push('    '.repeat(indent + 1) + 'else');
            body.push('    '.repeat(indent + 1) + 'begin');
            blockStack.push('else');
            continue;
        }

        let converted = null;
        let match;

        match = trimmed.match(/^print\(f"(.*?)\{(.*?)\}(.*?)"\)$/);
        if (match) {
            const left = escapePascalString(match[1]);
            const right = escapePascalString(match[3]);
            converted = `writeln('${left}', ${match[2]}, '${right}');`;
        }

        if (!converted) {
            match = trimmed.match(/^print\("(.*)"\)$/);
            if (match) {
                converted = `writeln('${escapePascalString(match[1])}');`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^print\((.+)\)$/);
            if (match) {
                converted = `writeln(${match[1]});`;
            }
        }

        if (!converted) {
            match = trimmed.match(/^for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):$/);
            if (match) {
                vars.set(match[1], 'integer');
                body.push('    '.repeat(indent + 1) + `for ${match[1]} := ${match[2]} to ${Number(match[3]) - 1} do`);
                body.push('    '.repeat(indent + 1) + 'begin');
                blockStack.push('for');
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^if\s+(.+):$/);
            if (match) {
                body.push('    '.repeat(indent + 1) + `if ${match[1]} then`);
                body.push('    '.repeat(indent + 1) + 'begin');
                blockStack.push('if');
                continue;
            }
        }

        if (!converted) {
            match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
            if (match) {
                const varName = match[1];
                const value = match[2];
                const type = detectPythonVarType(value);

                if (!vars.has(varName)) {
                    if (type === 'string') vars.set(varName, 'string');
                    else if (type === 'int') vars.set(varName, 'integer');
                    else if (type === 'double') vars.set(varName, 'real');
                    else if (type === 'bool') vars.set(varName, 'boolean');
                    else vars.set(varName, 'integer');
                }

                converted = `${varName} := ${value};`;
            }
        }

        if (!converted) {
            converted = `{ Не удалось распознать: ${trimmed} }`;
        }

        body.push('    '.repeat(indent + 1) + converted);
    }

    while (blockStack.length > 0) {
        body.push('    '.repeat(blockStack.length) + 'end;');
        blockStack.pop();
    }

    const varLines = [];
    if (vars.size > 0) {
        varLines.push('var');
        for (const [name, type] of vars.entries()) {
            varLines.push(`    ${name}: ${type};`);
        }
        varLines.push('');
    }

    return [
        'program Translated;',
        '',
        ...varLines,
        'begin',
        ...body,
        'end.'
    ].join('\n');
}

// === ОБРАТНО В PYTHON ===
function toPythonCommon(code, from) {
    let res = code.replace(/\r\n/g, '\n');

    if (from === 'java') {
        res = res.replace(/public\s+class\s+\w+\s*\{/g, '');
        res = res.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, '');
        res = res.replace(/\}/g, '');
        res = res.replace(/^\s*(int|double|String|boolean|var)\s+/gm, '');
        res = res.replace(/System\.out\.println\("(.*)"\);\s*$/gm, 'print("$1")');
        res = res.replace(/System\.out\.println\((.*)\);\s*$/gm, 'print($1)');
        res = res.replace(/^\s*(\w+)\s*=\s*(.+);\s*$/gm, '$1 = $2');
        res = res.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*\1\+\+\s*\)\s*\{/g, 'for $1 in range($2, $3):');
        res = res.replace(/if\s*\((.+)\)\s*\{/g, 'if $1:');
        res = res.replace(/^\s*else\s*\{/gm, 'else:');
    }

    if (from === 'cpp') {
        res = res.replace(/#include.*$/gm, '');
        res = res.replace(/using\s+namespace\s+std;?/g, '');
        res = res.replace(/int\s+main\s*\(\)\s*\{/g, '');
        res = res.replace(/return\s+0;?/g, '');
        res = res.replace(/\}/g, '');
        res = res.replace(/^\s*(int|double|string|bool|auto)\s+/gm, '');
        res = res.replace(/cout\s*<<\s*"(.*)"\s*<<\s*endl;?\s*$/gm, 'print("$1")');
        res = res.replace(/cout\s*<<\s*(.*)\s*<<\s*endl;?\s*$/gm, 'print($1)');
        res = res.replace(/^\s*(\w+)\s*=\s*(.+);\s*$/gm, '$1 = $2');
        res = res.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*\1\+\+\s*\)\s*\{/g, 'for $1 in range($2, $3):');
        res = res.replace(/if\s*\((.+)\)\s*\{/g, 'if $1:');
        res = res.replace(/^\s*else\s*\{/gm, 'else:');
    }

    if (from === 'pascal') {
        res = res.replace(/program\s+\w+;?/gi, '');
        res = res.replace(/var[\s\S]*?begin/gi, 'begin');
        res = res.replace(/\bend\.\b/gi, '');
        res = res.replace(/\bend;\b/gi, '');
        res = res.replace(/\bbegin\b/gi, '');
        res = res.replace(/writeln\('(.*)'\);/gi, 'print("$1")');
        res = res.replace(/writeln\((.*)\);/gi, 'print($1)');
        res = res.replace(/(\w+)\s*:=\s*(.+);/g, '$1 = $2');
        res = res.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/gi, 'for $1 in range($2, $3 + 1):');
        res = res.replace(/if\s+(.+)\s+then/gi, 'if $1:');
        res = res.replace(/^\s*else\s*$/gim, 'else:');
    }

    const cleaned = res
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return cleaned.join('\n');
}

// === COMMON TO COMMON ЧЕРЕЗ PYTHON ===
function pascalToJava(code) {
    return pythonToJava(toPythonCommon(code, 'pascal'));
}

function pascalToCpp(code) {
    return pythonToCpp(toPythonCommon(code, 'pascal'));
}

function javaToPascal(code) {
    return pythonToPascal(toPythonCommon(code, 'java'));
}

function javaToCpp(code) {
    return pythonToCpp(toPythonCommon(code, 'java'));
}

function cppToPascal(code) {
    return pythonToPascal(toPythonCommon(code, 'cpp'));
}

function cppToJava(code) {
    return pythonToJava(toPythonCommon(code, 'cpp'));
}

// === ПРИМЕРЫ ===
function loadExample() {
    const val = document.getElementById('examples-dropdown').value;

    const examples = {
        py_hello: 'print("Привет, мир!")',
        py_calc: 'x = 10\ny = 20\nprint(f"Сумма: {x + y}")',
        pas_loop: 'program Test;\nvar\n  i: integer;\nbegin\n  for i := 1 to 5 do\n  begin\n    writeln(i);\n  end;\nend.',
        java_class: 'public class Test {\n    public static void main(String[] args) {\n        int x = 5;\n        System.out.println(x);\n    }\n}',
        cpp_cond: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    if (x > 5) {\n        cout << "Big" << endl;\n    }\n    return 0;\n}'
    };

    if (examples[val]) {
        document.getElementById('source-code').value = examples[val];
        document.getElementById('result-code').value = '';

        if (val.startsWith('py')) setSourceLanguage('python');
        if (val.startsWith('pas')) setSourceLanguage('pascal');
        if (val.startsWith('java')) setSourceLanguage('java');
        if (val.startsWith('cpp')) setSourceLanguage('cpp');

        showNotification('Пример загружен', 'success');
    }
}

function setSourceLanguage(lang) {
    currentSource = lang;
    updateSelectorVisuals('source-selector', lang);
    updateUI();
}

// === КОПИРОВАНИЕ ===
function copyResult() {
    const text = document.getElementById('result-code').value;

    if (!text.trim()) {
        showNotification('Сначала получите результат перевода', 'warning');
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('Скопировано в буфер!', 'success');
        })
        .catch(() => {
            showNotification('Не удалось скопировать', 'error');
        });
}

// === УВЕДОМЛЕНИЯ ===
function showNotification(msg, type = 'success') {
    const area = document.getElementById('notification-area');
    const div = document.createElement('div');

    div.className = `notification ${type}`;
    div.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;

    area.appendChild(div);

    setTimeout(() => {
        div.classList.add('hide');
        setTimeout(() => div.remove(), 300);
    }, 2500);
}
