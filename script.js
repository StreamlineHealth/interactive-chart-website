// Sample data for procedures, locations, workflow times (minutes), and performance ratios
const data = {
    CT: {
        'Hospital A': {
            workflow: { 'Check-In': 5, Preparation: 8, Scanning: 15, Review: 6, Reporting: 4 },
            performance: 0.82
        },
        'Hospital B': {
            workflow: { 'Check-In': 6, Preparation: 10, Scanning: 18, Review: 7, Reporting: 5 },
            performance: 0.75
        }
    },
    MRI: {
        'Hospital A': {
            workflow: { 'Check-In': 7, Preparation: 12, Scanning: 25, Review: 8, Reporting: 6 },
            performance: 0.68
        },
        'Hospital B': {
            workflow: { 'Check-In': 6, Preparation: 11, Scanning: 22, Review: 7, Reporting: 5 },
            performance: 0.7
        }
    },
    'X-Ray': {
        'Hospital A': {
            workflow: { 'Check-In': 4, Preparation: 5, Scanning: 7, Review: 3, Reporting: 2 },
            performance: 0.9
        },
        'Hospital B': {
            workflow: { 'Check-In': 5, Preparation: 6, Scanning: 8, Review: 4, Reporting: 3 },
            performance: 0.85
        }
    }
};

const procedureSelect = document.getElementById('procedure');
const locationSelect = document.getElementById('location');
const gaugeFill = document.getElementById('gauge-fill');
const gaugeText = document.getElementById('gauge-text');
const ctx = document.getElementById('workflowChart').getContext('2d');
let workflowChart;

// Populate procedure dropdown
function init() {
    Object.keys(data).forEach(proc => {
        const option = document.createElement('option');
        option.value = proc;
        option.textContent = proc;
        procedureSelect.appendChild(option);
    });
    updateLocations();
    updateDashboard();
}

// Populate location dropdown based on selected procedure
function updateLocations() {
    const procedure = procedureSelect.value;
    locationSelect.innerHTML = '';
    Object.keys(data[procedure]).forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        locationSelect.appendChild(option);
    });
}

// Update chart and gauge based on selections
function updateDashboard() {
    const procedure = procedureSelect.value;
    const location = locationSelect.value;
    const metrics = data[procedure][location];

    // Update workflow chart
    const labels = Object.keys(metrics.workflow);
    const values = Object.values(metrics.workflow);
    if (workflowChart) workflowChart.destroy();
    workflowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Minutes',
                data: values,
                backgroundColor: '#4285f4'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Update performance gauge
    const percent = Math.round(metrics.performance * 100);
    gaugeFill.style.width = percent + '%';
    gaugeText.textContent = percent + '%';
}

procedureSelect.addEventListener('change', () => {
    updateLocations();
    updateDashboard();
});

locationSelect.addEventListener('change', updateDashboard);

init();
