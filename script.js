/* =========================================
   CYBERSHIELD - JAVASCRIPT LOGIC
   Handles Local Storage, Navigation, and Validation
========================================= */

// Initialize empty storage on first load (Zero preloaded data)
if (!localStorage.getItem('cyberShield_reports')) {
    localStorage.setItem('cyberShield_reports', JSON.stringify([]));
}
if (!localStorage.getItem('cyberShield_users')) {
    localStorage.setItem('cyberShield_users', JSON.stringify([]));
}

// Simple View Switcher for Navigation
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.view-screen').forEach(scr => scr.style.display = 'none');

    if (viewId === 'home') {
        document.getElementById('home').style.display = 'flex';
        document.getElementById('incidents').style.display = 'block';
        document.getElementById('threat-checker').style.display = 'block';
        document.getElementById('report').style.display = 'block';
        document.getElementById('my-reports').style.display = 'block';
        loadMyReports();
    } else if (viewId === 'auth') {
        document.getElementById('authView').style.display = 'block';
    } else if (viewId === 'tracking') {
        document.getElementById('trackingView').style.display = 'block';
    } else if (viewId === 'admin') {
        document.getElementById('adminView').style.display = 'block';
        loadAdminDashboard();
    } else if (viewId === 'analytics') {
        document.getElementById('analyticsView').style.display = 'block';
        loadAnalytics();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// File Name Preview
function previewFileName(input) {
    const fileNameDiv = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        fileNameDiv.textContent = input.files[0].name;
    } else {
        fileNameDiv.textContent = 'No file selected';
    }
}

// Handle Incident Form Submission & Store in LocalStorage
function handleIncidentSubmit(e) {
    e.preventDefault();

    const type = document.getElementById('incidentType').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('incidentDate').value;
    const time = document.getElementById('incidentTime').value;
    const severityInput = document.querySelector('input[name="severity"]:checked');
    const severity = severityInput ? severityInput.value : 'Low';
    const name = document.getElementById('studentName').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const fileInput = document.getElementById('evidence');
    const fileName = fileInput.files[0] ? fileInput.files[0].name : 'None';

    const newTicketId = 'CS-' + Math.floor(1000 + Math.random() * 9000);

    const reportObj = {
        ticketId: newTicketId,
        type,
        description,
        date,
        time,
        severity,
        name,
        contact,
        email,
        fileName,
        status: 'Submitted',
        submittedAt: new Date().toLocaleString()
    };

    let reports = JSON.parse(localStorage.getItem('cyberShield_reports'));
    reports.push(reportObj);
    localStorage.setItem('cyberShield_reports', JSON.stringify(reports));

    alert('Incident reported successfully! Your Ticket ID is: ' + newTicketId);
    document.getElementById('incidentForm').reset();
    document.getElementById('fileName').textContent = 'No file selected';
    loadMyReports();
}

