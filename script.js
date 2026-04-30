const STORAGE_KEY = 'mriSurveyResponses';

const sliders = {
    checkin: document.getElementById('checkin'),
    waitTime: document.getElementById('waitTime'),
    staffCourtesy: document.getElementById('staffCourtesy'),
    communication: document.getElementById('communication'),
    comfort: document.getElementById('comfort')
};

const valueDisplays = {
    checkin: document.getElementById('checkin-value'),
    waitTime: document.getElementById('waitTime-value'),
    staffCourtesy: document.getElementById('staffCourtesy-value'),
    communication: document.getElementById('communication-value'),
    comfort: document.getElementById('comfort-value')
};

const surveyCountDisplay = document.getElementById('surveyCount');
const overallAverageDisplay = document.getElementById('overallAverage');
const recentSubmissionsBody = document.getElementById('recentSubmissions');
const submitMessage = document.getElementById('submitMessage');

const avgCtx = document.getElementById('avgByQuestionChart').getContext('2d');
const distributionCtx = document.getElementById('distributionChart').getContext('2d');

let responses = loadResponses();

const avgByQuestionChart = new Chart(avgCtx, {
    type: 'bar',
    data: {
        labels: ['Check-in', 'Wait Time', 'Courtesy', 'Explanation', 'Comfort'],
        datasets: [{
            label: 'Average Score',
            data: [0, 0, 0, 0, 0],
            backgroundColor: '#3b82f6'
        }]
    },
    options: {
        scales: {
            y: { min: 0, max: 5, ticks: { stepSize: 1 } }
        }
    }
});

const distributionChart = new Chart(distributionCtx, {
    type: 'doughnut',
    data: {
        labels: ['Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5'],
        datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
        }]
    }
});

function loadResponses() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
}

function saveResponses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function getCurrentSurvey() {
    return Object.fromEntries(
        Object.entries(sliders).map(([key, slider]) => [key, Number(slider.value)])
    );
}

function calculateAverage(record) {
    const values = Object.values(record);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function resetSurvey() {
    Object.values(sliders).forEach((slider) => {
        slider.value = 3;
        valueDisplays[slider.id].textContent = 3;
    });
    submitMessage.textContent = '';
}

function aggregateData() {
    if (!responses.length) {
        return {
            count: 0,
            overallAverage: 0,
            questionAverages: [0, 0, 0, 0, 0],
            distribution: [0, 0, 0, 0, 0]
        };
    }

    const totals = { checkin: 0, waitTime: 0, staffCourtesy: 0, communication: 0, comfort: 0 };
    const distribution = [0, 0, 0, 0, 0];

    responses.forEach((entry) => {
        const answers = entry.answers;
        Object.keys(totals).forEach((key) => {
            totals[key] += answers[key];
            distribution[answers[key] - 1] += 1;
        });
    });

    const count = responses.length;
    const questionAverages = Object.values(totals).map((total) => Number((total / count).toFixed(2)));
    const overallAverage = questionAverages.reduce((sum, score) => sum + score, 0) / questionAverages.length;

    return { count, overallAverage, questionAverages, distribution };
}

function renderRecentSubmissions() {
    recentSubmissionsBody.innerHTML = '';

    responses
        .slice(-10)
        .reverse()
        .forEach((entry) => {
            const row = document.createElement('tr');
            const { answers } = entry;
            const rowAverage = calculateAverage(answers).toFixed(1);

            row.innerHTML = `
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${answers.checkin}</td>
                <td>${answers.waitTime}</td>
                <td>${answers.staffCourtesy}</td>
                <td>${answers.communication}</td>
                <td>${answers.comfort}</td>
                <td>${rowAverage}</td>
            `;
            recentSubmissionsBody.appendChild(row);
        });
}

function renderDashboard() {
    const data = aggregateData();

    surveyCountDisplay.textContent = data.count;
    overallAverageDisplay.textContent = data.overallAverage.toFixed(2);

    avgByQuestionChart.data.datasets[0].data = data.questionAverages;
    avgByQuestionChart.update();

    distributionChart.data.datasets[0].data = data.distribution;
    distributionChart.update();

    renderRecentSubmissions();
}

Object.values(sliders).forEach((slider) => {
    slider.addEventListener('input', () => {
        valueDisplays[slider.id].textContent = slider.value;
    });
});

document.getElementById('submitSurvey').addEventListener('click', () => {
    const answers = getCurrentSurvey();

    responses.push({
        timestamp: new Date().toISOString(),
        answers
    });

    saveResponses();
    renderDashboard();
    submitMessage.textContent = 'Survey submitted and added to the central dashboard dataset.';
    resetSurvey();
});

document.getElementById('resetSurvey').addEventListener('click', resetSurvey);

resetSurvey();
renderDashboard();
