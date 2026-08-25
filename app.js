/**
 * Government School Student Attendance Portal
 * Core Application Logic, State Management and DOM Bindings
 */

// Application State
let state = {
    classes: [],
    students: [],
    attendance: {}, // Structure: { [class_name]: { [date_string]: { [student_id]: { status: 'Present'|'Absent'|'Late', remarks: '' } } } }
    theme: 'light'
};

// Configuration
const CONFIG = {
    STORAGE_KEY: 'shiksha_attendance_portal_data',
    THEME_KEY: 'shiksha_theme'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    initTheme();
    initDatePickers();
    setupEventHandlers();
    
    // Default load: Dashboard
    switchView('dashboard');
    updateDashboardStats();
    populateClassDropdowns();
});

// Load / Save Local Storage
function loadStateFromStorage() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (data) {
        try {
            state = JSON.parse(data);
            if (!state.classes || !state.students || !state.attendance) {
                throw new Error("Invalid state format");
            }
        } catch (e) {
            console.error("Error parsing storage data, seeding mock database", e);
            seedMockData();
        }
    } else {
        seedMockData();
    }
}

function saveStateToStorage() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
}

// Seeding Mock Data for Government School Demo
function seedMockData() {
    state.classes = ["Class 10-A", "Class 9-A", "Class 8-B"];
    
    const rawStudents = [
        // Class 10-A
        { name: "Aarav Sharma", roll: 101, class: "Class 10-A", gender: "Boy", mobile: "9876543210" },
        { name: "Diya Patel", roll: 102, class: "Class 10-A", gender: "Girl", mobile: "9812345678" },
        { name: "Kabir Singh", roll: 103, class: "Class 10-A", gender: "Boy", mobile: "9765432109" },
        { name: "Priya Nair", roll: 104, class: "Class 10-A", gender: "Girl", mobile: "9654321098" },
        { name: "Rohan Verma", roll: 105, class: "Class 10-A", gender: "Boy", mobile: "9543210987" },
        { name: "Aditi Joshi", roll: 106, class: "Class 10-A", gender: "Girl", mobile: "9432109876" },
        // Class 9-A
        { name: "Ishaan Gupta", roll: 901, class: "Class 9-A", gender: "Boy", mobile: "9321098765" },
        { name: "Ananya Roy", roll: 902, class: "Class 9-A", gender: "Girl", mobile: "9210987654" },
        { name: "Vihaan Joshi", roll: 903, class: "Class 9-A", gender: "Boy", mobile: "9109876543" },
        { name: "Sneha Reddy", roll: 904, class: "Class 9-A", gender: "Girl", mobile: "9098765432" },
        { name: "Arjun Rao", roll: 905, class: "Class 9-A", gender: "Boy", mobile: "8987654321" },
        // Class 8-B
        { name: "Reyansh Deshmukh", roll: 801, class: "Class 8-B", gender: "Boy", mobile: "8876543210" },
        { name: "Saisha Sen", roll: 802, class: "Class 8-B", gender: "Girl", mobile: "8765432109" },
        { name: "Dev Mukherji", roll: 803, class: "Class 8-B", gender: "Boy", mobile: "8654321098" },
        { name: "Kavya Nair", roll: 804, class: "Class 8-B", gender: "Girl", mobile: "8543210987" },
        { name: "Aryan Malhotra", roll: 805, class: "Class 8-B", gender: "Boy", mobile: "8432109876" }
    ];

    state.students = rawStudents.map((s, idx) => ({
        id: 'std_' + Date.now() + '_' + idx + Math.floor(Math.random() * 100),
        ...s
    }));

    // Seed historical attendance (Past 5 school days)
    // July 8, 2026 is Wednesday
    const dates = [
        "2026-07-07", // Tuesday
        "2026-07-06", // Monday
        "2026-07-03", // Friday
        "2026-07-02", // Thursday
        "2026-07-01"  // Wednesday
    ];

    state.attendance = {};
    state.classes.forEach(c => {
        state.attendance[c] = {};
        const classStudents = state.students.filter(s => s.class === c);
        
        dates.forEach(date => {
            state.attendance[c][date] = {};
            classStudents.forEach(student => {
                // Randomly assign: 85% Present, 10% Absent, 5% Late
                const rand = Math.random();
                let status = "Present";
                if (rand > 0.85 && rand <= 0.95) {
                    status = "Absent";
                } else if (rand > 0.95) {
                    status = "Late";
                }
                
                state.attendance[c][date][student.id] = {
                    status: status,
                    remarks: status === "Absent" ? "Informed leave" : ""
                };
            });
        });
    });

    saveStateToStorage();
}

