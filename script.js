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

// Python → Pascal (ИСПРАВЛЕН)
function translatePythonToPascal(code) {
    let warnings = [];
    let result = code;
    
    // Обработка f-строк: print(f"Text {var}") → writeln('Text ', var)
    result = result.replace(/print\(f"(.*?){\s*(\w+)\s*}(.*?)"\)/g, function(match, before, varName, after) {
        let pascalStr = `writeln('${before}', ${varName}, '${after}')`;
        // Убираем лишние запятые если части пустые
        pascalStr = pascalStr.replace(", '',", ",").replace("'', ", "").replace(", ''", "");
        return pascalStr;
    });
    
    // Обычные print
    result = result.replace(/print\("(.*?)"\)/g, "writeln('$1')");
    
    // for i in range(start, end): → for i := start to end-1 do
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for $1 := $2 to $3-1 do');
    
    // for i in range(end): → for i := 0 to end-1 do
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+)\):/g, 'for $1 := 0 to $2-1 do');
    
    // def function(): → procedure function();
    result = result.replace(/def\s+(\w+)\((.*?)\):/g, 'procedure $1($2);');
    
    // if condition: → if condition then
    result = result.replace(/if\s+(.+):/g, 'if $1 then');
    result = result.replace(/elif\s+(.+):/g, 'else if $1 then');
    result = result.replace(/else:/g, 'else');
    
    // return → Result := (для функций)
    result = result.replace(/return\s+(\w+)/g, 'Result := $1');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    // Удаляем лишние пустые строки
    const lines = result.split('\n').filter(line => line.trim() !== '');
    
    // Форматируем отступы
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('end') || trimmed.startsWith('else') || trimmed.startsWith('until')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith('then') || trimmed.endsWith('do') || trimmed.endsWith('begin')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n');
    
    // Добавляем program если его нет
    if (!result.includes('program') && !result.includes('Program')) {
        result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    }
    
    return {
        code: result,
        warnings: warnings
    };
}

// Pascal → Python (ИСПРАВЛЕН)
function translatePascalToPython(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем заголовок программы
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → print(f"text{var}")
    result = result.replace(/writeln\('(.*?)',\s*(\w+)(?:,\s*'(.*?)')?\);/g, function(match, before, varName, after) {
        if (after) {
            return `print(f"${before}{${varName}}${after}")`;
        }
        return `print(f"${before}{${varName}}")`;
    });
    
    // Простые writeln
    result = result.replace(/writeln\('(.*?)'\);/g, 'print("$1")');
    
    // for i := 1 to 5 do → for i in range(1, 6):
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 'for $1 in range($2, $3 + 1):');
    
    // if condition then → if condition:
    result = result.replace(/if\s+(.+)\s+then/g, 'if $1:');
    
    // else if → elif
    result = result.replace(/else\s+if/g, 'elif');
    
    // Удаляем begin/end
    result = result.replace(/begin|end\.?/gi, '');
    
    // procedure function(); → def function():
    result = result.replace(/procedure\s+(\w+)\((.*?)\);/g, 'def $1($2):');
    
    // Result := → return
    result = result.replace(/Result\s*:=\s*(\w+)/g, 'return $1');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    result = result.replace(/\{\$(.*)\}/g, '# $1');
    result = result.replace(/\{(.*)\}/g, '# $1');
    
    // Форматируем отступы
    const lines = result.split('\n').filter(line => line.trim() !== '');
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('end') || trimmed.startsWith('elif') || trimmed.startsWith('else')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('    '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n').trim();
    
    return {
        code: result,
        warnings: warnings
    };
}

