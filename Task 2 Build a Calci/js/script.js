// DOM elements
const display = document.getElementById('display');
let currentInput = '';    // stores current expression / number
let lastResult = null;     // store last calculated result (optional)

// Helper: update display
function updateDisplay(value) {
    display.value = value || '0';
}

// Evaluate expression safely
function evaluateExpression(expr) {
    // Replace visual operators with JS operators
    let jsExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    try {
        // Using Function constructor is safer than eval, but for a calculator it's fine.
        // Use try-catch to avoid syntax errors.
        let result = Function('"use strict";return (' + jsExpr + ')')();
        if (isNaN(result) || !isFinite(result)) throw new Error('Invalid');
        // round to avoid floating point glitches (max 8 decimals)
        return Math.round(result * 1e8) / 1e8;
    } catch (e) {
        return null;
    }
}

// Handle button clicks
function handleButton(value, type) {
    if (type === 'number') {
        // Prevent multiple leading zeros
        if (currentInput === '0' && value !== '.') {
            currentInput = value;
        } else {
            currentInput += value;
        }
        updateDisplay(currentInput);
    }
    else if (type === 'operator') {
        // if currentInput is empty but lastResult exists, use lastResult
        if (currentInput === '' && lastResult !== null) {
            currentInput = lastResult.toString();
        }
        // Don't allow empty expression start with operator
        if (currentInput === '' && value !== '-') return;
        // Replace last operator if user clicks operator after operator
        const lastChar = currentInput.slice(-1);
        if (['+', '-', '*', '/', '×', '÷'].includes(lastChar)) {
            // replace last operator
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            currentInput += value;
        }
        updateDisplay(currentInput);
    }
    else if (type === 'decimal') {
        // Prevent multiple decimals in current number
        let parts = currentInput.split(/[\+\-\*\/\×\÷]/);
        let lastPart = parts[parts.length - 1];
        if (!lastPart.includes('.')) {
            if (lastPart === '') currentInput += '0.';
            else currentInput += '.';
            updateDisplay(currentInput);
        }
    }
    else if (type === 'clear') {
        currentInput = '';
        lastResult = null;
        updateDisplay('0');
    }
    else if (type === 'backspace') {
        currentInput = currentInput.slice(0, -1);
        updateDisplay(currentInput || '0');
    }
    else if (type === 'equals') {
        if (currentInput === '') {
            if (lastResult !== null) {
                currentInput = lastResult.toString();
                updateDisplay(currentInput);
            }
            return;
        }
        let result = evaluateExpression(currentInput);
        if (result !== null) {
            lastResult = result;
            currentInput = result.toString();
            updateDisplay(currentInput);
        } else {
            updateDisplay('Error');
            currentInput = '';
            lastResult = null;
            setTimeout(() => {
                if (display.value === 'Error') updateDisplay('0');
            }, 1200);
        }
    }
}

// Add event listeners to all buttons (delegation)
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // identify type
        if (btn.classList.contains('number')) {
            let num = btn.getAttribute('data-num');
            handleButton(num, 'number');
        }
        else if (btn.classList.contains('operator')) {
            let op = btn.getAttribute('data-op');
            handleButton(op, 'operator');
        }
        else if (btn.classList.contains('decimal')) {
            handleButton('.', 'decimal');
        }
        else if (btn.classList.contains('clear')) {
            handleButton('', 'clear');
        }
        else if (btn.classList.contains('backspace')) {
            handleButton('', 'backspace');
        }
        else if (btn.classList.contains('equals')) {
            handleButton('', 'equals');
        }
    });
});

// ===== KEYBOARD SUPPORT (Bonus) =====
document.addEventListener('keydown', (e) => {
    const key = e.key;
    // Numbers 0-9
    if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleButton(key, 'number');
    }
    // Operators: + - * / 
    else if (key === '+') {
        e.preventDefault();
        handleButton('+', 'operator');
    }
    else if (key === '-') {
        e.preventDefault();
        handleButton('-', 'operator');
    }
    else if (key === '*') {
        e.preventDefault();
        handleButton('×', 'operator');   // display as ×
    }
    else if (key === '/') {
        e.preventDefault();
        handleButton('÷', 'operator');   // display as ÷
    }
    else if (key === '.') {
        e.preventDefault();
        handleButton('.', 'decimal');
    }
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleButton('', 'equals');
    }
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        handleButton('', 'clear');
    }
    else if (key === 'Backspace') {
        e.preventDefault();
        handleButton('', 'backspace');
    }
});

// prevent default behavior on some keys for input field (but display is readonly)
display.addEventListener('keydown', (e) => {
    e.preventDefault();
});