// Theme Engine
function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || 'light';
    state.theme = savedTheme;
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    state.theme = isDark ? 'dark' : 'light';
    localStorage.setItem(CONFIG.THEME_KEY, state.theme);
    
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (isDark) {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        showToast("Switched to dark theme", "success");
    } else {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        showToast("Switched to light theme", "success");
    }
}

// Date Display Utilities
function initDatePickers() {
    // Current Local Date display
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    document.getElementById('current-date-display').textContent = formattedDate;

    // Set Default Dates to Today (YYYY-MM-DD)
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    document.getElementById('attendance-date-picker').value = todayStr;
    document.getElementById('attendance-date-picker').max = todayStr; // Cannot take future attendance

    // Populate Report month dropdown
    const monthSelect = document.getElementById('report-month-select');
    if (monthSelect) {
        monthSelect.innerHTML = '';
        // Add past 6 months dynamically
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            monthSelect.innerHTML += `<option value="${val}">${label}</option>`;
        }
    }
}

// Router & View Management
function switchView(viewName) {
    // Hide all views, display targeted view
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) activeView.classList.add('active');

    // Update active nav sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNavItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (activeNavItem) activeNavItem.classList.add('active');

    // Adjust title bar
    const titleBar = document.getElementById('view-title');
    switch(viewName) {
        case 'dashboard':
            titleBar.textContent = 'Dashboard Overview';
            renderDashboard();
            break;
        case 'attendance':
            titleBar.textContent = 'Take Student Attendance';
            // Reset state
            document.getElementById('attendance-board').style.display = 'none';
            break;
        case 'students':
            titleBar.textContent = 'Student Registry';
            renderStudentsRegistry();
            break;
        case 'reports':
            titleBar.textContent = 'Attendance Reports';
            document.getElementById('report-board').style.display = 'none';
            break;
    }
}

// Popup Dropdown Handlers
function populateClassDropdowns() {
    const classSelectors = [
        document.getElementById('attendance-class-select'),
        document.getElementById('student-filter-class'),
        document.getElementById('student-class'),
        document.getElementById('report-class-select')
    ];

    classSelectors.forEach((selector, idx) => {
        if (!selector) return;
        // Keep the placeholder options if index is 0 or 1 or 2 or 3
        const defaultText = selector.options[0]?.text || '-- Select Class --';
        const defaultValue = selector.options[0]?.value || '';
        
        selector.innerHTML = `<option value="${defaultValue}">${defaultText}</option>`;
        
        state.classes.forEach(c => {
            selector.innerHTML += `<option value="${c}">${c}</option>`;
        });
    });
}

// Rendering Dashboards
function renderDashboard() {
    updateDashboardStats();
    renderRecentAttendanceTable();
    renderLowAttendanceAlerts();
}

function updateDashboardStats() {
    // Total Students
    const totalStudentsCount = state.students.length;
    document.getElementById('stat-total-students').textContent = totalStudentsCount;

    // Today's Stats
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let presentToday = 0;
    let absentToday = 0;
    let totalTargeted = 0;

    state.classes.forEach(cls => {
        const dailyAttendance = state.attendance[cls]?.[todayStr] || {};
        const classStudents = state.students.filter(s => s.class === cls);
        
        classStudents.forEach(student => {
            totalTargeted++;
            const record = dailyAttendance[student.id];
            if (record) {
                if (record.status === 'Present' || record.status === 'Late') {
                    presentToday++;
                } else if (record.status === 'Absent') {
                    absentToday++;
                }
            }
        });
    });

    document.getElementById('stat-present-today').textContent = presentToday;
    document.getElementById('stat-absent-today').textContent = absentToday;

    // Overall Average Attendance rate calculation
    let totalRecordsCount = 0;
    let presentRecordsCount = 0;

    state.classes.forEach(cls => {
        const classDates = state.attendance[cls] || {};
        const classStudents = state.students.filter(s => s.class === cls);

        for (const date in classDates) {
            const dailyData = classDates[date] || {};
            classStudents.forEach(student => {
                const record = dailyData[student.id];
                if (record) {
                    totalRecordsCount++;
                    if (record.status === 'Present' || record.status === 'Late') {
                        presentRecordsCount++;
                    }
                }
            });
        }
    });

    const averageRate = totalRecordsCount > 0 ? Math.round((presentRecordsCount / totalRecordsCount) * 100) : 0;
    document.getElementById('stat-monthly-rate').textContent = `${averageRate}%`;
}