// Python → Java (ИСПРАВЛЕН)
function translatePythonToJava(code) {
    let warnings = [];
    let result = code;
    
    // def function(param): → public static int function(int param) {
    result = result.replace(/def\s+(\w+)\((\w+)\):/g, 'public static int $1(int $2) {');
    
    // def function(): → public static void function() {
    result = result.replace(/def\s+(\w+)\(\):/g, 'public static void $1() {');
    
    // print(f"text {var}") → System.out.println("text " + var)
    result = result.replace(/print\(f"(.*?){\s*(\w+)\s*}(.*?)"\)/g, 'System.out.println("$1" + $2 + "$3");');
    
    // Обычные print
    result = result.replace(/print\("(.*?)"\)/g, 'System.out.println("$1");');
    
    // for i in range(start, end): → for (int i = start; i < end; i++) {
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // for i in range(end): → for (int i = 0; i < end; i++) {
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+)\):/g, 'for (int $1 = 0; $1 < $2; $1++) {');
    
    // if condition: → if (condition) {
    result = result.replace(/if\s+(.+):/g, 'if ($1) {');
    result = result.replace(/elif\s+(.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // Объявляем переменные
    result = result.replace(/^(\s*)(\w+)\s*=\s*(\d+)/gm, '$1int $2 = $3;');
    result = result.replace(/^(\s*)(\w+)\s*=\s*(\w+)/gm, '$1int $2 = $3;');
    
    // return → return
    result = result.replace(/return\s+(\w+)/g, 'return $1;');
    
    // result = 1 → int result = 1;
    result = result.replace(/result\s*=\s*1/g, 'int result = 1;');
    result = result.replace(/result\s*=\s*(\w+)/g, 'int result = $1;');
    
    // result *= i → result *= i;
    result = result.replace(/result\s*\*=\s*i/g, 'result *= i;');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    // Обработка отступов
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    let inMain = false;
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('public static')) {
            newLines.push('    '.repeat(indentLevel) + trimmed);
            indentLevel++;
        } else if (trimmed.startsWith('}')) {
            indentLevel--;
            newLines.push('    '.repeat(indentLevel) + trimmed);
        } else if (trimmed === '') {
            newLines.push('');
        } else if (trimmed.includes('int ') && trimmed.includes('=') && !trimmed.includes('main')) {
            // Переменные вне методов
            if (!inMain) {
                newLines.push('        ' + trimmed);
            } else {
                newLines.push('    '.repeat(indentLevel) + trimmed);
            }
        } else {
            newLines.push('    '.repeat(indentLevel) + trimmed);
        }
    }
    
    result = newLines.join('\n');
    
    // Если нет main, добавляем его
    if (!result.includes('main')) {
        // Разделяем код на функции и основной код
        const lines = result.split('\n');
        let functions = [];
        let mainCode = [];
        let inFunction = false;
        let currentFunction = [];
        
        for (let line of lines) {
            if (line.includes('public static')) {
                if (currentFunction.length > 0) {
                    functions.push(currentFunction.join('\n'));
                }
                currentFunction = [line];
                inFunction = true;
            } else if (line.trim().startsWith('}') && inFunction) {
                currentFunction.push(line);
                functions.push(currentFunction.join('\n'));
                currentFunction = [];
                inFunction = false;
            } else if (inFunction) {
                currentFunction.push(line);
            } else if (line.trim() && !line.includes('class')) {
                mainCode.push('        ' + line.trim());
            }
        }
        
        if (currentFunction.length > 0) {
            functions.push(currentFunction.join('\n'));
        }
        
        // Собираем итоговый код
        result = `public class TranslatedCode {\n`;
        
        // Добавляем функции
        if (functions.length > 0) {
            result += functions.join('\n\n') + '\n\n';
        }
        
        // Добавляем main
        result += '    public static void main(String[] args) {\n';
        
        // Добавляем основной код
        if (mainCode.length > 0) {
            result += mainCode.join('\n') + '\n';
        }
        
        result += '    }\n}';
    }
    
    return {
        code: result,
        warnings: warnings
    };
}

