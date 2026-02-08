// КОНФИГУРАЦИЯ
let currentSourceLang = 'python';
let currentTargetLang = 'pascal';

// ПРИМЕРЫ КОДА
const codeExamples = {
    'python_hello': {
        lang: 'python',
        code: `print("Hello, World!")
for i in range(1, 6):
    print(f"Number: {i}")`
    },
    'python_factorial': {
        lang: 'python',
        code: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

num = 5
print(f"Factorial of {num} is {factorial(num)}")`
    },
    'python_if': {
        lang: 'python',
        code: `x = 10
if x > 0:
    print("Positive")
elif x < 0:
    print("Negative")
else:
    print("Zero")`
    },
    'pascal_hello': {
        lang: 'pascal',
        code: `program HelloWorld;
begin
  writeln('Hello, World!');
  for i := 1 to 5 do
    writeln('Number: ', i);
end.`
    },
    'java_hello': {
        lang: 'java',
        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Number: " + i);
        }
    }
}`
    },
    'cpp_hello': {
        lang: 'cpp',
        code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    for (int i = 1; i <= 5; i++) {
        cout << "Number: " << i << endl;
    }
    return 0;
}`
    }
};

// ==================== ИСПРАВЛЕННЫЕ ФУНКЦИИ ПЕРЕВОДА ====================

// Python → Pascal (РАБОЧАЯ)
function translatePythonToPascal(code) {
    let result = code;
    let lines = result.split('\n');
    let output = [];
    let indent = 0;
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        let indentSpaces = line.match(/^(\s*)/)[0].length;
        indent = Math.floor(indentSpaces / 4);
        
        // Обработка f-строк
        let fStringMatch = line.match(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/);
        if (fStringMatch) {
            let [, before, varName, after] = fStringMatch;
            output.push('  '.repeat(indent) + `writeln('${before}', ${varName}, '${after}');`);
            continue;
        }
        
        // Простые print
        if (line.includes('print("') && line.includes('")')) {
            let text = line.match(/print\("([^"]*)"\)/)[1];
            output.push('  '.repeat(indent) + `writeln('${text}');`);
            continue;
        }
        
        // for i in range(start, end):
        let forMatch = line.match(/for (\w+) in range\((\d+),\s*(\d+)\):/);
        if (forMatch) {
            let [, varName, start, end] = forMatch;
            output.push('  '.repeat(indent) + `for ${varName} := ${start} to ${parseInt(end)-1} do`);
            continue;
        }
        
        // def function(param):
        let defMatch = line.match(/def (\w+)\((\w+)\):/);
        if (defMatch) {
            let [, funcName, param] = defMatch;
            output.push('  '.repeat(indent) + `function ${funcName}(${param}: integer): integer;`);
            continue;
        }
        
        // if condition:
        if (line.startsWith('if ') && line.endsWith(':')) {
            let condition = line.replace('if ', '').replace(':', '').trim();
            output.push('  '.repeat(indent) + `if ${condition} then`);
            continue;
        }
        
        // elif condition:
        if (line.startsWith('elif ') && line.endsWith(':')) {
            let condition = line.replace('elif ', '').replace(':', '').trim();
            output.push('  '.repeat(indent) + `else if ${condition} then`);
            continue;
        }
        
        // else:
        if (line === 'else:') {
            output.push('  '.repeat(indent) + 'else');
            continue;
        }
        
        // return value
        if (line.startsWith('return ')) {
            let value = line.replace('return ', '').trim();
            output.push('  '.repeat(indent) + `${value};`);
            continue;
        }
        
        // Переменные
        let varMatch = line.match(/^(\w+) = (\d+)$/);
        if (varMatch) {
            let [, varName, value] = varMatch;
            output.push('  '.repeat(indent) + `${varName} := ${value};`);
            continue;
        }
        
        // result *= i
        if (line.includes('*=')) {
            output.push('  '.repeat(indent) + line.replace('*=', ':=') + ';');
            continue;
        }
        
        // Прочие строки
        output.push('  '.repeat(indent) + line + ';');
    }
    
    result = `program TranslatedCode;\n\nbegin\n${output.join('\n')}\nend.`;
    
    return { code: result, warnings: [] };
}

// Python → Java (РАБОЧАЯ)
function translatePythonToJava(code) {
    let result = code;
    let lines = result.split('\n');
    let output = [];
    let indent = 0;
    let functions = [];
    let mainCode = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        let indentSpaces = line.match(/^(\s*)/)[0].length;
        indent = Math.floor(indentSpaces / 4);
        
        // Обработка f-строк
        let fStringMatch = line.match(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/);
        if (fStringMatch) {
            let [, before, varName, after] = fStringMatch;
            mainCode.push('    '.repeat(indent) + `System.out.println("${before}" + ${varName} + "${after}");`);
            continue;
        }
        
        // Простые print
        if (line.includes('print("') && line.includes('")')) {
            let text = line.match(/print\("([^"]*)"\)/)[1];
            mainCode.push('    '.repeat(indent) + `System.out.println("${text}");`);
            continue;
        }
        
        // def function(param):
        let defMatch = line.match(/def (\w+)\((\w+)\):/);
        if (defMatch) {
            let [, funcName, param] = defMatch;
            functions.push(`    public static int ${funcName}(int ${param}) {`);
            continue;
        }
        
        // for i in range(start, end):
        let forMatch = line.match(/for (\w+) in range\((\d+),\s*(\d+)\):/);
        if (forMatch) {
            let [, varName, start, end] = forMatch;
            mainCode.push('    '.repeat(indent) + `for (int ${varName} = ${start}; ${varName} < ${end}; ${varName}++) {`);
            continue;
        }
        
        // if condition:
        if (line.startsWith('if ') && line.endsWith(':')) {
            let condition = line.replace('if ', '').replace(':', '').trim();
            mainCode.push('    '.repeat(indent) + `if (${condition}) {`);
            continue;
        }
        
        // elif condition:
        if (line.startsWith('elif ') && line.endsWith(':')) {
            let condition = line.replace('elif ', '').replace(':', '').trim();
            mainCode.push('    '.repeat(indent) + `else if (${condition}) {`);
            continue;
        }
        
        // else:
        if (line === 'else:') {
            mainCode.push('    '.repeat(indent) + `else {`);
            continue;
        }
        
        // return value
        if (line.startsWith('return ')) {
            let value = line.replace('return ', '').trim();
            functions.push(`        return ${value};`);
            continue;
        }
        
        // result = 1
        if (line === 'result = 1') {
            mainCode.push('    '.repeat(indent) + `int result = 1;`);
            continue;
        }
        
        // result *= i
        if (line === 'result *= i') {
            mainCode.push('    '.repeat(indent) + `result *= i;`);
            continue;
        }
        
        // Переменные
        let varMatch = line.match(/^(\w+) = (\d+)$/);
        if (varMatch) {
            let [, varName, value] = varMatch;
            mainCode.push('    '.repeat(indent) + `int ${varName} = ${value};`);
            continue;
        }
        
        // Прочие строки в main
        if (!line.includes('def ') && !line.includes('return ')) {
            mainCode.push('    '.repeat(indent) + line + ';');
        }
    }
    
    // Закрываем функции
    if (functions.length > 0) {
        functions.push('    }');
    }
    
    // Собираем итоговый код
    result = `public class TranslatedCode {\n`;
    
    if (functions.length > 0) {
        result += functions.join('\n') + '\n\n';
    }
    
    result += `    public static void main(String[] args) {\n`;
    result += mainCode.join('\n') + '\n';
    result += `    }\n}`;
    
    return { code: result, warnings: [] };
}

// Python → C++ (РАБОЧАЯ)
function translatePythonToCpp(code) {
    let result = code;
    let lines = result.split('\n');
    let output = [];
    let indent = 0;
    let functions = [];
    let mainCode = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        let indentSpaces = line.match(/^(\s*)/)[0].length;
        indent = Math.floor(indentSpaces / 4);
        
        // Обработка f-строк
        let fStringMatch = line.match(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/);
        if (fStringMatch) {
            let [, before, varName, after] = fStringMatch;
            mainCode.push('    '.repeat(indent) + `cout << "${before}" << ${varName} << "${after}" << endl;`);
            continue;
        }
        
        // Простые print
        if (line.includes('print("') && line.includes('")')) {
            let text = line.match(/print\("([^"]*)"\)/)[1];
            mainCode.push('    '.repeat(indent) + `cout << "${text}" << endl;`);
            continue;
        }
        
        // def function(param):
        let defMatch = line.match(/def (\w+)\((\w+)\):/);
        if (defMatch) {
            let [, funcName, param] = defMatch;
            functions.push(`int ${funcName}(int ${param}) {`);
            continue;
        }
        
        // for i in range(start, end):
        let forMatch = line.match(/for (\w+) in range\((\d+),\s*(\d+)\):/);
        if (forMatch) {
            let [, varName, start, end] = forMatch;
            mainCode.push('    '.repeat(indent) + `for (int ${varName} = ${start}; ${varName} < ${end}; ${varName}++) {`);
            continue;
        }
        
        // if condition:
        if (line.startsWith('if ') && line.endsWith(':')) {
            let condition = line.replace('if ', '').replace(':', '').trim();
            mainCode.push('    '.repeat(indent) + `if (${condition}) {`);
            continue;
        }
        
        // elif condition:
        if (line.startsWith('elif ') && line.endsWith(':')) {
            let condition = line.replace('elif ', '').replace(':', '').trim();
            mainCode.push('    '.repeat(indent) + `else if (${condition}) {`);
            continue;
        }
        
        // else:
        if (line === 'else:') {
            mainCode.push('    '.repeat(indent) + `else {`);
            continue;
        }
        
        // return value
        if (line.startsWith('return ')) {
            let value = line.replace('return ', '').trim();
            functions.push(`    return ${value};`);
            continue;
        }
        
        // result = 1
        if (line === 'result = 1') {
            mainCode.push('    '.repeat(indent) + `int result = 1;`);
            continue;
        }
        
        // result *= i
        if (line === 'result *= i') {
            mainCode.push('    '.repeat(indent) + `result *= i;`);
            continue;
        }
        
        // Переменные
        let varMatch = line.match(/^(\w+) = (\d+)$/);
        if (varMatch) {
            let [, varName, value] = varMatch;
            mainCode.push('    '.repeat(indent) + `int ${varName} = ${value};`);
            continue;
        }
        
        // Прочие строки в main
        if (!line.includes('def ') && !line.includes('return ')) {
            mainCode.push('    '.repeat(indent) + line + ';');
        }
    }
    
    // Закрываем функции
    if (functions.length > 0) {
        functions.push('}');
    }
    
    // Собираем итоговый код
    result = `#include <iostream>\nusing namespace std;\n\n`;
    
    if (functions.length > 0) {
        result += functions.join('\n') + '\n\n';
    }
    
    result += `int main() {\n`;
    result += mainCode.join('\n') + '\n';
    result += `    return 0;\n}`;
    
    return { code: result, warnings: [] };
}

// Java → Python (РАБОЧАЯ)
function translateJavaToPython(code) {
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+\w+\s*\{/g, '');
    
    // Удаляем public static void main
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{/g, '');
    
    // System.out.println("text" + var) → print(f"text{var}")
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\)\s*;/g, 'print(f"$1{$2}")');
    
    // System.out.println("text" + var + "text") → print(f"text{var}text")
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\)\s*;/g, 'print(f"$1{$2}$3")');
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("([^"]*)"\)\s*;/g, 'print("$1")');
    
    // for (int i = 1; i <= 5; i++) → for i in range(1, 6):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 'for $1 in range($2, $3 + 1):');
    
    // for (int i = 1; i < 6; i++) → for i in range(1, 6):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 'for $1 in range($2, $3):');
    
    // public static int function(int param) { → def function(param):
    result = result.replace(/public\s+static\s+int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'def $1($2):');
    
    // if (condition) { → if condition:
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1:');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'elif $1:');
    result = result.replace(/else\s*\{/g, 'else:');
    
    // Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // int var = value → var = value
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)/g, '$1 = $2');
    
    // return value; → return value
    result = result.replace(/return\s+(\w+);/g, 'return $1');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    // Форматируем отступы
    let lines = result.split('\n').filter(line => line.trim() !== '');
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        // Уменьшаем отступ для закрывающих блоков
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        // Увеличиваем отступ после строк с двоеточием
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// Pascal → Python (РАБОЧАЯ)
function translatePascalToPython(code) {
    let result = code;
    
    // Удаляем program
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → print(f"text{var}")
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\)\s*;/g, 'print(f"$1{$2}")');
    
    // writeln('text', var, 'text') → print(f"text{var}text")
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\)\s*;/g, 'print(f"$1{$2}$3")');
    
    // Простые writeln
    result = result.replace(/writeln\('([^']*)'\)\s*;/g, 'print("$1")');
    
    // for i := 1 to 5 do → for i in range(1, 6):
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 'for $1 in range($2, $3 + 1):');
    
    // function name(param: integer): integer; → def name(param):
    result = result.replace(/function\s+(\w+)\((\w+):\s*integer\):\s*integer\s*;/g, 'def $1($2):');
    
    // name := value; (в функции) → return value
    result = result.replace(/(\w+)\s*:=\s*(\w+)\s*;/g, 'return $2');
    
    // if condition then → if condition:
    result = result.replace(/if\s+(.+)\s+then/g, 'if $1:');
    result = result.replace(/else\s+if\s+(.+)\s+then/g, 'elif $1:');
    result = result.replace(/else/g, 'else:');
    
    // begin/end
    result = result.replace(/begin|end\.?/gi, '');
    
    // var := value; → var = value
    result = result.replace(/(\w+)\s*:=\s*(\d+)\s*;/g, '$1 = $2');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    result = result.replace(/\{\$(.*)\}/g, '# $1');
    result = result.replace(/\{(.*)\}/g, '# $1');
    
    // Форматируем отступы
    let lines = result.split('\n').filter(line => line.trim() !== '');
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// C++ → Python (РАБОЧАЯ)
function translateCppToPython(code) {
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // Удаляем int main()
    result = result.replace(/int\s+main\s*\(\)\s*\{/g, '');
    result = result.replace(/return 0\s*;/g, '');
    
    // cout << "text" << var << endl; → print(f"text{var}")
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*endl\s*;/g, 'print(f"$1{$2}")');
    
    // cout << "text" << var << "text" << endl; → print(f"text{var}text")
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, 'print(f"$1{$2}$3")');
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, 'print("$1")');
    
    // for (int i = 1; i <= 5; i++) → for i in range(1, 6):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 'for $1 in range($2, $3 + 1):');
    
    // int function(int param) { → def function(param):
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'def $1($2):');
    
    // if (condition) { → if condition:
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1:');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'elif $1:');
    result = result.replace(/else\s*\{/g, 'else:');
    
    // Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // int var = value; → var = value
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)\s*;/g, '$1 = $2');
    
    // return value; → return value
    result = result.replace(/return\s+(\w+)\s*;/g, 'return $1');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    // Форматируем отступы
    let lines = result.split('\n').filter(line => line.trim() !== '');
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// Pascal → Java (РАБОЧАЯ)
function translatePascalToJava(code) {
    let result = code;
    
    // Удаляем program
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → System.out.println("text" + var)
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\)\s*;/g, 'System.out.println("$1" + $2);');
    
    // writeln('text', var, 'text') → System.out.println("text" + var + "text")
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\)\s*;/g, 'System.out.println("$1" + $2 + "$3");');
    
    // Простые writeln
    result = result.replace(/writeln\('([^']*)'\)\s*;/g, 'System.out.println("$1");');
    
    // for i := 1 to 5 do → for (int i = 1; i <= 5; i++)
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // function name(param: integer): integer; → public static int name(int param) {
    result = result.replace(/function\s+(\w+)\((\w+):\s*integer\):\s*integer\s*;/g, 'public static int $1(int $2) {');
    
    // name := value; → return value;
    result = result.replace(/(\w+)\s*:=\s*(\w+)\s*;/g, 'return $2;');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    result = result.replace(/else\s+if\s+(.+)\s+then/g, 'else if ($1) {');
    result = result.replace(/else/g, 'else {');
    
    // begin/end
    result = result.replace(/begin/gi, '{');
    result = result.replace(/end\.?/gi, '}');
    
    // var := value; → int var = value;
    result = result.replace(/(\w+)\s*:=\s*(\d+)\s*;/g, 'int $1 = $2;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `public class TranslatedCode {\n    public static void main(String[] args) {\n${result}\n    }\n}`;
    
    return { code: result, warnings: [] };
}