function renderRecentAttendanceTable() {
    const tbody = document.getElementById('recent-attendance-tbody');
    tbody.innerHTML = '';

    // Collect all historical marked records
    let records = [];

    state.classes.forEach(cls => {
        const classDates = state.attendance[cls] || {};
        for (const date in classDates) {
            const dailyData = classDates[date] || {};
            const keys = Object.keys(dailyData);
            if (keys.length === 0) continue;

            const classStudents = state.students.filter(s => s.class === cls);
            let total = classStudents.length;
            let present = 0;
            let absent = 0;

            classStudents.forEach(student => {
                const record = dailyData[student.id];
                if (record) {
                    if (record.status === 'Present' || record.status === 'Late') present++;
                    if (record.status === 'Absent') absent++;
                }
            });

            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            records.push({ date, className: cls, present, absent, rate });
        }
    });

    // Sort by date descending
    records.sort((a, b) => b.date.localeCompare(a.date));

    // Slice first 5 records
    const recent = records.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No attendance marked yet.</td></tr>`;
        return;
    }

    recent.forEach(r => {
        const tr = document.createElement('tr');
        const formattedDateStr = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        tr.innerHTML = `
            <td><strong>${formattedDateStr}</strong></td>
            <td><span class="badge" style="background:var(--border-color); color:var(--text-primary)">${r.className}</span></td>
            <td><span class="status-indicator status-present">${r.present}</span></td>
            <td><span class="status-indicator status-absent">${r.absent}</span></td>
            <td><strong>${r.rate}%</strong></td>
            <td>
                <span class="badge ${r.rate >= 75 ? 'badge-success' : 'badge-danger'}">
                    ${r.rate >= 75 ? 'Excellent' : 'Needs Review'}
                </span>
            </td>
            <td>
                <div style="display:flex; gap:8px">
                    <button class="btn btn-text btn-sm" onclick="editRecentAttendance('${r.className}', '${r.date}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-text btn-sm btn-text-danger" onclick="deleteRecentAttendance('${r.className}', '${r.date}')" title="Delete record">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editRecentAttendance(className, date) {
    switchView('attendance');
    document.getElementById('attendance-class-select').value = className;
    document.getElementById('attendance-date-picker').value = date;
    loadAttendanceSheet(className, date);
}

function renderLowAttendanceAlerts() {
    const listContainer = document.getElementById('low-attendance-list');
    listContainer.innerHTML = '';

    // Calculate rates for all students
    let alertStudents = [];

    state.students.forEach(student => {
        const cls = student.class;
        const classDates = state.attendance[cls] || {};
        
        let totalSessions = 0;
        let presentSessions = 0;

        for (const date in classDates) {
            const dailyData = classDates[date] || {};
            const record = dailyData[student.id];
            if (record) {
                totalSessions++;
                if (record.status === 'Present' || record.status === 'Late') {
                    presentSessions++;
                }
            }
        }

        const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;
        
        // Alert trigger at below 75% attendance rate
        if (totalSessions >= 2 && rate < 75) {
            alertStudents.push({
                student,
                rate
            });
        }
    });

    if (alertStudents.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-check text-success" style="font-size:36px"></i>
                <p>All students have optimal attendance (>75%).</p>
            </div>
        `;
        return;
    }

    // Sort by attendance rate ascending (worst attendance first)
    alertStudents.sort((a, b) => a.rate - b.rate);

    alertStudents.forEach(item => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <div class="alert-student-info">
                <span class="alert-student-name">${item.student.name}</span>
                <span class="alert-student-class">Roll: ${item.student.roll} • ${item.student.class}</span>
            </div>
            <div class="alert-value">${item.rate}%</div>
        `;
        listContainer.appendChild(alertItem);
    });
}

// Student Registry Panel logic
let currentFilterClass = '';
let currentStudentSearchQuery = '';

