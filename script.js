// ========================================
// Data Model & Storage
// ========================================

const DEFAULT_DATA = {
  // Basic info
  filingStatus: "single",
  
  // Income
  w2Wages: 0,
  interestIncome: 0,
  selfEmploymentIncome: 0,
  dividendIncome: 0,
  capitalGains: 0,
  
  // Deductions
  hasMortgageInterest: false,
  hasPropertyTax: false,
  hasCharitableDonations: false,
  hasMedicalExpenses: false,
  hasStudentLoanInterest: false,
  
  // Credits & Other
  hasChildcare: false,
  hasEducationExpenses: false,
  hasRetirementContributions: false,
  hasHSA: false,
  
  // Notes
  notes: "",
  
  // Checklist state
  completedForms: [],
  completedDocs: [],
  completedFollowups: [],
  
  // Custom items
  customItems: [],
  
  // Metadata
  lastSaved: null
};

// Load data from localStorage
function loadData() {
  const stored = localStorage.getItem("taxcoinData");
  if (stored) {
    try {
      return { ...DEFAULT_DATA, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Failed to parse stored data:", e);
      return { ...DEFAULT_DATA };
    }
  }
  return { ...DEFAULT_DATA };
}

// Save data to localStorage
function saveData() {
  const data = collectData();
  data.lastSaved = new Date().toISOString();
  localStorage.setItem("taxcoinData", JSON.stringify(data));
  updateLastSavedDisplay(data.lastSaved);
}

// Collect current form data
function collectData() {
  const stored = loadData();
  
  return {
    // Basic info
    filingStatus: document.getElementById("filingStatus").value,
    
    // Income
    w2Wages: Number(document.getElementById("w2Wages").value || 0),
    interestIncome: Number(document.getElementById("interestIncome").value || 0),
    selfEmploymentIncome: Number(document.getElementById("selfEmploymentIncome").value || 0),
    dividendIncome: Number(document.getElementById("dividendIncome").value || 0),
    capitalGains: Number(document.getElementById("capitalGains").value || 0),
    
    // Deductions
    hasMortgageInterest: document.getElementById("hasMortgageInterest").checked,
    hasPropertyTax: document.getElementById("hasPropertyTax").checked,
    hasCharitableDonations: document.getElementById("hasCharitableDonations").checked,
    hasMedicalExpenses: document.getElementById("hasMedicalExpenses").checked,
    hasStudentLoanInterest: document.getElementById("hasStudentLoanInterest").checked,
    
    // Credits & Other
    hasChildcare: document.getElementById("hasChildcare").checked,
    hasEducationExpenses: document.getElementById("hasEducationExpenses").checked,
    hasRetirementContributions: document.getElementById("hasRetirementContributions").checked,
    hasHSA: document.getElementById("hasHSA").checked,
    
    // Notes
    notes: document.getElementById("notes").value,
    
    // Preserve existing state
    completedForms: stored.completedForms || [],
    completedDocs: stored.completedDocs || [],
    completedFollowups: stored.completedFollowups || [],
    customItems: stored.customItems || [],
    lastSaved: stored.lastSaved
  };
}

// Restore form state from data
function restoreFormState(data) {
  // Basic info
  document.getElementById("filingStatus").value = data.filingStatus;
  
  // Income
  document.getElementById("w2Wages").value = data.w2Wages || "";
  document.getElementById("interestIncome").value = data.interestIncome || "";
  document.getElementById("selfEmploymentIncome").value = data.selfEmploymentIncome || "";
  document.getElementById("dividendIncome").value = data.dividendIncome || "";
  document.getElementById("capitalGains").value = data.capitalGains || "";
  
  // Deductions
  document.getElementById("hasMortgageInterest").checked = data.hasMortgageInterest;
  document.getElementById("hasPropertyTax").checked = data.hasPropertyTax;
  document.getElementById("hasCharitableDonations").checked = data.hasCharitableDonations;
  document.getElementById("hasMedicalExpenses").checked = data.hasMedicalExpenses;
  document.getElementById("hasStudentLoanInterest").checked = data.hasStudentLoanInterest;
  
  // Credits & Other
  document.getElementById("hasChildcare").checked = data.hasChildcare;
  document.getElementById("hasEducationExpenses").checked = data.hasEducationExpenses;
  document.getElementById("hasRetirementContributions").checked = data.hasRetirementContributions;
  document.getElementById("hasHSA").checked = data.hasHSA;
  
  // Notes
  document.getElementById("notes").value = data.notes || "";
  
  // Update last saved display
  if (data.lastSaved) {
    updateLastSavedDisplay(data.lastSaved);
  }
}

// Update last saved time display
function updateLastSavedDisplay(timestamp) {
  if (!timestamp) return;
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  let displayText;
  if (diff < 60000) {
    displayText = "Just now";
  } else if (diff < 3600000) {
    displayText = Math.floor(diff / 60000) + " min ago";
  } else if (diff < 86400000) {
    displayText = Math.floor(diff / 3600000) + " hr ago";
  } else {
    displayText = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }
  
  document.getElementById("lastSavedTime").textContent = displayText;
}

// ========================================
// Rules Engine
// ========================================

function applyRules(data) {
  const forms = [
    {
      id: "form-1040",
      name: "Form 1040",
      purpose: "Main tax return form",
      whatToLookFor: "All your income, deductions, and credits for the year",
      whereToFind: "You'll prepare this form yourself or with tax software"
    }
  ];
  
  const docs = [];
  const followups = [];

  // W-2 Wages
  if (data.w2Wages > 0) {
    docs.push({
      id: "doc-w2",
      name: "Form W-2",
      purpose: "Wage and tax statement from employer",
      whatToLookFor: "Wages, federal/state withholding, Social Security/Medicare taxes",
      whereToFind: "Received from employer by January 31"
    });
  }

  // Interest Income
  if (data.interestIncome > 0) {
    if (data.interestIncome > 1500) {
      forms.push({
        id: "form-schedule-b",
        name: "Schedule B",
        purpose: "Report interest and dividend income over $1,500",
        whatToLookFor: "All interest and dividend sources",
        whereToFind: "Attach to Form 1040"
      });
    }
    docs.push({
      id: "doc-1099-int",
      name: "Form 1099-INT",
      purpose: "Interest income statement",
      whatToLookFor: "Interest earned from banks, CDs, bonds",
      whereToFind: "Received from financial institutions by January 31"
    });
  }

  // Dividend Income
  if (data.dividendIncome > 0) {
    if (data.dividendIncome > 1500) {
      const schedBExists = forms.some(f => f.id === "form-schedule-b");
      if (!schedBExists) {
        forms.push({
          id: "form-schedule-b",
          name: "Schedule B",
          purpose: "Report interest and dividend income over $1,500",
          whatToLookFor: "All interest and dividend sources",
          whereToFind: "Attach to Form 1040"
        });
      }
    }
    docs.push({
      id: "doc-1099-div",
      name: "Form 1099-DIV",
      purpose: "Dividend income statement",
      whatToLookFor: "Ordinary dividends, qualified dividends, capital gains distributions",
      whereToFind: "Received from brokerages and mutual funds by January 31"
    });
  }

  // Self-Employment Income
  if (data.selfEmploymentIncome > 0) {
    forms.push({
      id: "form-schedule-c",
      name: "Schedule C",
      purpose: "Report business income and expenses",
      whatToLookFor: "Business income, deductible expenses, vehicle usage",
      whereToFind: "Attach to Form 1040"
    });
    
    if (data.selfEmploymentIncome > 400) {
      forms.push({
        id: "form-schedule-se",
        name: "Schedule SE",
        purpose: "Calculate self-employment tax",
        whatToLookFor: "Net profit from Schedule C",
        whereToFind: "Attach to Form 1040"
      });
    }
    
    docs.push({
      id: "doc-1099-nec",
      name: "Form 1099-NEC",
      purpose: "Nonemployee compensation statement",
      whatToLookFor: "Payments from clients for services",
      whereToFind: "Received from clients who paid you $600 or more"
    });
    
    followups.push({
      id: "followup-business-expenses",
      text: "Gather receipts for deductible business expenses (supplies, software, home office, etc.)"
    });
  }

  // Capital Gains
  if (data.capitalGains !== 0) {
    forms.push({
      id: "form-schedule-d",
      name: "Schedule D",
      purpose: "Report capital gains and losses",
      whatToLookFor: "Sales of stocks, bonds, crypto, real estate",
      whereToFind: "Attach to Form 1040"
    });
    
    docs.push({
      id: "doc-1099-b",
      name: "Form 1099-B",
      purpose: "Proceeds from broker transactions",
      whatToLookFor: "Stock sales, cost basis, dates of acquisition and sale",
      whereToFind: "Received from brokerages by February 15"
    });
    
    followups.push({
      id: "followup-cost-basis",
      text: "Verify cost basis for all investment sales (especially crypto)"
    });
  }

  // Itemized Deductions
  const hasItemizedDeductions = data.hasMortgageInterest || data.hasPropertyTax || 
                                 data.hasCharitableDonations || data.hasMedicalExpenses;
  
  if (hasItemizedDeductions) {
    forms.push({
      id: "form-schedule-a",
      name: "Schedule A",
      purpose: "Claim itemized deductions",
      whatToLookFor: "Mortgage interest, property tax, charitable donations, medical expenses",
      whereToFind: "Attach to Form 1040"
    });
  }

  // Mortgage Interest
  if (data.hasMortgageInterest) {
    docs.push({
      id: "doc-1098",
      name: "Form 1098",
      purpose: "Mortgage interest statement",
      whatToLookFor: "Interest paid on home mortgage",
      whereToFind: "Received from mortgage lender by January 31"
    });
  }

  // Property Tax
  if (data.hasPropertyTax) {
    docs.push({
      id: "doc-property-tax",
      name: "Property Tax Bills",
      purpose: "Proof of real estate taxes paid",
      whatToLookFor: "Amount paid for the tax year",
      whereToFind: "Keep copies of payment receipts or statements"
    });
  }

  // Charitable Donations
  if (data.hasCharitableDonations) {
    docs.push({
      id: "doc-charitable",
      name: "Charitable Donation Receipts",
      purpose: "Proof of donations to qualified charities",
      whatToLookFor: "Receipts for cash donations, acknowledgment letters for $250+",
      whereToFind: "Keep all receipts and acknowledgment letters from charities"
    });
    
    followups.push({
      id: "followup-charitable",
      text: "Ensure donations over $250 have written acknowledgment from charity"
    });
  }

  // Medical Expenses
  if (data.hasMedicalExpenses) {
    docs.push({
      id: "doc-medical",
      name: "Medical Expense Records",
      purpose: "Proof of out-of-pocket medical costs",
      whatToLookFor: "Insurance premiums, prescriptions, doctor visits, dental, vision",
      whereToFind: "Keep receipts, EOBs, and insurance statements"
    });
    
    followups.push({
      id: "followup-medical",
      text: "Only medical expenses exceeding 7.5% of AGI are deductible"
    });
  }

  // Student Loan Interest
  if (data.hasStudentLoanInterest) {
    forms.push({
      id: "form-student-loan",
      name: "Form 1098-E (included)",
      purpose: "Student loan interest deduction",
      whatToLookFor: "Interest paid on qualified student loans",
      whereToFind: "Information reported on main 1040 form"
    });
    
    docs.push({
      id: "doc-1098-e",
      name: "Form 1098-E",
      purpose: "Student loan interest statement",
      whatToLookFor: "Interest paid of $600 or more",
      whereToFind: "Received from loan servicer by January 31"
    });
  }

  // Childcare
  if (data.hasChildcare) {
    forms.push({
      id: "form-2441",
      name: "Form 2441",
      purpose: "Child and Dependent Care Credit",
      whatToLookFor: "Childcare provider info, amounts paid",
      whereToFind: "Attach to Form 1040"
    });
    
    followups.push({
      id: "followup-childcare",
      text: "Get provider's name, address, and tax ID number"
    });
  }

  // Education Expenses
  if (data.hasEducationExpenses) {
    docs.push({
      id: "doc-1098-t",
      name: "Form 1098-T",
      purpose: "Tuition statement",
      whatToLookFor: "Tuition and fees paid",
      whereToFind: "Received from educational institution by January 31"
    });
    
    forms.push({
      id: "form-8863",
      name: "Form 8863",
      purpose: "Education Credits",
      whatToLookFor: "American Opportunity Credit or Lifetime Learning Credit eligibility",
      whereToFind: "Attach to Form 1040"
    });
  }

  // Retirement Contributions
  if (data.hasRetirementContributions) {
    docs.push({
      id: "doc-5498",
      name: "Form 5498",
      purpose: "IRA contribution information",
      whatToLookFor: "Contributions made to traditional or Roth IRA",
      whereToFind: "Received from financial institution by May 31"
    });
    
    followups.push({
      id: "followup-ira",
      text: "Verify if IRA contributions are deductible based on income and employer plan coverage"
    });
  }

  // HSA
  if (data.hasHSA) {
    docs.push({
      id: "doc-5498-sa",
      name: "Form 5498-SA",
      purpose: "HSA contribution information",
      whatToLookFor: "HSA contributions for the year",
      whereToFind: "Received from HSA administrator by May 31"
    });
    
    forms.push({
      id: "form-8889",
      name: "Form 8889",
      purpose: "Health Savings Account",
      whatToLookFor: "HSA contributions and distributions",
      whereToFind: "Attach to Form 1040"
    });
  }

  return { forms, docs, followups };
}

// ========================================
// Checklist Generation & Display
// ========================================

function generateChecklist() {
  const data = collectData();
  const { forms, docs, followups } = applyRules(data);
  
  const output = document.getElementById("checklistOutput");
  
  let html = "";
  
  // Forms section
  if (forms.length > 0) {
    html += `<div class="checklist-section">
      <h3>Tax Forms to Complete</h3>`;
    
    forms.forEach(form => {
      const isChecked = data.completedForms.includes(form.id);
      html += `
        <div class="checklist-item ${isChecked ? 'checked' : ''}">
          <div class="checklist-header">
            <input type="checkbox" id="${form.id}" ${isChecked ? 'checked' : ''} 
                   onchange="toggleChecklistItem('forms', '${form.id}')">
            <label for="${form.id}">${form.name}</label>
            <button class="expand-toggle" onclick="toggleDetails('${form.id}-details')">Details</button>
          </div>
          <div id="${form.id}-details" class="checklist-details">
            <p><strong>Purpose:</strong> ${form.purpose}</p>
            ${form.whatToLookFor ? `<p><strong>What to look for:</strong> ${form.whatToLookFor}</p>` : ''}
            ${form.whereToFind ? `<p><strong>Where to find it:</strong> ${form.whereToFind}</p>` : ''}
          </div>
        </div>`;
    });
    
    html += `</div>`;
  }
  
  // Documents section
  if (docs.length > 0) {
    html += `<div class="checklist-section">
      <h3>Documents to Gather</h3>`;
    
    docs.forEach(doc => {
      const isChecked = data.completedDocs.includes(doc.id);
      html += `
        <div class="checklist-item ${isChecked ? 'checked' : ''}">
          <div class="checklist-header">
            <input type="checkbox" id="${doc.id}" ${isChecked ? 'checked' : ''} 
                   onchange="toggleChecklistItem('docs', '${doc.id}')">
            <label for="${doc.id}">${doc.name}</label>
            <button class="expand-toggle" onclick="toggleDetails('${doc.id}-details')">Details</button>
          </div>
          <div id="${doc.id}-details" class="checklist-details">
            <p><strong>Purpose:</strong> ${doc.purpose}</p>
            ${doc.whatToLookFor ? `<p><strong>What to look for:</strong> ${doc.whatToLookFor}</p>` : ''}
            ${doc.whereToFind ? `<p><strong>Where to find it:</strong> ${doc.whereToFind}</p>` : ''}
          </div>
        </div>`;
    });
    
    html += `</div>`;
  }
  
  // Follow-ups section
  if (followups.length > 0) {
    html += `<div class="checklist-section">
      <h3>Action Items & Follow-ups</h3>`;
    
    followups.forEach(followup => {
      const isChecked = data.completedFollowups.includes(followup.id);
      html += `
        <div class="checklist-item ${isChecked ? 'checked' : ''}">
          <div class="checklist-header">
            <input type="checkbox" id="${followup.id}" ${isChecked ? 'checked' : ''} 
                   onchange="toggleChecklistItem('followups', '${followup.id}')">
            <label for="${followup.id}">${followup.text}</label>
          </div>
        </div>`;
    });
    
    html += `</div>`;
  }
  
  if (!html) {
    html = '<p class="empty-state">No items to display. Enter your tax information above and generate the checklist.</p>';
  }
  
  output.innerHTML = html;
  saveData();
  renderCustomItems();
}

// Toggle checklist item completion
function toggleChecklistItem(type, id) {
  const data = loadData();
  
  if (type === 'forms') {
    const index = data.completedForms.indexOf(id);
    if (index > -1) {
      data.completedForms.splice(index, 1);
    } else {
      data.completedForms.push(id);
    }
  } else if (type === 'docs') {
    const index = data.completedDocs.indexOf(id);
    if (index > -1) {
      data.completedDocs.splice(index, 1);
    } else {
      data.completedDocs.push(id);
    }
  } else if (type === 'followups') {
    const index = data.completedFollowups.indexOf(id);
    if (index > -1) {
      data.completedFollowups.splice(index, 1);
    } else {
      data.completedFollowups.push(id);
    }
  }
  
  localStorage.setItem("taxcoinData", JSON.stringify(data));
  
  // Update UI
  const item = document.getElementById(id).closest('.checklist-item');
  if (item) {
    item.classList.toggle('checked');
  }
}

// Toggle details expansion
function toggleDetails(detailsId) {
  const details = document.getElementById(detailsId);
  if (details) {
    details.classList.toggle('expanded');
  }
}

// ========================================
// Custom Items
// ========================================

function addCustomItem() {
  const input = document.getElementById("customItemInput");
  const text = input.value.trim();
  
  if (!text) return;
  
  const data = loadData();
  const id = "custom-" + Date.now();
  
  data.customItems.push({
    id: id,
    text: text,
    checked: false
  });
  
  localStorage.setItem("taxcoinData", JSON.stringify(data));
  input.value = "";
  renderCustomItems();
}

function toggleCustomItem(id) {
  const data = loadData();
  const item = data.customItems.find(i => i.id === id);
  
  if (item) {
    item.checked = !item.checked;
    localStorage.setItem("taxcoinData", JSON.stringify(data));
    renderCustomItems();
  }
}

function deleteCustomItem(id) {
  const data = loadData();
  data.customItems = data.customItems.filter(i => i.id !== id);
  localStorage.setItem("taxcoinData", JSON.stringify(data));
  renderCustomItems();
}

function renderCustomItems() {
  const data = loadData();
  const container = document.getElementById("customItemsList");
  
  if (data.customItems.length === 0) {
    container.innerHTML = '<p class="empty-state">No custom items yet. Add forms or reminders specific to your situation.</p>';
    return;
  }
  
  let html = "";
  data.customItems.forEach(item => {
    html += `
      <div class="custom-item ${item.checked ? 'checked' : ''}">
        <input type="checkbox" ${item.checked ? 'checked' : ''} 
               onchange="toggleCustomItem('${item.id}')">
        <span>${item.text}</span>
        <button onclick="deleteCustomItem('${item.id}')">Delete</button>
      </div>`;
  });
  
  container.innerHTML = html;
}

// ========================================
// Import / Export / Reset
// ========================================

function exportJSON() {
  const data = localStorage.getItem("taxcoinData");
  if (!data) {
    alert("No data to export. Please enter some information first.");
    return;
  }
  
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = "taxcoin-" + new Date().toISOString().split('T')[0] + ".json";
  a.click();
  
  URL.revokeObjectURL(url);
}

function importJSON() {
  document.getElementById("fileInput").click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      localStorage.setItem("taxcoinData", JSON.stringify(imported));
      location.reload();
    } catch (error) {
      alert("Failed to import file. Please ensure it's a valid TaxCoin JSON file.");
      console.error("Import error:", error);
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    localStorage.removeItem("taxcoinData");
    location.reload();
  }
}

// ========================================
// Info Modal (Mobile)
// ========================================

function openModal(text) {
  const modal = document.getElementById("infoModal");
  const modalText = document.getElementById("modalText");
  modalText.textContent = text;
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("infoModal");
  modal.classList.remove("active");
}

// ========================================
// Initialization
// ========================================

document.addEventListener("DOMContentLoaded", function() {
  // Load saved data
  const data = loadData();
  restoreFormState(data);
  renderCustomItems();
  
  // Auto-generate checklist if data exists
  if (data.w2Wages > 0 || data.interestIncome > 0 || data.selfEmploymentIncome > 0 ||
      data.dividendIncome > 0 || data.capitalGains !== 0 || data.hasMortgageInterest) {
    generateChecklist();
  }
  
  // Setup info icon click handlers for mobile
  const isMobile = window.matchMedia("(hover: none)").matches;
  if (isMobile) {
    document.querySelectorAll(".info-icon").forEach(icon => {
      icon.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        const info = this.getAttribute("data-info");
        openModal(info);
      });
    });
  }
  
  // Update last saved time periodically
  setInterval(() => {
    const data = loadData();
    if (data.lastSaved) {
      updateLastSavedDisplay(data.lastSaved);
    }
  }, 60000); // Update every minute
});