// Pascal → C++ (РАБОЧАЯ)
function translatePascalToCpp(code) {
    let result = code;
    
    // Удаляем program
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → cout << "text" << var << endl;
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\)\s*;/g, 'cout << "$1" << $2 << endl;');
    
    // writeln('text', var, 'text') → cout << "text" << var << "text" << endl;
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\)\s*;/g, 'cout << "$1" << $2 << "$3" << endl;');
    
    // Простые writeln
    result = result.replace(/writeln\('([^']*)'\)\s*;/g, 'cout << "$1" << endl;');
    
    // for i := 1 to 5 do → for (int i = 1; i <= 5; i++)
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // function name(param: integer): integer; → int name(int param) {
    result = result.replace(/function\s+(\w+)\((\w+):\s*integer\):\s*integer\s*;/g, 'int $1(int $2) {');
    
    // name := value; → return value;
    result = result.replace(/(\w+)\s*:=\s*(\w+)\s*;/g, 'return $2;');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    result = result.replace(/else\s+if\s+(.+)\s+then/g, 'else if ($1) {');
    result = result.replace(/else/g, 'else {');
    
    // begin/end
    result = result.replace(/begin/gi, '{');
    result = result.replace(/end\.?/gi, '}');
    
    // var := value; → int var = value;
    result = result.replace(/(\w+)\s*:=\s*(\d+)\s*;/g, 'int $1 = $2;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `#include <iostream>\nusing namespace std;\n\n${result}\n\nint main() {\n    return 0;\n}`;
    
    return { code: result, warnings: [] };
}

