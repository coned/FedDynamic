// static/dashboard.js

let accuracyChart, lossChart;

window.onload = function() {
    createCharts();
    setInterval(fetchData, 1000);
};

async function fetchData() {
    try {
        const resp = await fetch("/metrics");
        if (!resp.ok) {
            console.error("Failed to fetch /metrics", resp);
            return;
        }
        const data = await resp.json();
        updateCharts(data);

        if (data.server_uptime) {
            document.getElementById("server-time").textContent =
                `Server Uptime: ${data.server_uptime}`;
        }
    } catch(err) {
        console.error(err);
    }
}


function createCharts() {
    const accuracyCtx = document.getElementById('accuracyChart').getContext('2d');
    accuracyChart = new Chart(accuracyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Global Accuracy VS. Round',
                data: [],
                borderWidth: 2,
                borderColor: 'blue',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Round' }
                },
                y: {
                    title: { display: true, text: 'Accuracy' },
                    min: 0,
                    max: 1
                }
            }
        }
    });

    const lossCtx = document.getElementById('lossChart').getContext('2d');
    lossChart = new Chart(lossCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Global Loss VS. Round',
                data: [],
                borderWidth: 2,
                borderColor: 'orange',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Round' }
                },
                y: {
                    title: { display: true, text: 'Loss' },
                    min: 0
                }
            }
        }
    });
}


function updateNodeStatus(clientStatus) {
    let html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <tr>
          <th>Client ID</th>
          <th>Status</th>
          <th>Last Active Round</th>
          <th>Missed Rounds</th>
        </tr>
    `;
    for (const clientId in clientStatus) {
        const statusObj = clientStatus[clientId];
        const isActive = statusObj.active;
        const lastRound = statusObj.last_active_round;
        const missed = statusObj.missed_rounds;

        const color = isActive ? "green" : "gray";
        const statusText = isActive ? "Online" : "Offline";

        html += `
          <tr>
            <td>${clientId}</td>
            <td style="color: ${color}; font-weight:bold;">${statusText}</td>
            <td>${lastRound}</td>
            <td>${missed}</td>
          </tr>
        `;
    }

    html += `</table>`;

    document.getElementById("node-status").innerHTML = html;
}

function updateCharts(metrics) {
    // 1) first update the node status
    if (metrics.client_status) {
        updateNodeStatus(metrics.client_status);
    }

    // 2) then the charts
    if (accuracyChart) {
        accuracyChart.data.labels = metrics.accuracy.map((_, i) => i + 1);
        accuracyChart.data.datasets[0].data = metrics.accuracy;
        accuracyChart.options.scales.y.min = Math.min(...metrics.accuracy);
        accuracyChart.update();
    }

    if (lossChart) {
        lossChart.data.labels = metrics.loss.map((_, i) => i + 1);
        lossChart.data.datasets[0].data = metrics.loss;
        lossChart.update();
    }
}