function renderStudentsRegistry() {
    const tbody = document.getElementById('student-registry-tbody');
    tbody.innerHTML = '';

    // Filters
    let filtered = state.students;
    if (currentFilterClass) {
        filtered = filtered.filter(s => s.class === currentFilterClass);
    }
    if (currentStudentSearchQuery) {
        const query = currentStudentSearchQuery.toLowerCase();
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.roll.toString().includes(query)
        );
    }

    // Sort by Class then Roll Number
    filtered.sort((a, b) => {
        const classCompare = a.class.localeCompare(b.class);
        if (classCompare !== 0) return classCompare;
        return a.roll - b.roll;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No students found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        // Calculate attendance rate
        const classDates = state.attendance[s.class] || {};
        let total = 0;
        let present = 0;
        for (const date in classDates) {
            const record = classDates[date][s.id];
            if (record) {
                total++;
                if (record.status === 'Present' || record.status === 'Late') present++;
            }
        }
        const rate = total > 0 ? Math.round((present / total) * 100) : 100;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.roll}</strong></td>
            <td>
                <div style="font-weight:600; color:var(--text-primary)">${s.name}</div>
                <div style="font-size:12px; color:var(--text-muted)">Gender: ${s.gender}</div>
            </td>
            <td><span class="badge" style="background:var(--border-color); color:var(--text-primary)">${s.class}</span></td>
            <td>${s.gender}</td>
            <td>${s.mobile || '<span class="text-muted">Not Provided</span>'}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px">
                    <strong style="color:${rate < 75 ? 'var(--danger-text)' : 'inherit'}">${rate}%</strong>
                    <div style="width:50px; height:6px; background:var(--border-color); border-radius:50px; overflow:hidden">
                        <div style="width:${rate}%; height:100%; background:${rate < 75 ? 'var(--danger)' : 'var(--primary)'}"></div>
                    </div>
                </div>
            </td>
            <td class="text-right">
                <button class="btn btn-icon-only btn-secondary btn-sm" style="border-radius:var(--border-radius-sm); margin-right:4px;" onclick="openEditStudent('${s.id}')" title="Edit Student">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-icon-only btn-soft-danger btn-sm" style="border-radius:var(--border-radius-sm)" onclick="deleteStudent('${s.id}')" title="Delete Student">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Attendance taking workflow
let currentAttendanceSheet = []; // Temp holder

function loadAttendanceSheet(className, dateString) {
    if (!className || !dateString) {
        showToast("Please choose class and select a date.", "warning");
        return;
    }

    const classStudents = state.students.filter(s => s.class === className);
    
    if (classStudents.length === 0) {
        showToast(`No students registered in ${className}. Go to Registry to add students.`, "warning");
        return;
    }

    // Sort by roll number
    classStudents.sort((a, b) => a.roll - b.roll);

    const existingAttendance = state.attendance[className]?.[dateString] || {};
    
    currentAttendanceSheet = classStudents.map(student => {
        const record = existingAttendance[student.id];
        return {
            id: student.id,
            name: student.name,
            roll: student.roll,
            gender: student.gender,
            status: record ? record.status : 'Present', // Defaults to present
            remarks: record ? record.remarks : ''
        };
    });

    document.getElementById('board-class-title').textContent = className;
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('board-date-badge').textContent = formattedDate;

    document.getElementById('attendance-board').style.display = 'block';
    renderAttendanceSheet();
    updateAttendanceCounters();
}

function renderAttendanceSheet() {
    const tbody = document.getElementById('attendance-sheet-tbody');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('attendance-search').value.toLowerCase();
    
    let list = currentAttendanceSheet;
    if (searchQuery) {
        list = list.filter(item => 
            item.name.toLowerCase().includes(searchQuery) ||
            item.roll.toString().includes(searchQuery)
        );
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No matching students found in this class.</td></tr>`;
        return;
    }

    list.forEach(student => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${student.roll}</strong></td>
            <td>
                <div style="font-weight:600">${student.name}</div>
            </td>
            <td>${student.gender}</td>
            <td class="text-center">
                <div class="attendance-toggle-group">
                    <input type="radio" name="att_${student.id}" id="att_${student.id}_p" value="Present" class="attendance-btn-radio" ${student.status === 'Present' ? 'checked' : ''}>
                    <label for="att_${student.id}_p" class="attendance-label" title="Mark Present">P</label>

                    <input type="radio" name="att_${student.id}" id="att_${student.id}_a" value="Absent" class="attendance-btn-radio" ${student.status === 'Absent' ? 'checked' : ''}>
                    <label for="att_${student.id}_a" class="attendance-label" title="Mark Absent">A</label>

                    <input type="radio" name="att_${student.id}" id="att_${student.id}_l" value="Late" class="attendance-btn-radio" ${student.status === 'Late' ? 'checked' : ''}>
                    <label for="att_${student.id}_l" class="attendance-label" title="Mark Late">L</label>
                </div>
            </td>
            <td>
                <input type="text" class="form-input" style="padding:6px 12px; font-size:13px; max-width:200px" 
                       id="rem_${student.id}" value="${student.remarks}" placeholder="Add remark..." 
                       onchange="updateStudentRemark('${student.id}', this.value)">
            </td>
        `;

        // Listen for radio change inline
        tr.querySelectorAll('.attendance-btn-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                updateStudentAttendanceStatus(student.id, e.target.value);
            });
        });

        tbody.appendChild(tr);
    });
}