// Load Reports into "My Reports"
function loadMyReports() {
    const reportsList = document.getElementById('reportsList');
    const reports = JSON.parse(localStorage.getItem('cyberShield_reports')) || [];

    if (reports.length === 0) {
        reportsList.innerHTML = '<div class="no-reports">No reports submitted yet.</div>';
        return;
    }

    reportsList.innerHTML = '';
    reports.slice().reverse().forEach(rep => {
        const card = document.createElement('div');
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <strong style="color:#0b4c8c; font-size:16px;">${rep.ticketId} - ${rep.type}</strong>
                <span style="background:${rep.status === 'Resolved' ? '#dcfce7' : '#fef9c3'}; color:${rep.status === 'Resolved' ? '#166534' : '#854d0e'}; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:700;">${rep.status}</span>
            </div>
            <p style="margin:5px 0; font-size:14px; color:#475569;">${rep.description}</p>
            <div style="font-size:12px; color:#64748b; margin-top:8px;">
                <span><strong>Date:</strong> ${rep.date} ${rep.time}</span> | 
                <span><strong>Severity:</strong> ${rep.severity}</span> | 
                <span><strong>Ticket ID:</strong> <a href="#" onclick="showView('tracking'); document.getElementById('ticketSearchInput').value='${rep.ticketId}'; searchTicket();">${rep.ticketId}</a></span>
            </div>
        `;
        reportsList.appendChild(card);
    });
}

// Toggle Auth mode
function toggleAuthMode(mode) {
    if (mode === 'register') {
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('registerFormContainer').style.display = 'block';
    } else {
        document.getElementById('registerFormContainer').style.display = 'none';
        document.getElementById('loginFormContainer').style.display = 'block';
    }
}

// Register User
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    let users = JSON.parse(localStorage.getItem('cyberShield_users')) || [];
    if (users.some(u => u.email === email)) {
        alert('User with this email already exists!');
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem('cyberShield_users', JSON.stringify(users));

    alert('Registration successful! Please login.');
    toggleAuthMode('login');
}

// Login User
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let users = JSON.parse(localStorage.getItem('cyberShield_users')) || [];
    const validUser = users.find(u => u.email === email && u.password === password);

    if (validUser || (email === 'admin@cybershield.com' && password === 'admin123')) {
        alert('Login successful!');
        document.getElementById('authNavBtn').textContent = validUser ? validUser.name : 'Admin';
        showView('home');
    } else {
        alert('Invalid email or password.');
    }
}

// Ticket Tracking Search Function
function searchTicket() {
    const query = document.getElementById('ticketSearchInput').value.trim().toUpperCase();
    const resultDiv = document.getElementById('ticketTrackingResult');
    const reports = JSON.parse(localStorage.getItem('cyberShield_reports')) || [];

    const found = reports.find(r => r.ticketId.toUpperCase() === query);

    if (!found) {
        resultDiv.innerHTML = '<div class="no-reports">No ticket found matching ID: ' + (query || 'Empty') + '</div>';
        return;
    }

    resultDiv.innerHTML = `
        <div style="background:#fff; padding:25px; border-radius:12px; border:1px solid #e0e8f3; box-shadow:0 4px 15px rgba(6,26,66,.06);">
            <h3 style="color:#0b4c8c; margin-top:0;">Ticket Details: ${found.ticketId}</h3>
            <p><strong>Incident Type:</strong> ${found.type}</p>
            <p><strong>Description:</strong> ${found.description}</p>
            <p><strong>Current Status:</strong> <span style="color:#1683ff; font-weight:700;">${found.status}</span></p>
            <p><strong>Reported By:</strong> ${found.name} (${found.email})</p>
            <p><strong>Date & Time:</strong> ${found.date} at ${found.time}</p>
            <p><strong>Severity:</strong> ${found.severity}</p>
        </div>
    `;
}

// Load Admin Dashboard Table
function loadAdminDashboard() {
    const container = document.getElementById('adminTableContainer');
    const reports = JSON.parse(localStorage.getItem('cyberShield_reports')) || [];

    if (reports.length === 0) {
        container.innerHTML = '<div class="no-reports">No incident reports registered in the system yet.</div>';
        return;
    }

    let html = `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; background:#fff; border-radius:8px; overflow:hidden;">
                <thead>
                    <tr style="background:#061a42; color:#fff; text-align:left;">
                        <th style="padding:12px;">Ticket ID</th>
                        <th style="padding:12px;">Type</th>
                        <th style="padding:12px;">Reporter</th>
                        <th style="padding:12px;">Severity</th>
                        <th style="padding:12px;">Status</th>
                        <th style="padding:12px;">Action (Update Status)</th>
                    </tr>
                </thead>
                <tbody>
    `;

    reports.slice().reverse().forEach((rep, idx) => {
        const actualIdx = reports.length - 1 - idx;
        html += `
            <tr style="border-bottom:1px solid #e0e8f3;">
                <td style="padding:12px; font-weight:700; color:#0b4c8c;">${rep.ticketId}</td>
                <td style="padding:12px;">${rep.type}</td>
                <td style="padding:12px;">${rep.name}</td>
                <td style="padding:12px;">${rep.severity}</td>
                <td style="padding:12px;"><strong>${rep.status}</strong></td>
                <td style="padding:12px;">
                    <select onchange="updateTicketStatus(${actualIdx}, this.value)" style="padding:6px; border-radius:5px; border:1px solid #cbd5e1;">
                        <option value="Submitted" ${rep.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="In Progress" ${rep.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${rep.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// Update Ticket Status from Admin View
function updateTicketStatus(index, newStatus) {
    let reports = JSON.parse(localStorage.getItem('cyberShield_reports')) || [];
    if (reports[index]) {
        reports[index].status = newStatus;
        localStorage.setItem('cyberShield_reports', JSON.stringify(reports));
        loadAdminDashboard();
    }
}

// Load Analytics Metrics
function loadAnalytics() {
    const reports = JSON.parse(localStorage.getItem('cyberShield_reports')) || [];
    
    document.getElementById('statTotal').textContent = reports.length;
    document.getElementById('statHigh').textContent = reports.filter(r => r.severity === 'High').length;
    document.getElementById('statResolved').textContent = reports.filter(r => r.status === 'Resolved').length;

    const breakdownDiv = document.getElementById('analyticsBreakdown');
    if (reports.length === 0) {
        breakdownDiv.innerHTML = 'No data available yet. Submit a report to see metrics.';
        return;
    }

    let counts = {};
    reports.forEach(r => {
        counts[r.type] = (counts[r.type] || 0) + 1;
    });

    let breakdownHtml = '<ul style="margin:0; padding-left:20px;">';
    for (let type in counts) {
        breakdownHtml += `<li style="margin-bottom:8px;"><strong>${type}:</strong> ${counts[type]} report(s)</li>`;
    }
    breakdownHtml += '</ul>';
    breakdownDiv.innerHTML = breakdownHtml;
}

// Simple Threat Checkers
function checkUrl() {
    const url = document.getElementById('urlInput').value.trim();
    const resDiv = document.getElementById('urlResult');
    if (!url) {
        resDiv.innerHTML = '<span style="color:red;">Please enter a URL to analyze.</span>';
        return;
    }
    if (url.includes('secure') || url.includes('login') || url.includes('verify') || url.includes('free')) {
        resDiv.innerHTML = '<span style="color:#b91c1c; font-weight:700;">⚠️ Warning: Potential Phishing Indicator Detected! Proceed with caution.</span>';
    } else {
        resDiv.innerHTML = '<span style="color:#15803d; font-weight:700;">✅ URL appears relatively safe based on basic pattern checks.</span>';
    }
}

function checkEmail() {
    const content = document.getElementById('emailContent').value.toLowerCase();
    const resDiv = document.getElementById('emailResult');
    if (!content) {
        resDiv.innerHTML = '<span style="color:red;">Please paste email content to analyze.</span>';
        return;
    }
    if (content.includes('password') || content.includes('urgent') || content.includes('bank') || content.includes('click here') || content.includes('verify')) {
        resDiv.innerHTML = '<span style="color:#b91c1c; font-weight:700;">⚠️ Phishing Warning: High-risk keywords found (Urgency/Credentials request).</span>';
    } else {
        resDiv.innerHTML = '<span style="color:#15803d; font-weight:700;">✅ Email content has no immediate common phishing flags.</span>';
    }
}