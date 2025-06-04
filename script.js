// Get slider elements and their value displays
const sliders = {
    nutrition: document.getElementById('nutrition'),
    exercise: document.getElementById('exercise'),
    sleep: document.getElementById('sleep'),
    stress: document.getElementById('stress'),
    wellbeing: document.getElementById('wellbeing')
};

const valueDisplays = {
    nutrition: document.getElementById('nutrition-value'),
    exercise: document.getElementById('exercise-value'),
    sleep: document.getElementById('sleep-value'),
    stress: document.getElementById('stress-value'),
    wellbeing: document.getElementById('wellbeing-value')
};

// Get chart canvas and overall score display
const ctx = document.getElementById('healthChart').getContext('2d');
const overallScoreDisplay = document.getElementById('overall-score');

// Initialize gauge chart
let healthChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Health Score', 'Remaining'],
        datasets: [{
            data: [50, 50],
            backgroundColor: ['#4caf50', '#e0e0e0'],
            borderWidth: 0
        }]
    },
    options: {
        circumference: Math.PI,
        rotation: -Math.PI,
        cutout: '70%',
        tooltips: { enabled: false },
        hover: { mode: null },
        animation: {
            animateRotate: false,
            animateScale: true
        }
    }
});

// Calculate overall health score
function calculateHealthScore() {
    const total = Object.values(sliders).reduce((sum, slider) => sum + parseInt(slider.value), 0);
    return Math.round(total / 5);
}

// Update chart and score display
function updateChart() {
    const score = calculateHealthScore();
    overallScoreDisplay.textContent = score;
    healthChart.data.datasets[0].data = [score, 100 - score];
    healthChart.update();
}

// Update displays and chart on slider change
Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', () => {
        valueDisplays[slider.id].textContent = slider.value;
        updateChart();
    });
});

// Reset sliders to default
document.getElementById('reset').addEventListener('click', () => {
    Object.values(sliders).forEach(slider => {
        slider.value = 50;
        valueDisplays[slider.id].textContent = 50;
    });
    updateChart();
});

// Initial chart update
updateChart();