function updateStudentAttendanceStatus(studentId, newStatus) {
    const item = currentAttendanceSheet.find(s => s.id === studentId);
    if (item) {
        item.status = newStatus;
        updateAttendanceCounters();
    }
}

function updateStudentRemark(studentId, remarkText) {
    const item = currentAttendanceSheet.find(s => s.id === studentId);
    if (item) {
        item.remarks = remarkText;
    }
}

function updateAttendanceCounters() {
    let p = 0, a = 0, l = 0;
    currentAttendanceSheet.forEach(item => {
        if (item.status === 'Present') p++;
        if (item.status === 'Absent') a++;
        if (item.status === 'Late') l++;
    });

    document.getElementById('count-present').textContent = p;
    document.getElementById('count-absent').textContent = a;
    document.getElementById('count-late').textContent = l;
}

function resetAttendanceSheet() {
    currentAttendanceSheet.forEach(student => {
        student.status = 'Present';
        student.remarks = '';
    });
    renderAttendanceSheet();
    updateAttendanceCounters();
    showToast("Attendance sheet has been reset to default values.", "info");
}

function deleteRecentAttendance(className, dateString) {
    if (confirm(`Are you sure you want to delete the attendance record for ${className} on ${dateString}?`)) {
        if (state.attendance[className] && state.attendance[className][dateString]) {
            delete state.attendance[className][dateString];
            
            // Clean up empty date parent objects
            if (Object.keys(state.attendance[className]).length === 0) {
                delete state.attendance[className];
            }
            
            saveStateToStorage();
            showToast(`Attendance record for ${className} on ${dateString} has been deleted.`, "success");
            
            // Re-render dashboard stats and tables
            renderDashboard();
        }
    }
}

function saveAttendanceSheet() {
    const className = document.getElementById('attendance-class-select').value;
    const dateString = document.getElementById('attendance-date-picker').value;

    if (!state.attendance[className]) {
        state.attendance[className] = {};
    }

    if (!state.attendance[className][dateString]) {
        state.attendance[className][dateString] = {};
    }

    currentAttendanceSheet.forEach(item => {
        state.attendance[className][dateString][item.id] = {
            status: item.status,
            remarks: item.remarks
        };
    });

    saveStateToStorage();
    showToast(`Attendance for ${className} saved successfully!`, 'success');
    switchView('dashboard');
}