// Python → C++ (ИСПРАВЛЕН)
function translatePythonToCpp(code) {
    let warnings = [];
    let result = code;
    
    // def function(param): → int function(int param) {
    result = result.replace(/def\s+(\w+)\((\w+)\):/g, 'int $1(int $2) {');
    
    // print(f"text {var}") → cout << "text " << var << endl;
    result = result.replace(/print\(f"(.*?){\s*(\w+)\s*}(.*?)"\)/g, 'cout << "$1" << $2 << "$3" << endl;');
    
    // Обычные print
    result = result.replace(/print\("(.*?)"\)/g, 'cout << "$1" << endl;');
    
    // for i in range(start, end): → for (int i = start; i < end; i++) {
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // if condition: → if (condition) {
    result = result.replace(/if\s+(.+):/g, 'if ($1) {');
    result = result.replace(/elif\s+(.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // Объявляем переменные
    result = result.replace(/^(\s*)(\w+)\s*=\s*(\d+)/gm, '$1int $2 = $3;');
    result = result.replace(/^(\s*)(\w+)\s*=\s*(\w+)/gm, '$1int $2 = $3;');
    
    // result = 1 → int result = 1;
    result = result.replace(/result\s*=\s*1/g, 'int result = 1;');
    result = result.replace(/result\s*=\s*(\w+)/g, 'int result = $1;');
    
    // result *= i → result *= i;
    result = result.replace(/result\s*\*=\s*i/g, 'result *= i;');
    
    // return → return
    result = result.replace(/return\s+(\w+)/g, 'return $1;');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    // Форматируем отступы
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    let hasMain = false;
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.endsWith('{')) {
            newLines.push('    '.repeat(indentLevel) + trimmed);
            indentLevel++;
        } else if (trimmed.startsWith('}')) {
            indentLevel--;
            newLines.push('    '.repeat(indentLevel) + trimmed);
        } else if (trimmed === '') {
            newLines.push('');
        } else {
            newLines.push('    '.repeat(indentLevel) + trimmed);
        }
    }
    
    result = newLines.join('\n');
    
    // Добавляем заголовки
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    // Добавляем main если его нет
    if (!result.includes('main')) {
        // Находим код вне функций
        const lines = result.split('\n');
        let functions = [];
        let mainCode = [];
        let inFunction = false;
        let currentFunction = [];
        
        for (let line of lines) {
            if (line.includes('int ') && line.includes('(') && line.includes(')') && line.includes('{')) {
                if (currentFunction.length > 0) {
                    functions.push(currentFunction.join('\n'));
                }
                currentFunction = [line];
                inFunction = true;
            } else if (line.trim().startsWith('}') && inFunction) {
                currentFunction.push(line);
                functions.push(currentFunction.join('\n'));
                currentFunction = [];
                inFunction = false;
            } else if (inFunction) {
                currentFunction.push(line);
            } else if (line.trim() && !line.includes('#include') && !line.includes('using namespace')) {
                mainCode.push('    ' + line.trim());
            }
        }
        
        if (currentFunction.length > 0) {
            functions.push(currentFunction.join('\n'));
        }
        
        // Собираем итоговый код
        result = `#include <iostream>\nusing namespace std;\n\n`;
        
        if (functions.length > 0) {
            result += functions.join('\n\n') + '\n\n';
        }
        
        result += 'int main() {\n';
        
        if (mainCode.length > 0) {
            result += mainCode.join('\n') + '\n';
        }
        
        result += '    return 0;\n}';
    }
    
    return {
        code: result,
        warnings: warnings
    };
}

// Java → Python (ИСПРАВЛЕН)
function translateJavaToPython(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+\w+\s*\{/g, '');
    
    // Удаляем public static void main
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{/g, '');
    
    // System.out.println("text " + var) → print(f"text{var}")
    result = result.replace(/System\.out\.println\("(.*?)"\s*\+\s*(\w+)(?:\s*\+\s*"(.*?)")?\);/g, 
        function(match, before, varName, after) {
            if (after) {
                return `print(f"${before}{${varName}}${after}")`;
            }
            return `print(f"${before}{${varName}}")`;
        });
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("(.*?)"\);/g, 'print("$1")');
    
    // for (int i = 1; i <= 5; i++) → for i in range(1, 6):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\)/g, 
        'for $1 in range($2, $3 + 1):');
    
    // for (int i = 0; i < 5; i++) → for i in range(0, 5):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\)/g, 
        'for $1 in range($2, $3):');
    
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
    
    // Удаляем типы переменных
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)/g, '$1 = $2');
    result = result.replace(/int\s+(\w+)\s*=\s*(\w+)/g, '$1 = $2');
    
    // return → return
    result = result.replace(/return\s+(\w+);/g, 'return $1');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    // Форматируем отступы
    const lines = result.split('\n').filter(line => line.trim() !== '');
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('elif') || trimmed.startsWith('else') || 
            trimmed.startsWith('}') || trimmed.endsWith('return')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('    '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n').trim();
    
    return {
        code: result,
        warnings: warnings
    };
}

