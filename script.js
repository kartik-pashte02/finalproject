const ctx = document.getElementById('myChart');
let myChart;

let chartData = {
    labels: [],
    data: [],
};

function updateChart() {
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Electricity consumed each month',
                data: chartData.data,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function addBill() {
    // Get form values
    const currentBill = parseFloat(document.getElementById('currentBill').value);
    const billDate = document.getElementById('billDate').value;
    
    // Get the most recent bill from localStorage
    let recentBill = 0;
    const storedData = JSON.parse(localStorage.getItem('electricityData'));
    if (storedData && storedData.length > 0) {
        recentBill = storedData[storedData.length - 1].currentBill;
    }
    
    // Calculate consumed
    const consumed = currentBill - recentBill;
    
    // Store data in localStorage
    let newData = {
        date: billDate,
        currentBill: currentBill,
        consumed: consumed
    };

    let storedArray = JSON.parse(localStorage.getItem('electricityData')) || [];
    storedArray.push(newData);
    localStorage.setItem('electricityData', JSON.stringify(storedArray));

    // Update chart data
    chartData.labels.push(billDate);
    chartData.data.push(consumed);

    // Update chart
    updateChart();

    // Create new row in the table
    const table = document.getElementById('billTableBody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${billDate}</td>
        <td>${currentBill}</td>
        <td>${consumed}</td>
        <td><button class="btn btn-danger" onclick="removeRow(this)">x</button></td>
    `;
    
    // Clear form inputs
    document.getElementById('currentBill').value = '';
    document.getElementById('billDate').value = '';
}

function removeRow(button) {
    const row = button.closest('tr');
    const index = row.rowIndex;
    row.remove();

    // Update chart data after removing row
    chartData.labels.splice(index - 1, 1);
    chartData.data.splice(index - 1, 1);
    updateChart();

    // Update localStorage after removing row
    let storedArray = JSON.parse(localStorage.getItem('electricityData'));
    storedArray.splice(index - 1, 1);
    localStorage.setItem('electricityData', JSON.stringify(storedArray));
}

// Load data from localStorage and update chart on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedData = JSON.parse(localStorage.getItem('electricityData'));
    if (storedData && storedData.length > 0) {
        chartData.labels = storedData.map(item => item.date);
        chartData.data = storedData.map(item => item.consumed);
        updateChart();

        // Populate table with existing data
        const table = document.getElementById('billTableBody');
        storedData.forEach(item => {
            const newRow = table.insertRow();
            newRow.innerHTML = `
                <td>${item.date}</td>
                <td>${item.currentBill}</td>
                <td>${item.consumed}</td>
                <td><button class="btn btn-danger" onclick="removeRow(this)">x</button></td>
            `;
        });
    }
});