// Reports Generation Logic
function generateReportMatrix() {
    const className = document.getElementById('report-class-select').value;
    const monthVal = document.getElementById('report-month-select').value; // Formatted YYYY-MM

    if (!className) {
        showToast("Please select a Class section.", "warning");
        return;
    }

    const classStudents = state.students.filter(s => s.class === className);
    if (classStudents.length === 0) {
        showToast(`No students registered in ${className}.`, "warning");
        return;
    }

    // Filter class students and sort by roll
    classStudents.sort((a, b) => a.roll - b.roll);

    // Days extraction in the month
    const [year, month] = monthVal.split('-').map(Number);
    const dateObj = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Render Headers (Dates 1 to N)
    const thead = document.getElementById('report-matrix-thead');
    thead.innerHTML = '';
    
    const headerTr = document.createElement('tr');
    headerTr.innerHTML = `
        <th>Student Name (Roll)</th>
        ${Array.from({ length: daysInMonth }, (_, i) => `<th class="text-center">${i + 1}</th>`).join('')}
        <th>Summary</th>
    `;
    thead.appendChild(headerTr);

    // Render Rows
    const tbody = document.getElementById('report-matrix-tbody');
    tbody.innerHTML = '';

    const classAttendance = state.attendance[className] || {};

    classStudents.forEach(student => {
        const tr = document.createElement('tr');
        let cellsHTML = `<td><strong>${student.name}</strong> <span class="text-muted">(${student.roll})</span></td>`;
        
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let unmarkedCount = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = String(day).padStart(2, '0');
            const mmStr = String(month).padStart(2, '0');
            const targetDateStr = `${year}-${mmStr}-${dayStr}`;

            const record = classAttendance[targetDateStr]?.[student.id];

            if (record) {
                if (record.status === 'Present') {
                    cellsHTML += `<td><span class="matrix-cell P" title="${targetDateStr}: Present">P</span></td>`;
                    presentCount++;
                } else if (record.status === 'Absent') {
                    cellsHTML += `<td><span class="matrix-cell A" title="${targetDateStr}: Absent">A</span></td>`;
                    absentCount++;
                } else if (record.status === 'Late') {
                    cellsHTML += `<td><span class="matrix-cell L" title="${targetDateStr}: Late">L</span></td>`;
                    lateCount++;
                }
            } else {
                cellsHTML += `<td><span class="matrix-cell U">-</span></td>`;
                unmarkedCount++;
            }
        }

        const totalActive = presentCount + absentCount + lateCount;
        const presentRate = totalActive > 0 ? Math.round(((presentCount + lateCount) / totalActive) * 100) : '-';

        cellsHTML += `
            <td class="text-center">
                <span class="badge badge-success" style="margin-right:2px">${presentCount}P</span>
                <span class="badge badge-danger" style="margin-right:2px">${absentCount}A</span>
                <span class="badge badge-warning" style="margin-right:2px">${lateCount}L</span>
                <div style="font-size:11px; margin-top:4px; font-weight:700">Rate: ${presentRate}${presentRate !== '-' ? '%' : ''}</div>
            </td>
        `;

        tr.innerHTML = cellsHTML;
        tbody.appendChild(tr);
    });

    document.getElementById('report-title-display').textContent = `Attendance Matrix: ${className}`;
    const dateLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('report-subtitle-display').textContent = `Summary Sheet for ${dateLabel}`;

    document.getElementById('report-board').style.display = 'block';
}

