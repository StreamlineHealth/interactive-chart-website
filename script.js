(function () {
    class MRISurveyDashboardPlugin {
        constructor(options = {}) {
            this.storageKey = options.storageKey || 'mriSurveyResponses';
            this.mountId = options.mountId || 'mri-dashboard-plugin-root';
            this.responses = [];
        }

        init() {
            const mountNode = document.getElementById(this.mountId);
            if (!mountNode) return;

            mountNode.innerHTML = this.template();
            this.cacheElements(mountNode);
            this.responses = this.loadResponses();
            this.bindEvents();
            this.resetSurvey();
            this.renderDashboard();
        }

        template() {
            return `
                <section class="plugin-shell">
                    <section class="card survey-card">
                        <h3>Patient Survey</h3>
                        <p class="helper">Rate each item from 1 (Very Dissatisfied) to 5 (Very Satisfied).</p>

                        <label for="checkin">Check-in Experience: <span id="checkin-value">3</span></label>
                        <input type="range" id="checkin" min="1" max="5" step="1" value="3">

                        <label for="waitTime">Wait Time: <span id="waitTime-value">3</span></label>
                        <input type="range" id="waitTime" min="1" max="5" step="1" value="3">

                        <label for="staffCourtesy">Staff Courtesy: <span id="staffCourtesy-value">3</span></label>
                        <input type="range" id="staffCourtesy" min="1" max="5" step="1" value="3">

                        <label for="communication">MRI Procedure Explanation: <span id="communication-value">3</span></label>
                        <input type="range" id="communication" min="1" max="5" step="1" value="3">

                        <label for="comfort">Comfort During Scan: <span id="comfort-value">3</span></label>
                        <input type="range" id="comfort" min="1" max="5" step="1" value="3">

                        <div class="actions">
                            <button id="submitSurvey">Submit Survey</button>
                            <button id="resetSurvey" class="secondary">Reset</button>
                        </div>
                        <p id="submitMessage" aria-live="polite"></p>
                    </section>

                    <section class="card dashboard-card">
                        <h3>Live Satisfaction Dashboard</h3>
                        <div class="stats-grid">
                            <div class="stat"><p>Total Surveys</p><strong id="surveyCount">0</strong></div>
                            <div class="stat"><p>Overall Average</p><strong id="overallAverage">0.0</strong></div>
                        </div>

                        <div class="chart-grid">
                            <div class="chart-container"><h4>Question Averages</h4><canvas id="avgByQuestionChart"></canvas></div>
                            <div class="chart-container"><h4>Response Distribution</h4><canvas id="distributionChart"></canvas></div>
                        </div>

                        <div class="table-wrap">
                            <h4>Recent Submissions</h4>
                            <table>
                                <thead>
                                    <tr><th>Time</th><th>Check-in</th><th>Wait</th><th>Courtesy</th><th>Explanation</th><th>Comfort</th><th>Avg</th></tr>
                                </thead>
                                <tbody id="recentSubmissions"></tbody>
                            </table>
                        </div>
                    </section>
                </section>
            `;
        }

        cacheElements(root) {
            this.sliders = {
                checkin: root.querySelector('#checkin'),
                waitTime: root.querySelector('#waitTime'),
                staffCourtesy: root.querySelector('#staffCourtesy'),
                communication: root.querySelector('#communication'),
                comfort: root.querySelector('#comfort')
            };

            this.valueDisplays = {
                checkin: root.querySelector('#checkin-value'),
                waitTime: root.querySelector('#waitTime-value'),
                staffCourtesy: root.querySelector('#staffCourtesy-value'),
                communication: root.querySelector('#communication-value'),
                comfort: root.querySelector('#comfort-value')
            };

            this.surveyCountDisplay = root.querySelector('#surveyCount');
            this.overallAverageDisplay = root.querySelector('#overallAverage');
            this.recentSubmissionsBody = root.querySelector('#recentSubmissions');
            this.submitMessage = root.querySelector('#submitMessage');
            this.submitButton = root.querySelector('#submitSurvey');
            this.resetButton = root.querySelector('#resetSurvey');

            const avgCtx = root.querySelector('#avgByQuestionChart').getContext('2d');
            const distributionCtx = root.querySelector('#distributionChart').getContext('2d');

            this.avgByQuestionChart = new Chart(avgCtx, {
                type: 'bar',
                data: {
                    labels: ['Check-in', 'Wait Time', 'Courtesy', 'Explanation', 'Comfort'],
                    datasets: [{ label: 'Average Score', data: [0, 0, 0, 0, 0], backgroundColor: '#3b82f6' }]
                },
                options: { scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } } }
            });

            this.distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5'],
                    datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'] }]
                }
            });
        }

        bindEvents() {
            Object.values(this.sliders).forEach((slider) => {
                slider.addEventListener('input', () => {
                    this.valueDisplays[slider.id].textContent = slider.value;
                });
            });

            this.submitButton.addEventListener('click', () => {
                const answers = this.getCurrentSurvey();
                this.responses.push({ timestamp: new Date().toISOString(), answers });
                this.saveResponses();
                this.renderDashboard();
                this.submitMessage.textContent = 'Survey submitted and added to the central dashboard dataset.';
                this.resetSurvey();
            });

            this.resetButton.addEventListener('click', () => this.resetSurvey());
        }

        loadResponses() {
            try {
                const stored = JSON.parse(localStorage.getItem(this.storageKey));
                return Array.isArray(stored) ? stored : [];
            } catch (error) {
                return [];
            }
        }

        saveResponses() {
            localStorage.setItem(this.storageKey, JSON.stringify(this.responses));
        }

        getCurrentSurvey() {
            return Object.fromEntries(Object.entries(this.sliders).map(([key, slider]) => [key, Number(slider.value)]));
        }

        calculateAverage(record) {
            const values = Object.values(record);
            return values.reduce((sum, value) => sum + value, 0) / values.length;
        }

        resetSurvey() {
            Object.values(this.sliders).forEach((slider) => {
                slider.value = 3;
                this.valueDisplays[slider.id].textContent = '3';
            });
        }

        aggregateData() {
            if (!this.responses.length) {
                return { count: 0, overallAverage: 0, questionAverages: [0, 0, 0, 0, 0], distribution: [0, 0, 0, 0, 0] };
            }

            const totals = { checkin: 0, waitTime: 0, staffCourtesy: 0, communication: 0, comfort: 0 };
            const distribution = [0, 0, 0, 0, 0];

            this.responses.forEach((entry) => {
                Object.keys(totals).forEach((key) => {
                    totals[key] += entry.answers[key];
                    distribution[entry.answers[key] - 1] += 1;
                });
            });

            const count = this.responses.length;
            const questionAverages = Object.values(totals).map((total) => Number((total / count).toFixed(2)));
            const overallAverage = questionAverages.reduce((sum, score) => sum + score, 0) / questionAverages.length;
            return { count, overallAverage, questionAverages, distribution };
        }

        renderRecentSubmissions() {
            this.recentSubmissionsBody.innerHTML = '';
            this.responses.slice(-10).reverse().forEach((entry) => {
                const a = entry.answers;
                const row = document.createElement('tr');
                row.innerHTML = `<td>${new Date(entry.timestamp).toLocaleString()}</td><td>${a.checkin}</td><td>${a.waitTime}</td><td>${a.staffCourtesy}</td><td>${a.communication}</td><td>${a.comfort}</td><td>${this.calculateAverage(a).toFixed(1)}</td>`;
                this.recentSubmissionsBody.appendChild(row);
            });
        }

        renderDashboard() {
            const data = this.aggregateData();
            this.surveyCountDisplay.textContent = data.count;
            this.overallAverageDisplay.textContent = data.overallAverage.toFixed(2);
            this.avgByQuestionChart.data.datasets[0].data = data.questionAverages;
            this.avgByQuestionChart.update();
            this.distributionChart.data.datasets[0].data = data.distribution;
            this.distributionChart.update();
            this.renderRecentSubmissions();
        }
    }

    window.MRISurveyDashboardPlugin = MRISurveyDashboardPlugin;

    const demoPlugin = new MRISurveyDashboardPlugin();
    demoPlugin.init();
})();