// C++ → Python (ИСПРАВЛЕН)
function translateCppToPython(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // Удаляем int main()
    result = result.replace(/int\s+main\s*\(\)\s*\{/g, '');
    result = result.replace(/return 0;/g, '');
    
    // cout << "text " << var << endl; → print(f"text{var}")
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*(\w+)(?:\s*<<\s*"(.*?)")?\s*<<\s*endl\s*;/g, 
        function(match, before, varName, after) {
            if (after) {
                return `print(f"${before}{${varName}}${after}")`;
            }
            return `print(f"${before}{${varName}}")`;
        });
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*endl\s*;/g, 'print("$1")');
    
    // for (int i = 1; i <= 5; i++) → for i in range(1, 6):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\)/g, 
        'for $1 in range($2, $3 + 1):');
    
    // if (condition) { → if condition:
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1:');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'elif $1:');
    result = result.replace(/else\s*\{/g, 'else:');
    
    // int function(int param) { → def function(param):
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'def $1($2):');
    
    // Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // Удаляем типы переменных
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+)/g, '$1 = $2');
    result = result.replace(/int\s+result\s*=\s*1;/g, 'result = 1');
    
    // result *= i; → result *= i
    result = result.replace(/(\w+)\s*\*=\s*(\w+);/g, '$1 *= $2');
    
    // return → return
    result = result.replace(/return\s+(\w+);/g, 'return $1');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    // Форматируем отступы
    const lines = result.split('\n').filter(line => line.trim() !== '');
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('elif') || trimmed.startsWith('else') || trimmed.endsWith('return')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('    '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n').trim();
    
    return {
        code: result,
        warnings: warnings
    };
}

// Pascal → Java (ИСПРАВЛЕН)
function translatePascalToJava(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем program
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → System.out.println("text" + var)
    result = result.replace(/writeln\('(.*?)',\s*(\w+)(?:,\s*'(.*?)')?\);/g, 
        function(match, before, varName, after) {
            if (after) {
                return `System.out.println("${before}" + ${varName} + "${after}");`;
            }
            return `System.out.println("${before}" + ${varName});`;
        });
    
    // Простые writeln
    result = result.replace(/writeln\('(.*?)'\);/g, 'System.out.println("$1");');
    
    // for i := 1 to 5 do → for (int i = 1; i <= 5; i++) {
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 
        'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // procedure function(param); → public static int function(int param) {
    result = result.replace(/procedure\s+(\w+)\((\w+)\);/g, 'public static int $1(int $2) {');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    
    // else if → else if
    result = result.replace(/else\s+if/g, 'else if');
    
    // begin → {
    result = result.replace(/begin/gi, '{');
    
    // end. → }
    result = result.replace(/end\./gi, '}');
    
    // Result := → return
    result = result.replace(/Result\s*:=\s*(\w+)/g, 'return $1;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Форматируем отступы
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('}') || trimmed.startsWith('else') || trimmed.startsWith('return')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        newLines.push('    '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith('{') || trimmed.endsWith('then')) {
            indentLevel++;
        }
    }
    
    result = newLines.join('\n');
    
    // Добавляем класс и main если нужно
    if (!result.includes('public class')) {
        result = `public class TranslatedCode {\n    public static void main(String[] args) {\n${result}\n    }\n}`;
    }
    
    return {
        code: result,
        warnings: warnings
    };
}

