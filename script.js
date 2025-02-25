// Get slider elements and their value displays
const sliders = {
    availability: document.getElementById('availability'),
    accessibility: document.getElementById('accessibility'),
    accommodation: document.getElementById('accommodation'),
    affordability: document.getElementById('affordability'),
    acceptability: document.getElementById('acceptability')
};

const valueDisplays = {
    availability: document.getElementById('availability-value'),
    accessibility: document.getElementById('accessibility-value'),
    accommodation: document.getElementById('accommodation-value'),
    affordability: document.getElementById('affordability-value'),
    acceptability: document.getElementById('acceptability-value')
};

// Get chart canvas and overall score display
const ctx = document.getElementById('satisfactionChart').getContext('2d');
const overallScoreDisplay = document.getElementById('overall-score');

// Initialize gauge chart
let satisfactionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Satisfaction', 'Remaining'],
        datasets: [{
            data: [3, 2],
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

// Calculate overall satisfaction
function calculateSatisfaction() {
    const total = Object.values(sliders).reduce((sum, slider) => sum + parseInt(slider.value), 0);
    return (total / 5).toFixed(1);
}

// Update chart and score display
function updateChart() {
    const score = calculateSatisfaction();
    overallScoreDisplay.textContent = score;
    satisfactionChart.data.datasets[0].data = [score, 5 - score];
    satisfactionChart.update();
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
        slider.value = 3;
        valueDisplays[slider.id].textContent = 3;
    });
    updateChart();
});

// Initial chart update
updateChart();