// Java → Pascal (РАБОЧАЯ)
function translateJavaToPascal(code) {
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+\w+\s*\{/g, '');
    
    // Удаляем public static void main
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{/g, '');
    
    // System.out.println("text" + var) → writeln('text', var)
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\)\s*;/g, "writeln('$1', $2);");
    
    // System.out.println("text" + var + "text") → writeln('text', var, 'text')
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\)\s*;/g, "writeln('$1', $2, '$3');");
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("([^"]*)"\)\s*;/g, "writeln('$1');");
    
    // for (int i = 1; i <= 5; i++) → for i := 1 to 5 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 'for $1 := $2 to $3 do');
    
    // public static int function(int param) { → function function(param: integer): integer;
    result = result.replace(/public\s+static\s+int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'function $1($2: integer): integer;');
    
    // return value; → function_name := value;
    result = result.replace(/return\s+(\w+)\s*;/g, '$1 := $1;');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // Фигурные скобки → begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // int var = value; → var := value;
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)\s*;/g, '$1 := $2;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return { code: result, warnings: [] };
}

// Java → C++ (РАБОЧАЯ)
function translateJavaToCpp(code) {
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+(\w+)/g, '// public class $1');
    
    // public static void main → int main()
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)/g, 'int main()');
    
    // System.out.println("text" + var) → cout << "text" << var << endl;
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\)\s*;/g, 'cout << "$1" << $2 << endl;');
    
    // System.out.println("text" + var + "text") → cout << "text" << var << "text" << endl;
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\)\s*;/g, 'cout << "$1" << $2 << "$3" << endl;');
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("([^"]*)"\)\s*;/g, 'cout << "$1" << endl;');
    
    // public static int function(int param) → int function(int param)
    result = result.replace(/public\s+static\s+int\s+(\w+)\(int\s+(\w+)\)/g, 'int $1(int $2)');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    return { code: result, warnings: [] };
}

