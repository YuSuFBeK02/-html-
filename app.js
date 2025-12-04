// Model parameters
const MODEL = {
    mu_0: 1550,      // Па·с^n
    b: 0.0146,       // 1/°C
    T_0: 180,        // °C
    n: 0.395         // безразмерный
};

// Default values
const DEFAULTS = {
    temperature: 180,
    shearRate: 40
};

// DOM elements
const temperatureSlider = document.getElementById('temperature');
const shearRateSlider = document.getElementById('shearRate');
const tempValue = document.getElementById('tempValue');
const shearValue = document.getElementById('shearValue');
const viscosityResult = document.getElementById('viscosityResult');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const tableBody = document.getElementById('tableBody');

// Chart objects
let tempChart = null;
let shearChart = null;
let heatmapChart = null;

// Calculate viscosity using the mathematical model
function calculateViscosity(T, gamma) {
    const expTerm = Math.exp(-MODEL.b * (T - MODEL.T_0));
    const powerTerm = Math.pow(gamma, MODEL.n - 1);
    const eta = MODEL.mu_0 * expTerm * powerTerm;
    return eta;
}

// Update displayed values
function updateValues() {
    const T = parseFloat(temperatureSlider.value);
    const gamma = parseFloat(shearRateSlider.value);
    
    tempValue.textContent = T;
    shearValue.textContent = gamma;
    
    const viscosity = calculateViscosity(T, gamma);
    viscosityResult.textContent = viscosity.toFixed(2);
    
    updateTable(T, gamma);
    updateCharts(T, gamma);
}

// Update results table
function updateTable(currentT, currentGamma) {
    tableBody.innerHTML = '';
    
    // Generate table data around current values
    const temperatures = [currentT - 10, currentT - 5, currentT, currentT + 5, currentT + 10].filter(t => t >= 175 && t <= 205);
    const shearRates = [currentGamma - 10, currentGamma - 5, currentGamma, currentGamma + 5, currentGamma + 10].filter(g => g >= 30 && g <= 60);
    
    // Calculate min and max viscosity for color coding
    let minViscosity = Infinity;
    let maxViscosity = -Infinity;
    
    const tableData = [];
    temperatures.forEach(T => {
        shearRates.forEach(gamma => {
            const viscosity = calculateViscosity(T, gamma);
            tableData.push({ T, gamma, viscosity });
            minViscosity = Math.min(minViscosity, viscosity);
            maxViscosity = Math.max(maxViscosity, viscosity);
        });
    });
    
    // Create table rows
    tableData.forEach(data => {
        const row = document.createElement('tr');
        
        const tempCell = document.createElement('td');
        tempCell.textContent = data.T.toFixed(1);
        row.appendChild(tempCell);
        
        const shearCell = document.createElement('td');
        shearCell.textContent = data.gamma.toFixed(1);
        row.appendChild(shearCell);
        
        const viscosityCell = document.createElement('td');
        viscosityCell.textContent = data.viscosity.toFixed(2);
        viscosityCell.classList.add('viscosity-cell');
        
        // Color code based on viscosity value
        const normalizedViscosity = (data.viscosity - minViscosity) / (maxViscosity - minViscosity);
        if (normalizedViscosity > 0.8) {
            viscosityCell.classList.add('viscosity-high');
        } else if (normalizedViscosity > 0.6) {
            viscosityCell.classList.add('viscosity-medium-high');
        } else if (normalizedViscosity > 0.4) {
            viscosityCell.classList.add('viscosity-medium');
        } else if (normalizedViscosity > 0.2) {
            viscosityCell.classList.add('viscosity-medium-low');
        } else {
            viscosityCell.classList.add('viscosity-low');
        }
        
        row.appendChild(viscosityCell);
        tableBody.appendChild(row);
    });
}

