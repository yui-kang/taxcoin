const DEFAULT_DATA = {
  filingStatus: "single",
  w2Wages: 0,
  interestIncome: 0,
  selfEmploymentIncome: 0,
  hasMortgageInterest: false
};

function collectData() {
  return {
    filingStatus: document.getElementById("filingStatus").value,
    w2Wages: Number(document.getElementById("w2Wages").value || 0),
    interestIncome: Number(document.getElementById("interestIncome").value || 0),
    selfEmploymentIncome: Number(document.getElementById("selfEmploymentIncome").value || 0),
    hasMortgageInterest: document.getElementById("hasMortgageInterest").checked
  };
}

function applyRules(data) {
  const forms = new Set(["Form 1040"]);
  const docs = new Set();
  const followups = [];

  if (data.interestIncome > 0) {
    forms.add("Schedule B");
    docs.add("1099-INT");
  }

  if (data.selfEmploymentIncome > 0) {
    forms.add("Schedule C");
    forms.add("Schedule SE");
    docs.add("1099-NEC");
    followups.push("Confirm deductible business expenses");
  }

  if (data.hasMortgageInterest) {
    forms.add("Schedule A");
    docs.add("Form 1098");
  }

  return { forms, docs, followups };
}

function runTaxCoin() {
  const data = collectData();
  localStorage.setItem("taxcoinData", JSON.stringify(data));

  const { forms, docs, followups } = applyRules(data);
  const output = document.getElementById("results");

  output.innerHTML = `
    <h3>Forms</h3>
    <ul>${[...forms].map(f => `<li>${f}</li>`).join("")}</ul>
    <h3>Documents</h3>
    <ul>${[...docs].map(d => `<li>${d}</li>`).join("")}</ul>
    <h3>Follow-ups</h3>
    <ul>${followups.map(f => `<li>${f}</li>`).join("")}</ul>
  `;
}

function exportJSON() {
  const data = localStorage.getItem("taxcoinData");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "taxcoin.json";
  a.click();

  URL.revokeObjectURL(url);
}