// Pascal → C++ (ИСПРАВЛЕН)
function translatePascalToCpp(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем program
    result = result.replace(/program\s+\w+;/i, '');
    
    // writeln('text', var) → cout << "text" << var << endl;
    result = result.replace(/writeln\('(.*?)',\s*(\w+)(?:,\s*'(.*?)')?\);/g, 
        function(match, before, varName, after) {
            if (after) {
                return `cout << "${before}" << ${varName} << "${after}" << endl;`;
            }
            return `cout << "${before}" << ${varName} << endl;`;
        });
    
    // Простые writeln
    result = result.replace(/writeln\('(.*?)'\);/g, 'cout << "$1" << endl;');
    
    // for i := 1 to 5 do → for (int i = 1; i <= 5; i++) {
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\d+)\s+do/g, 
        'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // procedure function(param); → int function(int param) {
    result = result.replace(/procedure\s+(\w+)\((\w+)\);/g, 'int $1(int $2) {');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    
    // begin → {
    result = result.replace(/begin/gi, '{');
    
    // end. → }
    result = result.replace(/end\./gi, '}');
    
    // Result := → return
    result = result.replace(/Result\s*:=\s*(\w+)/g, 'return $1;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Форматируем отступы
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('}') || trimmed.startsWith('else') || trimmed.startsWith('return')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        newLines.push('    '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith('{') || trimmed.endsWith('then')) {
            indentLevel++;
        }
    }
    
    result = newLines.join('\n');
    
    // Добавляем заголовки и main
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    if (!result.includes('int main')) {
        result += '\n\nint main() {\n    // Вставьте вызовы функций здесь\n    return 0;\n}';
    }
    
    return {
        code: result,
        warnings: warnings
    };
}

// Java → Pascal (ИСПРАВЛЕН)
function translateJavaToPascal(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+\w+\s*\{/g, '');
    
    // Удаляем public static void main
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)\s*\{/g, '');
    
    // System.out.println("text" + var) → writeln('text', var)
    result = result.replace(/System\.out\.println\("(.*?)"\s*\+\s*(\w+)(?:\s*\+\s*"(.*?)")?\);/g, 
        function(match, before, varName, after) {
            if (after) {
                return `writeln('${before}', ${varName}, '${after}');`;
            }
            return `writeln('${before}', ${varName});`;
        });
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("(.*?)"\);/g, "writeln('$1');");
    
    // for (int i = 1; i <= 5; i++) { → for i := 1 to 5 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\)\s*\{/g, 
        'for $1 := $2 to $3 do');
    
    // public static int function(int param) { → procedure function(param);
    result = result.replace(/public\s+static\s+int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'procedure $1($2);');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // Удаляем фигурные скобки и заменяем на begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // Удаляем точки с запятой в конце begin
    result = result.replace(/begin;/g, 'begin');
    
    // int var = value → var := value
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+);/g, '$1 := $2;');
    
    // return → Result :=
    result = result.replace(/return\s+(\w+);/g, 'Result := $1;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Форматируем отступы
    const lines = result.split('\n').filter(line => line.trim() !== '');
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('end') || trimmed.startsWith('else')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith('then') || trimmed.endsWith('do') || trimmed.endsWith('begin')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n');
    
    // Добавляем program
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return {
        code: result,
        warnings: warnings
    };
}

// Java → C++ (ИСПРАВЛЕН)
function translateJavaToCpp(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public\s+class\s+\w+\s*/g, '// public class');
    
    // Удаляем public static void main → int main()
    result = result.replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+args\)/g, 'int main()');
    
    // System.out.println("text" + var) → cout << "text" << var << endl;
    result = result.replace(/System\.out\.println\("(.*?)"\s*\+\s*(\w+)(?:\s*\+\s*"(.*?)")?\);/g, 
        function(match, before, varName, after) {
            if (after) {
                return `cout << "${before}" << ${varName} << "${after}" << endl;`;
            }
            return `cout << "${before}" << ${varName} << endl;`;
        });
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("(.*?)"\);/g, 'cout << "$1" << endl;');
    
    // for (int i = 1; i <= 5; i++) { остаётся таким же
    // public static int function(int param) { → int function(int param) {
    result = result.replace(/public\s+static\s+int\s+(\w+)\(int\s+(\w+)\)/g, 'int $1(int $2)');
    
    // if (condition) { остаётся таким же
    
    // Убираем фигурные скобки? Нет, в C++ они нужны
    
    // String[] args → (удаляем)
    result = result.replace(/String\[\]\s+args/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Добавляем заголовки
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    return {
        code: result,
        warnings: warnings
    };
}

