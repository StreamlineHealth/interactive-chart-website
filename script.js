const workflow = [
    {
        id: 1,
        stage: 'Ordering',
        name: 'Clinical Evaluation and MRI Request Entry',
        description: 'Ordering physician evaluates symptoms, reviews contraindications, and places MRI order in the EHR with ICD-10 code, urgency, and protocol preferences.',
        avgMinutes: 25,
        waitMinutes: 180,
        firstPassYield: 88,
        reworkRate: 12,
        owner: 'Ordering Physician'
    },
    {
        id: 2,
        stage: 'Authorization',
        name: 'Insurance Verification and Prior Authorization',
        description: 'Financial counselor validates eligibility, submits prior authorization packet, and manages payer queries until approval or peer-to-peer escalation.',
        avgMinutes: 40,
        waitMinutes: 1440,
        firstPassYield: 62,
        reworkRate: 38,
        owner: 'Authorization Team'
    },
    {
        id: 3,
        stage: 'Scheduling',
        name: 'Scheduling and Site Capacity Match',
        description: 'Scheduler matches patient preference, scanner capability, and urgency category, then books slot with protocol-specific duration buffers.',
        avgMinutes: 18,
        waitMinutes: 960,
        firstPassYield: 84,
        reworkRate: 16,
        owner: 'Central Scheduling'
    },
    {
        id: 4,
        stage: 'Patient Prep',
        name: 'Pre-Visit Safety Screening',
        description: 'Nursing staff conducts implant/sedation screening, renal function checks for contrast studies, and language access planning.',
        avgMinutes: 22,
        waitMinutes: 240,
        firstPassYield: 91,
        reworkRate: 9,
        owner: 'MRI Nurse Navigator'
    },
    {
        id: 5,
        stage: 'Patient Prep',
        name: 'Patient Arrival, Registration, and Consent',
        description: 'Front desk confirms identity, collects consent, verifies order completeness, and resolves missing signatures before technologist handoff.',
        avgMinutes: 17,
        waitMinutes: 45,
        firstPassYield: 93,
        reworkRate: 7,
        owner: 'Registration Desk'
    },
    {
        id: 6,
        stage: 'Imaging',
        name: 'Technologist Intake and Final MRI Safety Time-Out',
        description: 'Technologist verifies patient history, metal screening, pregnancy status, and contrast allergy risk using a standardized safety checklist.',
        avgMinutes: 15,
        waitMinutes: 20,
        firstPassYield: 96,
        reworkRate: 4,
        owner: 'MRI Technologist'
    },
    {
        id: 7,
        stage: 'Imaging',
        name: 'Scan Acquisition and Sequence Quality Control',
        description: 'Technologist executes MRI protocol, monitors artifacts in real-time, and repeats degraded sequences before patient leaves scanner.',
        avgMinutes: 52,
        waitMinutes: 10,
        firstPassYield: 89,
        reworkRate: 11,
        owner: 'MRI Technologist'
    },
    {
        id: 8,
        stage: 'Imaging',
        name: 'Post-Processing and PACS Transfer',
        description: 'Images are reconstructed, tagged with metadata, and transferred to PACS/RIS with exam status updates and critical finding flags.',
        avgMinutes: 14,
        waitMinutes: 35,
        firstPassYield: 94,
        reworkRate: 6,
        owner: 'Imaging Informatics'
    },
    {
        id: 9,
        stage: 'Interpretation',
        name: 'Radiologist Worklist Triage',
        description: 'Radiologist prioritizes studies by urgency, subspecialty, and turnaround SLA, assigning STAT cases for immediate interpretation.',
        avgMinutes: 12,
        waitMinutes: 120,
        firstPassYield: 97,
        reworkRate: 3,
        owner: 'Reading Radiologist'
    },
    {
        id: 10,
        stage: 'Interpretation',
        name: 'Diagnostic Interpretation and Comparison Review',
        description: 'Radiologist interprets images, compares prior studies, and dictates structured findings with recommendation pathways.',
        avgMinutes: 28,
        waitMinutes: 30,
        firstPassYield: 92,
        reworkRate: 8,
        owner: 'Reading Radiologist'
    },
    {
        id: 11,
        stage: 'Reporting',
        name: 'Report Finalization and Critical Result Escalation',
        description: 'Draft report is finalized, critical findings are communicated via closed-loop call workflow, and acknowledgement is documented.',
        avgMinutes: 16,
        waitMinutes: 25,
        firstPassYield: 95,
        reworkRate: 5,
        owner: 'Radiologist + Care Team'
    },
    {
        id: 12,
        stage: 'Reporting',
        name: 'Report Delivery to Ordering Physician',
        description: 'Final report routes to EHR inbox, notification is delivered to ordering physician, and downstream follow-up task is generated.',
        avgMinutes: 8,
        waitMinutes: 60,
        firstPassYield: 98,
        reworkRate: 2,
        owner: 'EHR Integration Layer'
    }
];

