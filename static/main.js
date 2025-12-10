// 数学系のユーティリティ
function logFactorial(n) {
    if (n === 0 || n === 1) return 0;
    let result = 0;
    for (let i = 2; i <= n; i++) {
        result += Math.log(i);
    }
    return result;
}

function binomialCoefficientLog(n, k) {
    return Math.exp(logFactorial(n) - logFactorial(k) - logFactorial(n - k));
}

function binomialProbability(n, k, p) {
    return binomialCoefficientLog(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function atLeastOneHitProbability(p, n) {
    return 1 - Math.pow(1 - p, n);
}

function atLeastMHitsProbability(p, n, m) {
    let cumulative = 0;
    for (let k = 0; k < m; k++) {
        cumulative += binomialProbability(n, k, p);
    }
    return 1 - cumulative;
}

function requiredTrialsForProbability(p, targetProb) {
    if (p <= 0 || p >= 1) {
        return 0;
    }
    const trials = Math.log(1 - targetProb) / Math.log(1 - p);
    return Math.max(0, Math.ceil(trials));
}

// DOM 操作周り
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function toHalfWidth(str) {
    return str.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
}

function parseNumericInput(value, fallback) {
    if (!value) return fallback;
    const sanitized = toHalfWidth(String(value)).replace(/[^0-9.]/g, "");
    const numeric = parseFloat(sanitized);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function formatPercent(prob) {
    return `${(prob * 100).toPrecision(10)}%`;
}

function calculateProbabilities() {
    const nInput = document.getElementById("num_trials_value");
    const pInput = document.getElementById("drop_rate_value");
    const mInput = document.getElementById("desired_count");
    const targetInput = document.getElementById("target_prob_value");

    const n = clamp(parseInt(parseNumericInput(nInput.value, 1), 10), 1, 1000);
    const pPercent = clamp(parseNumericInput(pInput.value, 0.1), 0.1, 100);
    const m = clamp(parseInt(parseNumericInput(mInput.value, 1), 10), 1, 10);
    const targetPercent = clamp(parseNumericInput(targetInput.value, 90), 1, 99);

    // 値の整形と反映
    nInput.value = n;
    pInput.value = pPercent;
    mInput.value = m;
    targetInput.value = targetPercent;

    document.getElementById("num_trials_slider").value = n;
    document.getElementById("drop_rate_slider").value = pPercent;
    document.getElementById("desired_count_slider").value = m;
    document.getElementById("target_prob_slider").value = targetPercent;

    const p = pPercent / 100;
    const targetProbDecimal = targetPercent / 100;

    document.getElementById("num_trials_text").innerText = `${n}回`;
    document.getElementById("drop_rate_text").innerText = `${pPercent}%`;
    document.getElementById("desired_count_text").innerText = `${m}個`;

    const atLeastMProb = atLeastMHitsProbability(p, n, m);
    const atLeastOneProb = atLeastOneHitProbability(p, n);
    const trialsNeeded = requiredTrialsForProbability(p, targetProbDecimal);

    document.getElementById("result_display").textContent = formatPercent(atLeastMProb);
    document.getElementById("at_least_one").textContent = formatPercent(atLeastOneProb);
    document.getElementById("required_trials").textContent = `${trialsNeeded} 回`;

    for (let i = 0; i <= 5; i++) {
        const probValue = binomialProbability(n, i, p);
        document.getElementById(`prob_${i}`).textContent = formatPercent(probValue);
    }
}

function setUpIncrementDecrement({ inputId, sliderId, min, max, step = 1 }) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    const incrementButton = document.getElementById(`${inputId.split("_")[0]}_increment`);
    const decrementButton = document.getElementById(`${inputId.split("_")[0]}_decrement`);

    incrementButton.addEventListener("click", () => {
        const current = parseNumericInput(input.value, min);
        const updated = clamp(current + step, min, max);
        input.value = updated;
        slider.value = updated;
        calculateProbabilities();
    });

    decrementButton.addEventListener("click", () => {
        const current = parseNumericInput(input.value, min);
        const updated = clamp(current - step, min, max);
        input.value = updated;
        slider.value = updated;
        calculateProbabilities();
    });

    input.addEventListener("input", () => calculateProbabilities());
    input.addEventListener("blur", () => calculateProbabilities());
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            calculateProbabilities();
        }
    });

    slider.addEventListener("input", (event) => {
        const sliderValue = parseNumericInput(event.target.value, min);
        input.value = clamp(sliderValue, min, max);
        calculateProbabilities();
    });
}

function initializeControls() {
    setUpIncrementDecrement({ inputId: "desired_count", sliderId: "desired_count_slider", min: 1, max: 10, step: 1 });
    setUpIncrementDecrement({ inputId: "num_trials_value", sliderId: "num_trials_slider", min: 1, max: 1000, step: 1 });
    setUpIncrementDecrement({ inputId: "drop_rate_value", sliderId: "drop_rate_slider", min: 0.1, max: 100, step: 1 });
    setUpIncrementDecrement({ inputId: "target_prob_value", sliderId: "target_prob_slider", min: 1, max: 99, step: 1 });
}

window.addEventListener("DOMContentLoaded", () => {
    initializeControls();
    calculateProbabilities();
});

