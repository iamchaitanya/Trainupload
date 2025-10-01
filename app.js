document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inspection-form');
    const saveButton = document.getElementById('save-button');
    const buttonText = saveButton.querySelector('.button-text');
    const recordsList = document.getElementById('records-list');
    const dayStatusGroup = document.getElementById('day-status-group');
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    const inspectionFieldsContainer = document.getElementById('inspection-fields-container');
    const branchNameInput = document.getElementById('branch-name');
    const dpCodeInput = document.getElementById('dp-code');
    const inspectionTypeInput = document.getElementById('inspection-type');
    const otherInspectionTypeContainer = document.getElementById('other-inspection-type-container');
    const otherInspectionTypeInput = document.getElementById('other-inspection-type');
    const downloadExcelButton = document.getElementById('download-excel');
    const downloadPdfButton = document.getElementById('download-pdf');
    const downloadMonthSelect = document.getElementById('download-month-select');
    const notification = document.getElementById('notification');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formFields = [
        'branch-name', 'dp-code', 'inspection-type', 'other-inspection-type',
        'onward-from', 'onward-to', 'onward-start-time', 'onward-arrived-time', 'onward-ticket-amount',
        'return-from', 'return-to', 'return-start-time', 'return-arrived-time', 'return-ticket-amount',
        'halting-amount', 'lodging-amount'
    ];

    function populateYears() {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }

    function populateMonths() {
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }

    function populateDays() {
        const year = yearSelect.value;
        const month = monthSelect.value;
        const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
        const selectedDay = daySelect.value;

        daySelect.innerHTML = '';

        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }

        if (selectedDay && selectedDay <= daysInMonth) {
            daySelect.value = selectedDay;
        }
    }

    function initializeDatePicker() {
        populateYears();
        populateMonths();
        const today = new Date();
        yearSelect.value = today.getFullYear();
        monthSelect.value = today.getMonth();
        populateDays();
        daySelect.value = today.getDate();

        yearSelect.addEventListener('change', populateDays);
        monthSelect.addEventListener('change', populateDays);
    }

    function showNotification(message, isError = true) {
        notification.textContent = message;
        notification.style.backgroundColor = isError ? '#dc3545' : '#28a745';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    function handleDayStatusChange() {
        clearErrors();
        const selectedStatus = document.querySelector('input[name="day-status"]:checked').value;
        if (selectedStatus === 'holiday' || selectedStatus === 'leave') {
            inspectionFieldsContainer.style.display = 'none';
        } else {
            inspectionFieldsContainer.style.display = 'block';
        }
    }

    inspectionTypeInput.addEventListener('change', () => {
        if (inspectionTypeInput.value === 'Others') {
            otherInspectionTypeContainer.style.display = 'block';
        } else {
            otherInspectionTypeContainer.style.display = 'none';
        }
    });

    dayStatusGroup.addEventListener('change', handleDayStatusChange);

    [branchNameInput, inspectionTypeInput, otherInspectionTypeInput].forEach(input => {
        input.addEventListener('input', () => {
            if(input.value) input.classList.remove('error');
        });
    });

    function getRecords() {
        const recordsJSON = localStorage.getItem('inspectionRecords');
        if (!recordsJSON) return {};
        try {
            const records = JSON.parse(recordsJSON);
            return typeof records === 'object' && records !== null && !Array.isArray(records) ? records : {};
        } catch (e) {
            console.error("Error parsing inspectionRecords:", e);
            localStorage.removeItem('inspectionRecords');
            return {};
        }
    }

    function loadAndDisplayRecords() {
        recordsList.innerHTML = '';
        downloadMonthSelect.innerHTML = '<option value="all">All Months</option>'; // Reset
        const records = getRecords();
        const sortedIds = Object.keys(records).sort((a, b) => new Date(records[b].date) - new Date(records[a].date));

        if (sortedIds.length === 0) {
            const noRecordsRow = document.createElement('tr');
            noRecordsRow.innerHTML = '<td colspan="6" style="text-align: center;">No records saved yet.</td>';
            recordsList.appendChild(noRecordsRow);
            return;
        }

        const groupedRecords = {};
        sortedIds.forEach(id => {
            const record = records[id];
            const recordDate = new Date(record.date + 'T00:00:00');
            const monthYear = recordDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groupedRecords[monthYear]) {
                groupedRecords[monthYear] = [];
            }
            groupedRecords[monthYear].push({ ...record, id });
        });

        const sortedMonthYears = Object.keys(groupedRecords).sort((a, b) => {
            const dateA = new Date(groupedRecords[a][0].date + 'T00:00:00');
            const dateB = new Date(groupedRecords[b][0].date + 'T00:00:00');
            return dateB - dateA;
        });

        sortedMonthYears.forEach(monthYear => {
            const option = document.createElement('option');
            option.value = monthYear;
            option.textContent = monthYear;
            downloadMonthSelect.appendChild(option);

            const monthHeaderRow = document.createElement('tr');
            monthHeaderRow.className = 'month-header';
            monthHeaderRow.innerHTML = `<td colspan="6">${monthYear}</td>`;
            recordsList.appendChild(monthHeaderRow);

            const monthRecords = groupedRecords[monthYear];
            monthRecords.forEach(recordWithId => {
                createRecordRow(recordWithId, recordWithId.id);
            });
        });
    }

    function saveRecord(event) {
        event.preventDefault();
        clearErrors();
        if (saveButton.classList.contains('saved')) return;
        
        const dayStatus = document.querySelector('input[name="day-status"]:checked').value;
        const year = yearSelect.value;
        const month = (parseInt(monthSelect.value) + 1).toString().padStart(2, '0');
        const day = parseInt(daySelect.value).toString().padStart(2, '0');
        const selectedDate = `${year}-${month}-${day}`;

        const records = getRecords();
        const dateExists = Object.values(records).some(record => record.date === selectedDate);
        if (dateExists) {
            showNotification('An entry for this date already exists. You can only have one entry per day.');
            return;
        }

        let isValid = true;

        const newRecord = { dayStatus: dayStatus, date: selectedDate };

        if (newRecord.dayStatus === 'inspection') {
            if (!branchNameInput.value) {
                branchNameInput.classList.add('error');
                isValid = false;
            }
            if (!inspectionTypeInput.value) {
                inspectionTypeInput.classList.add('error');
                isValid = false;
            }
            if (inspectionTypeInput.value === 'Others' && !otherInspectionTypeInput.value) {
                otherInspectionTypeInput.classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                showNotification('Please fill in all mandatory fields.');
                return;
            }

            formFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    newRecord[field] = element.value || 'Nil';
                }
            });
        } else {
            if (!isValid) return;
        }

        const recordId = `record_${Date.now()}`;
        records[recordId] = newRecord;
        localStorage.setItem('inspectionRecords', JSON.stringify(records));

        loadAndDisplayRecords();
        
        // Increment date for the next entry
        const currentDate = new Date(year, monthSelect.value, day);
        currentDate.setDate(currentDate.getDate() + 1);

        yearSelect.value = currentDate.getFullYear();
        monthSelect.value = currentDate.getMonth();
        populateDays();
        daySelect.value = currentDate.getDate();
        
        showNotification('Record saved successfully. Date advanced to the next day.', false);

        saveButton.classList.add('saved');
        buttonText.textContent = 'Saved!';
        setTimeout(() => {
            saveButton.classList.remove('saved');
            buttonText.textContent = 'Save';
        }, 2000);
    }

    function createRecordRow(record, id) {
        const row = document.createElement('tr');
        row.className = record.dayStatus;
        row.dataset.id = id;

        let statusText, branchName, inspectionType;
        if (record.dayStatus === 'inspection') {
            statusText = 'Inspection';
            branchName = record['branch-name'] || 'N/A';
            if (record['inspection-type'] === 'Others') {
                inspectionType = record['other-inspection-type'] || 'N/A';
            } else {
                inspectionType = record['inspection-type'] || 'N/A';
            }
        } else {
            statusText = record.dayStatus === 'holiday' ? 'Holiday' : 'Leave';
            branchName = '-';
            dpCode = '-';
            inspectionType = '-';
        }

        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${statusText}</td>
            <td>${branchName}</td>
            <td>${dpCode}</td>
            <td>${inspectionType}</td>
            <td><button class="delete-button">&#128465;</button></td>
        `;

        row.querySelector('.delete-button').onclick = () => deleteRecord(id);
        recordsList.appendChild(row);
    }

    function deleteRecord(id) {
        let records = getRecords();
        delete records[id];
        localStorage.setItem('inspectionRecords', JSON.stringify(records));
        loadAndDisplayRecords();
    }

    function getFullRecords(monthFilter = 'all') {
        const records = getRecords();
        let recordValues = Object.values(records);

        if (monthFilter !== 'all') {
            recordValues = recordValues.filter(record => {
                const recordDate = new Date(record.date + 'T00:00:00');
                const monthYear = recordDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                return monthYear === monthFilter;
            });
        }

        return recordValues.map(record => {
            const fullRecord = {
                'Date': formatDate(record.date),
                'Status': record.dayStatus === 'inspection' ? 'Inspection' : (record.dayStatus === 'holiday' ? 'Holiday' : 'Leave'),
            };

            if (record.dayStatus === 'inspection') {
                let inspectionType = record['inspection-type'];
                if (inspectionType === 'Others') {
                    inspectionType = record['other-inspection-type'] || 'N/A';
                }

                return {
                    ...fullRecord,
                    'Branch Name': record['branch-name'] || 'N/A',
                    'DP Code': record['dp-code'] || 'N/A',
                    'Inspection Type': inspectionType,
                    'Onward From': record['onward-from'] || 'N/A',
                    'Onward To': record['onward-to'] || 'N/A',
                    'Onward Start Time': record['onward-start-time'] || 'N/A',
                    'Onward Arrived Time': record['onward-arrived-time'] || 'N/A',
                    'Onward Ticket Amount': record['onward-ticket-amount'] || 'N/A',
                    'Return From': record['return-from'] || 'N/A',
                    'Return To': record['return-to'] || 'N/A',
                    'Return Start Time': record['return-start-time'] || 'N/A',
                    'Return Arrived Time': record['return-arrived-time'] || 'N/A',
                    'Return Ticket Amount': record['return-ticket-amount'] || 'N/A',
                    'Halting Amount': record['halting-amount'] || 'N/A',
                    'Lodging Amount': record['lodging-amount'] || 'N/A',
                };
            } else {
                return fullRecord;
            }
        });
    }

    function downloadExcel() {
        const selectedMonth = downloadMonthSelect.value;
        const records = getFullRecords(selectedMonth);
        const worksheet = XLSX.utils.json_to_sheet(records);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inspection Records");
        const fileName = `inspection_records_${selectedMonth.replace(' ', '_')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    function downloadPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        const selectedMonth = downloadMonthSelect.value;
        const records = getFullRecords(selectedMonth);

        if (records.length === 0) {
            doc.text("No records to display for the selected month.", 14, 15);
            doc.save("inspection_records.pdf");
            return;
        }

        const tableColumn = [
            'Date', 'Status', 'Branch Name', 'DP Code', 'Inspection Type',
            'Onward From', 'Onward To', 'Onward Start Time', 'Onward Arrived Time', 'Onward Ticket Amount',
            'Return From', 'Return To', 'Return Start Time', 'Return Arrived Time', 'Return Ticket Amount',
            'Halting Amount', 'Lodging Amount' 
        ];

        const tableRows = records.map(record => {
            return tableColumn.map(header => record[header] || 'N/A');
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 7 },
            headStyles: { fontSize: 7 },
        });
        
        const fileName = `inspection_records_${selectedMonth.replace(' ', '_')}.pdf`;
        doc.save(fileName);
    }

    downloadExcelButton.addEventListener('click', downloadExcel);
    downloadPdfButton.addEventListener('click', downloadPdf);

    initializeDatePicker();
    loadAndDisplayRecords();
    form.addEventListener('submit', saveRecord);
    handleDayStatusChange(); 
});