// C++ → Java (ИСПРАВЛЕН)
function translateCppToJava(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // int main() → public static void main(String[] args)
    result = result.replace(/int\s+main\s*\(\)/g, 'public static void main(String[] args)');
    
    // cout << "text" << var << endl; → System.out.println("text" + var)
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*(\w+)(?:\s*<<\s*"(.*?)")?\s*<<\s*endl\s*;/g, 
        function(match, before, varName, after) {
            if (after) {
                return `System.out.println("${before}" + ${varName} + "${after}");`;
            }
            return `System.out.println("${before}" + ${varName});`;
        });
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*endl\s*;/g, 'System.out.println("$1");');
    
    // int function(int param) { → public static int function(int param) {
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)/g, 'public static int $1(int $2)');
    
    // return 0; в main → (оставляем)
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Добавляем класс
    result = `public class TranslatedCode {\n    ${result}\n}`;
    
    return {
        code: result,
        warnings: warnings
    };
}

// C++ → Pascal (ИСПРАВЛЕН)
function translateCppToPascal(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // Удаляем int main()
    result = result.replace(/int\s+main\s*\(\)\s*\{/g, '');
    result = result.replace(/return 0;/g, '');
    
    // cout << "text" << var << endl; → writeln('text', var)
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*(\w+)(?:\s*<<\s*"(.*?)")?\s*<<\s*endl\s*;/g, 
        function(match, before, varName, after) {
            if (after) {
                return `writeln('${before}', ${varName}, '${after}');`;
            }
            return `writeln('${before}', ${varName});`;
        });
    
    // Простые cout
    result = result.replace(/cout\s*<<\s*"(.*?)"\s*<<\s*endl\s*;/g, "writeln('$1');");
    
    // for (int i = 1; i <= 5; i++) { → for i := 1 to 5 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)\s*;\s*\1\+\+\)\s*\{/g, 
        'for $1 := $2 to $3 do');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else\s+if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // int function(int param) { → procedure function(param);
    result = result.replace(/int\s+(\w+)\(int\s+(\w+)\)\s*\{/g, 'procedure $1($2);');
    
    // Удаляем фигурные скобки и заменяем на begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // int var = value → var := value
    result = result.replace(/int\s+(\w+)\s*=\s*(\d+);/g, '$1 := $2;');
    
    // return value; → Result := value;
    result = result.replace(/return\s+(\w+);/g, 'Result := $1;');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Форматируем отступы
    const lines = result.split('\n').filter(line => line.trim() !== '');
    let indentLevel = 0;
    let formattedLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('end') || trimmed.startsWith('else')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
        
        if (trimmed.endsWith('then') || trimmed.endsWith('do') || trimmed.endsWith('begin')) {
            indentLevel++;
        }
    }
    
    result = formattedLines.join('\n');
    
    // Добавляем program
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return {
        code: result,
        warnings: warnings
    };
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
    let warnings = [];
    
    // ОПРЕДЕЛЯЕМ КАКОЙ ПЕРЕВОД ИСПОЛЬЗОВАТЬ
    const translationKey = `${currentSourceLang}_to_${currentTargetLang}`;
    
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
    if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
            const infoItem = document.createElement('div');
            infoItem.className = 'info-item';
            infoItem.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${warning}</span>`;
            warningsContainer.appendChild(infoItem);
        });
    } else {
        const successItem = document.createElement('div');
        successItem.className = 'info-item';
        successItem.innerHTML = `<i class="fas fa-check-circle"></i><span>Перевод выполнен успешно!</span>`;
        warningsContainer.appendChild(successItem);
    }
    
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