// Initialize temperature chart
function initTempChart() {
    const ctx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Вязкость (Па·с)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4
            }, {
                label: 'Текущее значение',
                data: [],
                borderColor: '#e74c3c',
                backgroundColor: '#e74c3c',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Температура (°C)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Вязкость (Па·с)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Initialize shear rate chart
function initShearChart() {
    const ctx = document.getElementById('shearChart').getContext('2d');
    shearChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Вязкость (Па·с)',
                data: [],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4
            }, {
                label: 'Текущее значение',
                data: [],
                borderColor: '#e74c3c',
                backgroundColor: '#e74c3c',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Скорость деформации (1/с)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Вязкость (Па·с)',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Initialize heatmap chart
function initHeatmapChart() {
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    heatmapChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Вязкость',
                data: [],
                backgroundColor: []
            }, {
                label: 'Текущее положение',
                data: [],
                backgroundColor: '#e74c3c',
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = context.raw;
                            return `T: ${data.x}°C, γ: ${data.y} 1/с, η: ${data.v.toFixed(2)} Па·с`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Температура (°C)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 175,
                    max: 205,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Скорость деформации (1/с)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 30,
                    max: 60,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Update all charts
function updateCharts(currentT, currentGamma) {
    updateTempChart(currentT, currentGamma);
    updateShearChart(currentT, currentGamma);
    updateHeatmapChart(currentT, currentGamma);
}

// Update temperature chart
function updateTempChart(currentT, currentGamma) {
    const temperatures = [];
    const viscosities = [];
    
    for (let T = 175; T <= 205; T += 2) {
        temperatures.push(T);
        viscosities.push(calculateViscosity(T, currentGamma));
    }
    
    tempChart.data.labels = temperatures;
    tempChart.data.datasets[0].data = viscosities;
    
    // Current point
    const currentIndex = temperatures.findIndex(t => t >= currentT);
    const currentViscosity = calculateViscosity(currentT, currentGamma);
    tempChart.data.datasets[1].data = Array(temperatures.length).fill(null);
    if (currentIndex >= 0) {
        tempChart.data.datasets[1].data[currentIndex] = currentViscosity;
    }
    
    tempChart.update('none');
}

// Update shear rate chart
function updateShearChart(currentT, currentGamma) {
    const shearRates = [];
    const viscosities = [];
    
    for (let gamma = 30; gamma <= 60; gamma += 2) {
        shearRates.push(gamma);
        viscosities.push(calculateViscosity(currentT, gamma));
    }
    
    shearChart.data.labels = shearRates;
    shearChart.data.datasets[0].data = viscosities;
    
    // Current point
    const currentIndex = shearRates.findIndex(g => g >= currentGamma);
    const currentViscosity = calculateViscosity(currentT, currentGamma);
    shearChart.data.datasets[1].data = Array(shearRates.length).fill(null);
    if (currentIndex >= 0) {
        shearChart.data.datasets[1].data[currentIndex] = currentViscosity;
    }
    
    shearChart.update('none');
}

// Update heatmap chart
function updateHeatmapChart(currentT, currentGamma) {
    const heatmapData = [];
    const colors = [];
    
    let minViscosity = Infinity;
    let maxViscosity = -Infinity;
    
    // Calculate viscosities for grid
    const gridData = [];
    for (let T = 175; T <= 205; T += 3) {
        for (let gamma = 30; gamma <= 60; gamma += 3) {
            const viscosity = calculateViscosity(T, gamma);
            gridData.push({ x: T, y: gamma, v: viscosity });
            minViscosity = Math.min(minViscosity, viscosity);
            maxViscosity = Math.max(maxViscosity, viscosity);
        }
    }
    
    // Create bubbles with color gradient
    gridData.forEach(point => {
        const normalized = (point.v - minViscosity) / (maxViscosity - minViscosity);
        const color = getColorForValue(normalized);
        
        heatmapData.push({
            x: point.x,
            y: point.y,
            r: 15,
            v: point.v
        });
        colors.push(color);
    });
    
    heatmapChart.data.datasets[0].data = heatmapData;
    heatmapChart.data.datasets[0].backgroundColor = colors;
    
    // Current position
    const currentViscosity = calculateViscosity(currentT, currentGamma);
    heatmapChart.data.datasets[1].data = [{
        x: currentT,
        y: currentGamma,
        r: 12,
        v: currentViscosity
    }];
    
    heatmapChart.update('none');
}

// Get color for normalized value (0-1)
function getColorForValue(normalized) {
    // Blue (low) to Red (high)
    const r = Math.round(normalized * 255);
    const b = Math.round((1 - normalized) * 255);
    const g = Math.round(Math.sin(normalized * Math.PI) * 128);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

// Reset to default values
function reset() {
    temperatureSlider.value = DEFAULTS.temperature;
    shearRateSlider.value = DEFAULTS.shearRate;
    updateValues();
}

// Export data to CSV
function exportData() {
    const T = parseFloat(temperatureSlider.value);
    const gamma = parseFloat(shearRateSlider.value);
    const viscosity = calculateViscosity(T, gamma);
    
    // Generate detailed data
    let csv = 'Экспорт данных - Исследование процесса экструзии\n\n';
    csv += 'Текущие параметры:\n';
    csv += `Температура (°C),${T}\n`;
    csv += `Скорость деформации (1/с),${gamma}\n`;
    csv += `Вязкость (Па·с),${viscosity.toFixed(2)}\n\n`;
    
    csv += 'Параметры модели:\n';
    csv += `μ₀ (Па·с^n),${MODEL.mu_0}\n`;
    csv += `b (1/°C),${MODEL.b}\n`;
    csv += `T₀ (°C),${MODEL.T_0}\n`;
    csv += `n,${MODEL.n}\n\n`;
    
    csv += 'Зависимость вязкости от температуры (γ=' + gamma + '):\n';
    csv += 'T (°C),η (Па·с)\n';
    for (let temp = 175; temp <= 205; temp += 5) {
        const visc = calculateViscosity(temp, gamma);
        csv += `${temp},${visc.toFixed(2)}\n`;
    }
    
    csv += '\nЗависимость вязкости от скорости деформации (T=' + T + '):\n';
    csv += 'γ (1/с),η (Па·с)\n';
    for (let sr = 30; sr <= 60; sr += 5) {
        const visc = calculateViscosity(T, sr);
        csv += `${sr},${visc.toFixed(2)}\n`;
    }
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'extrusion_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Table sorting
let sortDirection = {};

function sortTable(columnIndex) {
    const table = document.getElementById('resultsTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Toggle sort direction
    if (!sortDirection[columnIndex]) {
        sortDirection[columnIndex] = 'asc';
    } else if (sortDirection[columnIndex] === 'asc') {
        sortDirection[columnIndex] = 'desc';
    } else {
        sortDirection[columnIndex] = 'asc';
    }
    
    const direction = sortDirection[columnIndex];
    
    rows.sort((a, b) => {
        const aValue = parseFloat(a.cells[columnIndex].textContent);
        const bValue = parseFloat(b.cells[columnIndex].textContent);
        
        if (direction === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });
    
    // Clear and re-append sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

// Event listeners
temperatureSlider.addEventListener('input', updateValues);
shearRateSlider.addEventListener('input', updateValues);
resetBtn.addEventListener('click', reset);
exportBtn.addEventListener('click', exportData);

// Initialize
window.addEventListener('load', () => {
    initTempChart();
    initShearChart();
    initHeatmapChart();
    updateValues();
});