function exportAttendanceToCSV() {
    const className = document.getElementById('report-class-select').value;
    const monthVal = document.getElementById('report-month-select').value;

    if (!className) return;

    const classStudents = state.students.filter(s => s.class === className);
    classStudents.sort((a, b) => a.roll - b.roll);

    const [year, month] = monthVal.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Compile CSV Contents
    let csv = [];
    
    // Headers
    let headerRow = ['Roll No', 'Student Name', 'Gender', 'Mobile'];
    for (let d = 1; d <= daysInMonth; d++) {
        headerRow.push(`${d}/${month}`);
    }
    headerRow.push('Total Present', 'Total Absent', 'Total Late', 'Attendance rate (%)');
    csv.push(headerRow.join(','));

    // Rows
    const classAttendance = state.attendance[className] || {};

    classStudents.forEach(student => {
        let row = [student.roll, `"${student.name.replace(/"/g, '""')}"`, student.gender, student.mobile || ''];
        
        let present = 0, absent = 0, late = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = String(day).padStart(2, '0');
            const mmStr = String(month).padStart(2, '0');
            const targetDateStr = `${year}-${mmStr}-${dayStr}`;

            const record = classAttendance[targetDateStr]?.[student.id];
            if (record) {
                if (record.status === 'Present') {
                    row.push('P');
                    present++;
                } else if (record.status === 'Absent') {
                    row.push('A');
                    absent++;
                } else if (record.status === 'Late') {
                    row.push('L');
                    late++;
                }
            } else {
                row.push('-');
            }
        }

        const activeDays = present + absent + late;
        const rate = activeDays > 0 ? Math.round(((present + late) / activeDays) * 100) : 100;

        row.push(present, absent, late, `${rate}%`);
        csv.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${className.replace(/\s+/g, '_')}_${monthVal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV exported successfully!", "success");
}

// Student Management Operations (Add, Edit, Delete)
function openAddStudentModal() {
    document.getElementById('student-modal-title').textContent = "Register New Student";
    document.getElementById('student-form').reset();
    document.getElementById('student-id-field').value = '';
    
    // Auto increment roll number suggestor
    const activeClass = document.getElementById('student-filter-class').value;
    if (activeClass) {
        document.getElementById('student-class').value = activeClass;
        const rolls = state.students.filter(s => s.class === activeClass).map(s => s.roll);
        if (rolls.length > 0) {
            document.getElementById('student-roll').value = Math.max(...rolls) + 1;
        } else {
            document.getElementById('student-roll').value = 1;
        }
    }
    
    document.getElementById('modal-student').classList.add('active');
}

function openEditStudent(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('student-modal-title').textContent = "Edit Student Profile";
    document.getElementById('student-id-field').value = student.id;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-roll').value = student.roll;
    document.getElementById('student-class').value = student.class;
    document.getElementById('student-gender').value = student.gender;
    document.getElementById('student-mobile').value = student.mobile || '';

    document.getElementById('modal-student').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('modal-student').classList.remove('active');
}

function saveStudent(e) {
    e.preventDefault();
    
    const id = document.getElementById('student-id-field').value;
    const name = document.getElementById('student-name').value.trim();
    const roll = parseInt(document.getElementById('student-roll').value);
    const className = document.getElementById('student-class').value;
    const gender = document.getElementById('student-gender').value;
    const mobile = document.getElementById('student-mobile').value.trim();

    if (!name || !roll || !className || !gender) {
        showToast("Please fill in all required fields.", "warning");
        return;
    }

    // Verify duplicate rolls within same class
    const duplicate = state.students.find(s => s.class === className && s.roll === roll && s.id !== id);
    if (duplicate) {
        showToast(`Roll number ${roll} is already assigned to ${duplicate.name} in ${className}`, "danger");
        return;
    }

    if (id) {
        // Editing existing student
        const studentIndex = state.students.findIndex(s => s.id === id);
        if (studentIndex !== -1) {
            const oldClass = state.students[studentIndex].class;
            
            // Check if class changed. If so, transfer historical attendance or reset?
            if (oldClass !== className) {
                // Transfer history across state.attendance if applicable
                transferHistoricalAttendance(id, oldClass, className);
            }

            state.students[studentIndex] = { id, name, roll, class: className, gender, mobile };
            showToast("Student profile updated successfully!", "success");
        }
    } else {
        // Create new student
        const newStudent = {
            id: 'std_' + Date.now() + '_' + Math.floor(Math.random() * 100),
            name,
            roll,
            class: className,
            gender,
            mobile
        };
        state.students.push(newStudent);
        showToast("New student registered successfully!", "success");
    }

    saveStateToStorage();
    closeStudentModal();
    renderStudentsRegistry();
}

function transferHistoricalAttendance(studentId, oldClass, newClass) {
    if (!state.attendance[oldClass]) return;
    
    if (!state.attendance[newClass]) {
        state.attendance[newClass] = {};
    }

    for (const date in state.attendance[oldClass]) {
        if (state.attendance[oldClass][date][studentId]) {
            if (!state.attendance[newClass][date]) {
                state.attendance[newClass][date] = {};
            }
            // Assign to new class
            state.attendance[newClass][date][studentId] = state.attendance[oldClass][date][studentId];
            // Remove from old class
            delete state.attendance[oldClass][date][studentId];
        }
    }
}

function deleteStudent(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Are you sure you want to remove student "${student.name}" (Roll: ${student.roll})? This will delete all their historical attendance records.`)) {
        // Delete history from attendance object
        state.classes.forEach(c => {
            if (state.attendance[c]) {
                for (const date in state.attendance[c]) {
                    if (state.attendance[c][date][studentId]) {
                        delete state.attendance[c][date][studentId];
                    }
                }
            }
        });

        // Filter student list
        state.students = state.students.filter(s => s.id !== studentId);
        
        saveStateToStorage();
        showToast("Student deleted successfully.", "success");
        renderStudentsRegistry();
    }
}

// School Class Management Operations
function openClassesModal() {
    renderClassListUI();
    document.getElementById('modal-classes').classList.add('active');
}

function closeClassesModal() {
    document.getElementById('modal-classes').classList.remove('active');
}

function renderClassListUI() {
    const ul = document.getElementById('class-list-ul');
    ul.innerHTML = '';

    if (state.classes.length === 0) {
        ul.innerHTML = `<li class="text-center text-muted" style="padding:16px">No classes added yet.</li>`;
        return;
    }

    state.classes.forEach(c => {
        const studentCount = state.students.filter(s => s.class === c).length;
        
        const li = document.createElement('li');
        li.className = 'class-list-item';
        li.innerHTML = `
            <div>
                <span>${c}</span>
                <div style="font-size:11px; color:var(--text-muted)">${studentCount} Registered Student(s)</div>
            </div>
            <button class="btn btn-icon-only btn-soft-danger btn-sm" onclick="deleteClass('${c}')" title="Delete Class Section">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        ul.appendChild(li);
    });
}