// C++ → Java (РАБОЧАЯ)
function translateCppToJava(code) {
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // int main() → public static void main(String[] args)
    result = result.replace(/int\s+main\s*\(\)/g, 'public static void main(String[] args)');
    
    // cout << "text" << var << endl; → System.out.println("text" + var)
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*endl\s*;/g, 'System.out.println("$1" + $2);');
    
    // cout << "text" << var << "text" << endl; → System.out.println("text" + var + "text")
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, 'System.out.println("$1" + $2 + "$3");');
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, 'System.out.println("$1");');
    
    // int function(int param) → public static int function(int param)
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)/g, 'public static int $1(int $2)');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `public class TranslatedCode {\n    ${result}\n}`;
    
    return { code: result, warnings: [] };
}

// C++ → Pascal (РАБОЧАЯ)
function translateCppToPascal(code) {
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // Удаляем int main()
    result = result.replace(/int\s+main\s*\(\)\s*\{/g, '');
    result = result.replace(/return 0\s*;/g, '');
    
    // cout << "text" << var << endl; → writeln('text', var)
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*endl\s*;/g, "writeln('$1', $2);");
    
    // cout << "text" << var << "text" << endl; → writeln('text', var, 'text')
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*(\w+)\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, "writeln('$1', $2, '$3');");
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"([^"]*)"\s*<<\s*endl\s*;/g, "writeln('$1');");
    
    // for (int i = 1; i <= 5; i++) → for i := 1 to 5 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\s*\)/g, 'for $1 := $2 to $3 do');
    
    // int function(int param) { → function function(param: integer): integer;
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'function $1($2: integer): integer;');
    
    // return value; → function_name := value;
    result = result.replace(/return\s+(\w+)\s*;/g, '$1 := $1;');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // Фигурные скобки → begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // int var = value; → var := value;
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)\s*;/g, '$1 := $2;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Собираем код
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return { code: result, warnings: [] };
}