const stepsContainer = document.getElementById('workflowSteps');
const stageFilter = document.getElementById('stageFilter');
const resetButton = document.getElementById('resetSimulation');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailMetrics = document.getElementById('detailMetrics');
const totalHours = document.getElementById('totalHours');
const medianWait = document.getElementById('medianWait');
const bottleneckName = document.getElementById('bottleneckName');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');

const completion = new Set();
let activeStep = null;

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2
        ? sorted[middle]
        : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function renderWorkflow() {
    const filter = stageFilter.value;
    stepsContainer.innerHTML = '';

    workflow
        .filter(step => filter === 'all' || step.stage === filter)
        .forEach(step => {
            const button = document.createElement('button');
            button.className = 'step';
            button.dataset.stepId = step.id;
            button.innerHTML = `
                <h3>Step ${step.id}: ${step.name}</h3>
                <p class="meta">${step.stage} • Owner: ${step.owner} • Active Time: ${step.avgMinutes} min</p>
                <span class="risk">Rework Risk: ${step.reworkRate}%</span>
            `;

            if (completion.has(step.id)) {
                button.classList.add('done');
            }

            if (activeStep && activeStep.id === step.id) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => {
                activeStep = step;
                if (completion.has(step.id)) {
                    completion.delete(step.id);
                } else {
                    completion.add(step.id);
                }
                renderWorkflow();
                renderDetail(step);
                renderDashboard();
            });

            stepsContainer.appendChild(button);
        });

    totalCount.textContent = workflow.length;
}

function renderDetail(step) {
    detailTitle.textContent = `Step ${step.id}: ${step.name}`;
    detailDescription.textContent = step.description;

    const analytics = [
        `Stage: ${step.stage}`,
        `Process owner: ${step.owner}`,
        `Average active touch time: ${step.avgMinutes} minutes`,
        `Average queue/wait time: ${step.waitMinutes} minutes`,
        `First-pass yield: ${step.firstPassYield}%`,
        `Rework/escalation rate: ${step.reworkRate}%`,
        `Estimated step capacity per 8-hour shift: ${Math.floor(480 / step.avgMinutes)} cases`
    ];

    detailMetrics.innerHTML = analytics.map(item => `<li>${item}</li>`).join('');
}

function renderDashboard() {
    const totalMinutes = workflow.reduce((sum, step) => sum + step.avgMinutes + step.waitMinutes, 0);
    const waits = workflow.map(step => step.waitMinutes);
    const bottleneck = workflow.reduce((highest, step) =>
        step.waitMinutes > highest.waitMinutes ? step : highest
    );

    totalHours.textContent = (totalMinutes / 60).toFixed(1);
    medianWait.textContent = median(waits);
    bottleneckName.textContent = `Step ${bottleneck.id}: ${bottleneck.name}`;
    completedCount.textContent = completion.size;
}

stageFilter.addEventListener('change', renderWorkflow);

resetButton.addEventListener('click', () => {
    completion.clear();
    activeStep = null;
    detailTitle.textContent = 'Select a step';
    detailDescription.textContent = 'Click a node in the flowchart to inspect metrics and interventions.';
    detailMetrics.innerHTML = '';
    renderWorkflow();
    renderDashboard();
});

renderWorkflow();
renderDashboard();
