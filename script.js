const sliders = {
    staffing: document.getElementById('staffing'),
    compensation: document.getElementById('compensation'),
    voice: document.getElementById('voice'),
    safety: document.getElementById('safety'),
    change: document.getElementById('change'),
    manager: document.getElementById('manager')
};

const valueDisplays = {
    staffing: document.getElementById('staffing-value'),
    compensation: document.getElementById('compensation-value'),
    voice: document.getElementById('voice-value'),
    safety: document.getElementById('safety-value'),
    change: document.getElementById('change-value'),
    manager: document.getElementById('manager-value')
};

const overallScoreDisplay = document.getElementById('overall-score');
const actionList = document.getElementById('action-list');
const ctx = document.getElementById('riskChart').getContext('2d');

const recommendations = {
    staffing: [
        'Add surge staffing playbooks and float pools to protect ratios.',
        'Track premium pay, vacancy rates, and turnover weekly; publish trends to leaders.',
        'Build joint safety/quality rounds with charge nurses to surface unsafe workload quickly.'
    ],
    compensation: [
        'Run pay-equity and compression checks; publish salary bands and progression rules.',
        'Audit payroll accuracy and response times for corrections.',
        'Offer transparent total-rewards statements and invite Q&A with finance/HR.'
    ],
    voice: [
        'Stand up unit-based councils with decision rights on scheduling and quality pilots.',
        'Use “you said, we did” updates to close the loop on frontline feedback.',
        'Invite informal influencers to co-design workflow or tech changes.'
    ],
    safety: [
        'Track workplace violence incidents and follow up with de-escalation training.',
        'Validate PPE availability and fit-testing cadence; publish compliance metrics.',
        'Launch peer support/mental health resources and measure uptake.'
    ],
    change: [
        'Create change briefings with timelines, impacts, and escalation paths.',
        'Pilot major changes with two units first; share lessons learned before scaling.',
        'Publish risk mitigations for M&A or system go-lives and assign accountable owners.'
    ],
    manager: [
        'Coach leaders on timely issue follow-through with visible due dates.',
        'Shadow managers on rounds to ensure active listening and closed-loop communication.',
        'Add office hours or open-door blocks so staff can raise concerns early.'
    ]
};

const riskChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: [
            'Staffing pressure',
            'Pay & benefits',
            'Voice & respect',
            'Safety & wellbeing',
            'Change turbulence',
            'Manager responsiveness'
        ],
        datasets: [
            {
                label: 'Risk level',
                data: [3, 3, 3, 3, 3, 3],
                backgroundColor: 'rgba(227, 99, 50, 0.15)',
                borderColor: '#e36332',
                borderWidth: 2,
                pointBackgroundColor: '#e36332'
            },
            {
                label: 'Target ≤ 2',
                data: [2, 2, 2, 2, 2, 2],
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                borderColor: '#4caf50',
                borderWidth: 1,
                borderDash: [6, 6],
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            r: {
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1,
                    backdropColor: 'transparent'
                },
                grid: {
                    color: '#e1e5ea'
                },
                angleLines: {
                    color: '#e1e5ea'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.formattedValue}`
                }
            }
        }
    }
});

function calculateOverall() {
    const total = Object.values(sliders).reduce((sum, slider) => sum + Number(slider.value), 0);
    return (total / Object.keys(sliders).length).toFixed(1);
}

function renderActions() {
    const sorted = Object.entries(sliders)
        .map(([key, slider]) => ({ key, value: Number(slider.value) }))
        .sort((a, b) => b.value - a.value);

    actionList.innerHTML = '';

    sorted.forEach(({ key, value }) => {
        const isElevated = value >= 4;
        const card = document.createElement('div');
        card.className = 'action-card';

        const title = document.createElement('div');
        title.className = 'action-card__header';
        title.innerHTML = `
            <div>
                <p class="eyebrow">${value >= 4 ? 'High priority' : 'Watch'}</p>
                <h3>${sliders[key].previousElementSibling.querySelector('label').textContent}</h3>
            </div>
            <span class="chip ${isElevated ? 'chip--alert' : ''}">Score: ${value}</span>
        `;

        const list = document.createElement('ul');
        recommendations[key].forEach((item, index) => {
            if (isElevated || index === 0) {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            }
        });

        card.appendChild(title);
        card.appendChild(list);
        actionList.appendChild(card);
    });
}

function updateChart() {
    const scores = Object.values(sliders).map((slider) => Number(slider.value));
    riskChart.data.datasets[0].data = scores;
    riskChart.update();

    const overall = calculateOverall();
    overallScoreDisplay.textContent = overall;

    renderActions();
}

Object.values(sliders).forEach((slider) => {
    slider.addEventListener('input', () => {
        valueDisplays[slider.id].textContent = slider.value;
        updateChart();
    });
});

function resetAll() {
    Object.values(sliders).forEach((slider) => {
        slider.value = 3;
        valueDisplays[slider.id].textContent = '3';
    });
    updateChart();
}

document.getElementById('reset').addEventListener('click', resetAll);

renderActions();
updateChart();