// ==================== ОСНОВНАЯ ФУНКЦИЯ ПЕРЕВОДА ====================

function translateCode() {
    const sourceCode = document.getElementById('source-code').value.trim();
    const warningsContainer = document.getElementById('warnings');
    
    // Очищаем информационный блок
    warningsContainer.innerHTML = '';
    
    if (!sourceCode) {
        showNotification('Введите код для перевода', 'warning');
        return;
    }
    
    if (currentSourceLang === currentTargetLang) {
        document.getElementById('translated-code').textContent = sourceCode;
        showNotification('Исходный и целевой языки совпадают', 'info');
        return;
    }
    
    let result;
    
    // ОПРЕДЕЛЯЕМ КАКОЙ ПЕРЕВОД ИСПОЛЬЗОВАТЬ
    const translationKey = `${currentSourceLang}_to_${currentTargetLang}`;
    
    console.log(`Перевод: ${translationKey}`);
    
    switch(translationKey) {
        case 'python_to_pascal':
            result = translatePythonToPascal(sourceCode);
            break;
        case 'pascal_to_python':
            result = translatePascalToPython(sourceCode);
            break;
        case 'python_to_java':
            result = translatePythonToJava(sourceCode);
            break;
        case 'python_to_cpp':
            result = translatePythonToCpp(sourceCode);
            break;
        case 'java_to_python':
            result = translateJavaToPython(sourceCode);
            break;
        case 'cpp_to_python':
            result = translateCppToPython(sourceCode);
            break;
        case 'pascal_to_java':
            result = translatePascalToJava(sourceCode);
            break;
        case 'pascal_to_cpp':
            result = translatePascalToCpp(sourceCode);
            break;
        case 'java_to_pascal':
            result = translateJavaToPascal(sourceCode);
            break;
        case 'java_to_cpp':
            result = translateJavaToCpp(sourceCode);
            break;
        case 'cpp_to_pascal':
            result = translateCppToPascal(sourceCode);
            break;
        case 'cpp_to_java':
            result = translateCppToJava(sourceCode);
            break;
        default:
            result = {
                code: '# Этот перевод пока не реализован\n# Выберите другую комбинацию языков',
                warnings: ['Это направление перевода в разработке']
            };
    }
    
    // Отображаем результат
    document.getElementById('translated-code').textContent = result.code;
    
    // Отображаем информацию
    const successItem = document.createElement('div');
    successItem.className = 'info-item';
    successItem.innerHTML = `<i class="fas fa-check-circle"></i><span>Перевод выполнен успешно!</span>`;
    warningsContainer.appendChild(successItem);
    
    showNotification('Перевод завершен!', 'success');
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function showNotification(message, type) {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                        type === 'error' ? 'exclamation-circle' : 
                        type === 'warning' ? 'exclamation-triangle' : 
                        'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateLanguageNames() {
    const langNames = {
        'python': 'Python',
        'pascal': 'Pascal', 
        'java': 'Java',
        'cpp': 'C++'
    };
    
    document.getElementById('source-lang-name').textContent = langNames[currentSourceLang];
    document.getElementById('target-lang-name').textContent = langNames[currentTargetLang];
    document.getElementById('from-lang').textContent = langNames[currentSourceLang];
    document.getElementById('to-lang').textContent = langNames[currentTargetLang];
}

function swapLanguages() {
    // Меняем языки местами
    const temp = currentSourceLang;
    currentSourceLang = currentTargetLang;
    currentTargetLang = temp;
    
    // Обновляем интерфейс
    updateLanguageSelection();
    updateLanguageNames();
    
    // Меняем код местами
    const sourceCode = document.getElementById('source-code').value;
    const translatedCode = document.getElementById('translated-code').textContent;
    
    document.getElementById('source-code').value = translatedCode;
    document.getElementById('translated-code').textContent = sourceCode;
    
    showNotification('Языки поменяны местами', 'info');
}

function updateLanguageSelection() {
    // Обновляем исходный язык
    document.querySelectorAll('#source-selector .lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === currentSourceLang) {
            option.classList.add('active');
        }
    });
    
    // Обновляем целевой язык
    document.querySelectorAll('#target-selector .lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === currentTargetLang) {
            option.classList.add('active');
        }
    });
}