function addNewClass(e) {
    e.preventDefault();
    const classNameInput = document.getElementById('new-class-name');
    const className = classNameInput.value.trim();

    if (!className) return;

    if (state.classes.includes(className)) {
        showToast("Class section already exists.", "danger");
        return;
    }

    state.classes.push(className);
    state.classes.sort();

    saveStateToStorage();
    classNameInput.value = '';
    
    showToast(`Class "${className}" added.`, "success");
    renderClassListUI();
    populateClassDropdowns();
}

function deleteClass(className) {
    const studentsInClass = state.students.filter(s => s.class === className);
    if (studentsInClass.length > 0) {
        showToast(`Cannot delete class section. Move or delete its ${studentsInClass.length} student(s) first.`, "danger");
        return;
    }

    if (confirm(`Are you sure you want to remove Class Section "${className}"?`)) {
        state.classes = state.classes.filter(c => c !== className);
        delete state.attendance[className];

        saveStateToStorage();
        showToast("Class section deleted successfully.", "success");
        renderClassListUI();
        populateClassDropdowns();
    }
}

// Toast Notifications helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-triangle-exclamation';
    if (type === 'warning') iconClass = 'fa-bell';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    // Toast click close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    // Auto dismiss after 3.5s
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 250);
        }
    }, 3500);
}

// Attach Event Listeners
function setupEventHandlers() {
    // Navigation routes selection
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view);
            // Close mobile menu if active
            document.getElementById('nav-dashboard').parentNode.parentNode.classList.remove('active');
        });
    });

    // Mobile Navbar toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    });

    // Theme Switch toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

    // Quick attendance call-to-action
    document.getElementById('btn-quick-attendance').addEventListener('click', () => {
        switchView('attendance');
    });

    // Dashboard View Action Shortcuts
    document.getElementById('btn-view-all-reports').addEventListener('click', () => {
        switchView('reports');
    });

    // Take Attendance Setup Action
    document.getElementById('btn-start-attendance').addEventListener('click', () => {
        const className = document.getElementById('attendance-class-select').value;
        const dateStr = document.getElementById('attendance-date-picker').value;
        loadAttendanceSheet(className, dateStr);
    });

    // Table attendance searching
    document.getElementById('attendance-search').addEventListener('input', renderAttendanceSheet);

    // Attendance mark all operations
    document.getElementById('btn-mark-all-present').addEventListener('click', () => {
        currentAttendanceSheet.forEach(s => s.status = 'Present');
        renderAttendanceSheet();
        updateAttendanceCounters();
    });

    document.getElementById('btn-mark-all-absent').addEventListener('click', () => {
        currentAttendanceSheet.forEach(s => s.status = 'Absent');
        renderAttendanceSheet();
        updateAttendanceCounters();
    });

    // Attendance Save / Cancel actions
    document.getElementById('btn-save-attendance').addEventListener('click', saveAttendanceSheet);
    document.getElementById('btn-reset-attendance').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all students to 'Present' and clear remarks for today's sheet?")) {
            resetAttendanceSheet();
        }
    });
    document.getElementById('btn-cancel-attendance').addEventListener('click', () => {
        if (confirm("Cancel and discard changes to today's sheet?")) {
            switchView('dashboard');
        }
    });

    // Student filters & searching in Registry
    document.getElementById('student-filter-class').addEventListener('change', (e) => {
        currentFilterClass = e.target.value;
        renderStudentsRegistry();
    });
    document.getElementById('student-search-input').addEventListener('input', (e) => {
        currentStudentSearchQuery = e.target.value;
        renderStudentsRegistry();
    });

    // Student Registry CRUD Operations
    document.getElementById('btn-open-add-student').addEventListener('click', openAddStudentModal);
    document.getElementById('btn-close-student-modal').addEventListener('click', closeStudentModal);
    document.getElementById('btn-cancel-student').addEventListener('click', closeStudentModal);
    document.getElementById('student-form').addEventListener('submit', saveStudent);

    // Class Management Operations
    document.getElementById('btn-manage-classes').addEventListener('click', openClassesModal);
    document.getElementById('btn-close-classes-modal').addEventListener('click', closeClassesModal);
    document.getElementById('btn-close-classes-view').addEventListener('click', closeClassesModal);
    document.getElementById('class-add-form').addEventListener('submit', addNewClass);

    // Reports actions
    document.getElementById('btn-generate-report').addEventListener('click', generateReportMatrix);
    document.getElementById('btn-export-csv').addEventListener('click', exportAttendanceToCSV);
}