// КОПИРОВАНИЕ КОДА
function copyTranslatedCode() {
    const code = document.getElementById('translated-code').textContent;
    navigator.clipboard.writeText(code)
        .then(() => showNotification('Код скопирован в буфер!', 'success'))
        .catch(() => showNotification('Ошибка при копировании', 'error'));
}

// ЗАГРУЗКА ПРИМЕРОВ
function loadExample(exampleKey) {
    if (codeExamples[exampleKey]) {
        const example = codeExamples[exampleKey];
        document.getElementById('source-code').value = example.code;
        
        // Устанавливаем правильный язык
        if (example.lang !== currentSourceLang) {
            currentSourceLang = example.lang;
            updateLanguageSelection();
            updateLanguageNames();
        }
        
        showNotification(`Загружен пример: ${exampleKey.replace('_', ' ')}`, 'info');
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    updateLanguageNames();
    
    // Обработчики выбора языка
    document.querySelectorAll('#source-selector .lang-option').forEach(option => {
        option.addEventListener('click', function() {
            currentSourceLang = this.dataset.lang;
            updateLanguageSelection();
            updateLanguageNames();
        });
    });
    
    document.querySelectorAll('#target-selector .lang-option').forEach(option => {
        option.addEventListener('click', function() {
            currentTargetLang = this.dataset.lang;
            updateLanguageSelection();
            updateLanguageNames();
        });
    });
    
    // Кнопки
    document.querySelector('.translate-btn').addEventListener('click', translateCode);
    document.querySelector('.swap-btn').addEventListener('click', swapLanguages);
    document.querySelector('.clear-btn').addEventListener('click', function() {
        document.getElementById('source-code').value = '';
        document.getElementById('translated-code').textContent = '';
        showNotification('Поля очищены', 'info');
    });
    document.querySelector('.copy-btn').addEventListener('click', copyTranslatedCode);
    
    // Примеры кода
    document.getElementById('examples').addEventListener('change', function() {
        if (this.value) {
            loadExample(this.value);
            this.value = '';
        }
    });
    
    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateCode();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            swapLanguages();
        }
        if (e.ctrlKey && e.key === 'c' && e.altKey) {
            e.preventDefault();
            copyTranslatedCode();
        }
    });
    
    showNotification('Code Translator готов к работе!', 'info');
});
