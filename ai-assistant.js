/**
 * LKC Accounting - Multi-Agent AI Assistant
 * ==========================================
 * Drop this file into your GitHub Pages repo and add one line to your HTML.
 * Works online only; gracefully degrades when offline.
 *
 * SETUP: Add your Anthropic API key in your repo's config or environment.
 * See INTEGRATION.md for full instructions.
 */

(function () {
  "use strict";

  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const LKC_AI_CONFIG = {
    // Set your Anthropic API key here OR via window.LKC_API_KEY before loading
    apiKey: window.LKC_API_KEY || "",
    model: "claude-sonnet-4-20250514",
    maxTokens: 2000,
    version: "2.0.0",
  };

  // ─── AGENT DEFINITIONS ────────────────────────────────────────────────────────
  const AGENTS = {
    router: {
      id: "router",
      name: "Router",
      systemPrompt: `You are a routing agent for LKC Accounting software. 
Analyze the user's request and respond ONLY with a JSON object like:
{"agent": "<agent_id>", "confidence": 0.95, "reason": "short reason"}

Available agents:
- "data_entry": transaction categorization, invoice/receipt OCR, bank reconciliation, payroll
- "fraud_detection": anomaly detection, duplicate payments, fraud patterns, audit trails
- "reporting": financial statements, natural language queries, variance analysis, multi-entity consolidation
- "forecasting": cash flow forecasting, revenue predictions, budget analysis, scenario modeling
- "ap_ar": invoice matching, payment reminders, vendor risk, credit assessment
- "tax_compliance": tax calculations, compliance checks, tax provisions, audit prep
- "assistant": general accounting questions, guided workflows, journal entries
- "document_intel": contract analysis, expense policy, document classification

Respond ONLY with the JSON, no other text.`,
    },

    data_entry: {
      id: "data_entry",
      name: "Data Entry & Automation Agent",
      icon: "⚡",
      systemPrompt: `You are the Data Entry & Automation Agent for LKC Accounting.
Your expertise covers:
1. TRANSACTION CATEGORIZATION: Classify transactions into accounting categories (Revenue, COGS, Operating Expenses, Assets, Liabilities, Equity). Use standard chart of accounts.
2. INVOICE/RECEIPT OCR: Extract structured data from described invoices/receipts: vendor, date, amount, line items, tax, payment terms.
3. BANK RECONCILIATION: Match bank statement entries with book entries. Identify timing differences, missing entries, errors.
4. PAYROLL PROCESSING: Calculate gross pay, deductions (PAYE, NHIF, NSSF for Kenya), net pay. Generate payroll journal entries.

Always provide:
- Specific account codes (e.g., 4000-Revenue, 5000-COGS, 6000-Operating Expenses)
- Journal entry format (Dr/Cr) when relevant
- Actionable recommendations
- Kenya-specific tax rules when applicable (KRA compliance)

Format responses clearly with sections. Be precise and accounting-accurate.`,
    },

    fraud_detection: {
      id: "fraud_detection",
      name: "Fraud & Anomaly Detection Agent",
      icon: "🛡️",
      systemPrompt: `You are the Fraud & Anomaly Detection Agent for LKC Accounting.
Your expertise covers:
1. ANOMALY DETECTION: Identify unusual transaction amounts, frequencies, timing, or parties. Flag statistical outliers.
2. DUPLICATE DETECTION: Spot potential duplicate invoices, payments, or entries based on amount/date/vendor patterns.
3. FRAUD PATTERNS: Recognize common fraud schemes: ghost employees, vendor fraud, expense reimbursement fraud, skimming, check tampering.
4. AUDIT TRAIL ANALYSIS: Review transaction sequences for compliance gaps, missing approvals, or policy violations.

Risk scoring: Assign LOW/MEDIUM/HIGH/CRITICAL risk levels.
Always explain the RED FLAGS clearly and suggest IMMEDIATE ACTIONS.
Reference relevant accounting standards and internal control best practices.
For Kenyan businesses, reference KRA compliance requirements.`,
    },

    reporting: {
      id: "reporting",
      name: "Financial Reporting Agent",
      icon: "📊",
      systemPrompt: `You are the Financial Reporting & Analysis Agent for LKC Accounting.
Your expertise covers:
1. FINANCIAL STATEMENTS: Generate Income Statement, Balance Sheet, Cash Flow Statement, Statement of Changes in Equity.
2. NATURAL LANGUAGE QUERIES: Answer questions about financial data in plain language. Convert business questions to accounting answers.
3. VARIANCE ANALYSIS: Explain differences between actual vs budget, period-over-period changes. Identify drivers.
4. MULTI-ENTITY CONSOLIDATION: Guide intercompany elimination, minority interest calculations, consolidated reporting.

Format financial statements properly with:
- Proper headings and structure
- Subtotals and totals
- Period comparisons where relevant
- Management commentary
- KPIs and ratios (gross margin, net margin, current ratio, quick ratio, ROE, etc.)

Use IFRS standards (relevant for Kenya). Provide actionable insights, not just numbers.`,
    },

    forecasting: {
      id: "forecasting",
      name: "Forecasting & Predictive Analytics Agent",
      icon: "🔮",
      systemPrompt: `You are the Forecasting & Predictive Analytics Agent for LKC Accounting.
Your expertise covers:
1. CASH FLOW FORECASTING: Project future cash positions based on historical patterns, receivables, payables, seasonal trends.
2. REVENUE & EXPENSE PREDICTIONS: Build forecasting models, identify trends, apply growth rates.
3. BUDGET VS ACTUAL: Analyze variances, reforecast, identify at-risk budget lines.
4. SCENARIO MODELING: Build optimistic/base/pessimistic scenarios. Model "what-if" changes in key drivers.

Always provide:
- Assumptions clearly stated
- Confidence intervals or ranges
- Key risks and sensitivities
- Recommended actions based on forecast
- Visual table formats for projections

Consider Kenyan economic factors: inflation, forex (KES), interest rates, seasonal patterns.`,
    },

    ap_ar: {
      id: "ap_ar",
      name: "AP/AR Intelligence Agent",
      icon: "💳",
      systemPrompt: `You are the Accounts Payable & Receivable Intelligence Agent for LKC Accounting.
Your expertise covers:
1. INVOICE MATCHING: 3-way matching (Purchase Order vs Goods Receipt vs Vendor Invoice). Flag discrepancies.
2. COLLECTIONS PRIORITIZATION: Score outstanding receivables by risk. Suggest collection strategies.
3. VENDOR RISK SCORING: Assess vendor financial health, payment history, concentration risk.
4. CREDIT ASSESSMENT: Evaluate customer creditworthiness. Recommend credit limits and payment terms.

Always provide:
- Risk scores (1-10) with clear reasoning
- Days Sales Outstanding (DSO), Days Payable Outstanding (DPO) calculations
- Specific action items with timelines
- Payment term optimization recommendations
- Early payment discount analysis

Reference Kenyan business practices and typical payment terms in the local market.`,
    },

    tax_compliance: {
      id: "tax_compliance",
      name: "Tax & Compliance Agent",
      icon: "📋",
      systemPrompt: `You are the Tax & Compliance Agent for LKC Accounting.
Your expertise covers Kenyan tax law primarily, plus general principles:
1. TAX CALCULATIONS: Corporation Tax (30%), VAT (16%), PAYE, Withholding Tax, Capital Gains Tax, Excise Duty.
2. COMPLIANCE CHECKS: KRA filing deadlines, iTax requirements, NHIF/NSSF obligations, Business Registration.
3. TAX PROVISIONS: Calculate current and deferred tax. Prepare tax provision schedules.
4. AUDIT PREPARATION: Organize documentation, identify audit risks, prepare responses to common queries.

Key Kenya tax dates:
- VAT returns: 20th of following month
- PAYE: 9th of following month  
- Instalment tax: 4 instalments (20th Apr, Jun, Sep, Dec)
- Annual returns: 6 months after year-end

Always cite the relevant tax statute (Income Tax Act, VAT Act, Tax Procedures Act).
Provide practical compliance steps, not just theory.
DISCLAIMER: Always recommend professional tax advice for complex situations.`,
    },

    assistant: {
      id: "assistant",
      name: "AI Accounting Copilot",
      icon: "🤖",
      systemPrompt: `You are the LKC Accounting AI Copilot — a friendly, expert accounting assistant.
You help with:
1. GENERAL ACCOUNTING Q&A: Explain concepts, standards, best practices.
2. GUIDED WORKFLOWS: Walk users through complex accounting processes step by step.
3. JOURNAL ENTRIES: Suggest correct journal entries for transactions. Always show Dr/Cr format.
4. CONTEXTUAL RECOMMENDATIONS: Proactively suggest improvements to accounting processes.

Your personality: Professional but approachable. Use plain language but be precise.
Structure answers clearly. Use examples. Anticipate follow-up questions.

You know LKC Accounting software features and can guide users through the UI.
You apply IFRS standards and Kenya-specific requirements (KRA, Companies Act 2015).

When suggesting journal entries always use:
Dr [Account Name] [Account Code]    KES X,XXX
  Cr [Account Name] [Account Code]              KES X,XXX
Being: [explanation]`,
    },

    document_intel: {
      id: "document_intel",
      name: "Document Intelligence Agent",
      icon: "📄",
      systemPrompt: `You are the Document Intelligence Agent for LKC Accounting.
Your expertise covers:
1. CONTRACT ANALYSIS: Extract key financial terms: payment amounts, schedules, penalties, warranties, termination clauses, price escalation.
2. EXPENSE POLICY ENFORCEMENT: Check expense claims against company policy rules. Flag violations clearly.
3. DOCUMENT CLASSIFICATION: Categorize financial documents: invoices, receipts, contracts, bank statements, payslips, tax documents.
4. DATA EXTRACTION: Pull structured data from unstructured document descriptions.

Standard expense policy rules to enforce:
- Receipts required for all claims over KES 500
- Manager approval required over KES 5,000
- CEO approval required over KES 50,000
- No alcohol/entertainment without prior approval
- Travel claims need booking confirmation
- Mileage claims need logbook

Always provide:
- EXTRACTED DATA in structured table format
- POLICY VIOLATIONS clearly marked ⚠️
- MISSING INFORMATION that's required
- RECOMMENDED ACTIONS with priority`,
    },
  };

  // ─── STYLES ──────────────────────────────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@300;400;500;600&display=swap');

    #lkc-ai-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 9998;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #0f4c81, #1a7fc1);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(15,76,129,0.45);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 24px; color: white;
    }
    #lkc-ai-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(15,76,129,0.6); }
    #lkc-ai-fab .lkc-fab-badge {
      position: absolute; top: -4px; right: -4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #e74c3c; border: 2px solid white;
      font-size: 9px; display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-weight: 600; color: white;
    }

    #lkc-ai-panel {
      position: fixed; bottom: 100px; right: 28px; z-index: 9999;
      width: 420px; max-width: calc(100vw - 40px);
      height: 620px; max-height: calc(100vh - 120px);
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      display: flex; flex-direction: column; overflow: hidden;
      font-family: 'Sora', sans-serif;
      opacity: 0; transform: translateY(20px) scale(0.96);
      transition: opacity 0.25s, transform 0.25s;
      pointer-events: none;
    }
    #lkc-ai-panel.lkc-open {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
    }

    .lkc-panel-header {
      padding: 16px 18px 14px;
      background: linear-gradient(135deg, #0f2942 0%, #0d1117 100%);
      border-bottom: 1px solid #21262d;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .lkc-header-logo {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0f4c81, #1a7fc1);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .lkc-header-info { flex: 1; min-width: 0; }
    .lkc-header-title {
      font-size: 14px; font-weight: 600; color: #e6edf3; letter-spacing: 0.01em;
    }
    .lkc-header-status {
      font-size: 11px; color: #8b949e; display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    .lkc-status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #3fb950; flex-shrink: 0;
      box-shadow: 0 0 6px rgba(63,185,80,0.5);
    }
    .lkc-status-dot.offline { background: #6e7681; box-shadow: none; }
    .lkc-status-dot.thinking { background: #f0883e; animation: lkc-pulse 1s infinite; }
    .lkc-header-close {
      width: 28px; height: 28px; border-radius: 8px; background: transparent;
      border: 1px solid #30363d; cursor: pointer; color: #8b949e;
      display: flex; align-items: center; justify-content: center; font-size: 14px;
      transition: background 0.15s, color 0.15s; flex-shrink: 0;
    }
    .lkc-header-close:hover { background: #21262d; color: #e6edf3; }

    .lkc-agent-bar {
      padding: 10px 14px; background: #0d1117;
      border-bottom: 1px solid #21262d; display: flex; gap: 6px;
      overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
    }
    .lkc-agent-bar::-webkit-scrollbar { display: none; }
    .lkc-agent-chip {
      padding: 4px 10px; border-radius: 20px; border: 1px solid #30363d;
      background: transparent; color: #8b949e; font-size: 10.5px;
      font-family: 'Sora', sans-serif; cursor: pointer; white-space: nowrap;
      transition: all 0.15s; display: flex; align-items: center; gap: 4px;
    }
    .lkc-agent-chip:hover { border-color: #1a7fc1; color: #79c0ff; }
    .lkc-agent-chip.active { background: #0f2942; border-color: #1a7fc1; color: #79c0ff; }

    .lkc-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: #21262d transparent;
    }
    .lkc-messages::-webkit-scrollbar { width: 4px; }
    .lkc-messages::-webkit-scrollbar-track { background: transparent; }
    .lkc-messages::-webkit-scrollbar-thumb { background: #21262d; border-radius: 4px; }

    .lkc-message {
      display: flex; gap: 9px; align-items: flex-start; animation: lkc-fadein 0.2s ease;
    }
    .lkc-message.user { flex-direction: row-reverse; }
    .lkc-msg-avatar {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; margin-top: 2px;
    }
    .lkc-msg-avatar.ai { background: linear-gradient(135deg, #0f4c81, #1a7fc1); }
    .lkc-msg-avatar.user { background: #21262d; color: #8b949e; }
    .lkc-msg-bubble {
      max-width: 88%; padding: 10px 13px; border-radius: 12px;
      font-size: 13px; line-height: 1.6; color: #e6edf3;
    }
    .lkc-message.ai .lkc-msg-bubble {
      background: #161b22; border: 1px solid #21262d; border-top-left-radius: 4px;
    }
    .lkc-message.user .lkc-msg-bubble {
      background: #0f2942; border: 1px solid #1a4570; border-top-right-radius: 4px;
    }
    .lkc-msg-bubble pre {
      background: #0d1117; border: 1px solid #21262d; border-radius: 8px;
      padding: 10px; overflow-x: auto; font-family: 'IBM Plex Mono', monospace;
      font-size: 11.5px; color: #79c0ff; margin: 8px 0;
      white-space: pre-wrap; word-break: break-word;
    }
    .lkc-msg-bubble code {
      font-family: 'IBM Plex Mono', monospace; font-size: 11.5px;
      background: #0d1117; padding: 1px 5px; border-radius: 4px; color: #79c0ff;
    }
    .lkc-msg-bubble strong { color: #79c0ff; }
    .lkc-msg-bubble table {
      width: 100%; border-collapse: collapse; font-size: 11.5px; margin: 8px 0;
    }
    .lkc-msg-bubble th {
      background: #0d1117; color: #8b949e; padding: 5px 8px;
      text-align: left; border-bottom: 1px solid #21262d; font-weight: 500;
    }
    .lkc-msg-bubble td {
      padding: 5px 8px; border-bottom: 1px solid #161b22; color: #c9d1d9;
    }
    .lkc-msg-agent-tag {
      font-size: 10px; color: #3fb950; font-family: 'IBM Plex Mono', monospace;
      margin-bottom: 5px; display: block;
    }
    .lkc-typing {
      display: flex; gap: 4px; padding: 5px 0; align-items: center;
    }
    .lkc-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #8b949e;
      animation: lkc-bounce 1.2s infinite;
    }
    .lkc-typing span:nth-child(2) { animation-delay: 0.15s; }
    .lkc-typing span:nth-child(3) { animation-delay: 0.3s; }

    .lkc-quick-prompts {
      padding: 0 14px 10px; display: flex; gap: 6px;
      flex-wrap: nowrap; overflow-x: auto; flex-shrink: 0;
      scrollbar-width: none;
    }
    .lkc-quick-prompts::-webkit-scrollbar { display: none; }
    .lkc-quick-btn {
      padding: 5px 10px; border-radius: 8px; border: 1px solid #21262d;
      background: #0d1117; color: #8b949e; font-size: 11px;
      font-family: 'Sora', sans-serif; cursor: pointer; white-space: nowrap;
      transition: all 0.15s;
    }
    .lkc-quick-btn:hover { border-color: #1a7fc1; color: #79c0ff; background: #0f1f30; }

    .lkc-input-area {
      padding: 12px 14px 14px; border-top: 1px solid #21262d;
      background: #0d1117; flex-shrink: 0;
    }
    .lkc-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .lkc-input-wrap { flex: 1; position: relative; }
    #lkc-input {
      width: 100%; padding: 10px 12px; border-radius: 10px;
      background: #161b22; border: 1px solid #30363d;
      color: #e6edf3; font-size: 13px; font-family: 'Sora', sans-serif;
      resize: none; outline: none; transition: border-color 0.15s;
      line-height: 1.5; max-height: 120px; overflow-y: auto;
      scrollbar-width: thin; box-sizing: border-box;
    }
    #lkc-input:focus { border-color: #1a7fc1; }
    #lkc-input::placeholder { color: #6e7681; }
    .lkc-send-btn {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #0f4c81, #1a7fc1);
      border: none; cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; transition: opacity 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    .lkc-send-btn:hover { opacity: 0.85; transform: scale(0.97); }
    .lkc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .lkc-attach-btn {
      width: 38px; height: 38px; border-radius: 10px;
      background: #161b22; border: 1px solid #30363d;
      cursor: pointer; color: #6e7681;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; transition: all 0.15s; flex-shrink: 0;
    }
    .lkc-attach-btn:hover { border-color: #1a7fc1; color: #79c0ff; }
    #lkc-file-input { display: none; }
    .lkc-file-preview {
      margin-bottom: 8px; padding: 6px 10px; background: #161b22;
      border: 1px solid #30363d; border-radius: 8px;
      font-size: 11px; color: #8b949e; display: flex; align-items: center; gap: 6px;
    }
    .lkc-file-preview .remove { cursor: pointer; color: #e74c3c; margin-left: auto; }

    .lkc-offline-banner {
      padding: 12px 16px; background: #161b22; border-bottom: 1px solid #21262d;
      text-align: center; font-size: 12px; color: #8b949e;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    @keyframes lkc-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes lkc-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
    @keyframes lkc-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  `;

  // ─── QUICK PROMPTS PER AGENT ─────────────────────────────────────────────────
  const QUICK_PROMPTS = {
    assistant: ["Suggest a journal entry", "Explain double-entry", "Chart of accounts help"],
    data_entry: ["Categorize this transaction", "Process this invoice", "Reconcile bank statement"],
    fraud_detection: ["Check for duplicates", "Flag unusual transactions", "Audit trail review"],
    reporting: ["Generate P&L statement", "What's my revenue YTD?", "Variance analysis"],
    forecasting: ["Cash flow forecast", "What-if scenario", "Budget vs actual"],
    ap_ar: ["Match invoices", "Collections priority", "Vendor risk score"],
    tax_compliance: ["VAT calculation", "PAYE this month", "KRA deadline check"],
    document_intel: ["Analyze this contract", "Check expense policy", "Classify this document"],
  };

  // ─── STATE ───────────────────────────────────────────────────────────────────
  let state = {
    open: false,
    activeAgent: "assistant",
    messages: [],
    thinking: false,
    pendingFile: null,
    conversationHistory: [],
  };

  // ─── ONLINE CHECK ────────────────────────────────────────────────────────────
  function isOnline() {
    return navigator.onLine;
  }

  // ─── RENDER MARKDOWN-LIKE TEXT ───────────────────────────────────────────────
  function renderText(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/```([\s\S]*?)```/g, "<pre>$1</pre>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  // ─── DOM HELPERS ─────────────────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function scrollToBottom() {
    const msgs = el("lkc-messages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function addMessage(role, content, agentName) {
    state.messages.push({ role, content, agentName });
    renderMessages();
  }

  function renderMessages() {
    const container = el("lkc-messages");
    if (!container) return;
    container.innerHTML = state.messages.map((m) => {
      const isAI = m.role === "assistant";
      const avatar = isAI ? "🤖" : "👤";
      const tag = isAI && m.agentName ? `<span class="lkc-msg-agent-tag">▸ ${m.agentName}</span>` : "";
      return `
        <div class="lkc-message ${isAI ? "ai" : "user"}">
          <div class="lkc-msg-avatar ${isAI ? "ai" : "user"}">${avatar}</div>
          <div class="lkc-msg-bubble">
            ${tag}${renderText(m.content)}
          </div>
        </div>`;
    }).join("") + (state.thinking ? `
      <div class="lkc-message ai" id="lkc-typing-indicator">
        <div class="lkc-msg-avatar ai">🤖</div>
        <div class="lkc-msg-bubble">
          <div class="lkc-typing"><span></span><span></span><span></span></div>
        </div>
      </div>` : "");
    scrollToBottom();
  }

  function setStatusDot(state) {
    const dot = document.querySelector(".lkc-status-dot");
    if (!dot) return;
    dot.className = "lkc-status-dot" + (state === "offline" ? " offline" : state === "thinking" ? " thinking" : "");
    const label = document.getElementById("lkc-status-label");
    if (label) {
      label.textContent = state === "offline" ? "Offline" : state === "thinking" ? "Thinking..." : "Online · 8 Agents Active";
    }
  }

  function updateQuickPrompts() {
    const bar = el("lkc-quick-bar");
    if (!bar) return;
    const prompts = QUICK_PROMPTS[state.activeAgent] || QUICK_PROMPTS.assistant;
    bar.innerHTML = prompts.map(p =>
      `<button class="lkc-quick-btn" onclick="window.LKCAIAssistant.sendQuick('${p.replace(/'/g, "\\'")}')">${p}</button>`
    ).join("");
  }

  function updateAgentChips() {
    document.querySelectorAll(".lkc-agent-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.agent === state.activeAgent);
    });
  }

  // ─── CALL ANTHROPIC API ───────────────────────────────────────────────────────
  async function callAPI(systemPrompt, messages) {
    if (!LKC_AI_CONFIG.apiKey) {
      throw new Error("API key not configured. See INTEGRATION.md for setup instructions.");
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LKC_AI_CONFIG.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: LKC_AI_CONFIG.model,
        max_tokens: LKC_AI_CONFIG.maxTokens,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text;
  }

  // ─── ROUTE TO AGENT ───────────────────────────────────────────────────────────
  async function routeAndRespond(userMessage) {
    // Try to route automatically
    let targetAgent = state.activeAgent;
    if (state.activeAgent === "assistant") {
      try {
        const routeResp = await callAPI(AGENTS.router.systemPrompt, [
          { role: "user", content: userMessage }
        ]);
        const parsed = JSON.parse(routeResp.trim());
        if (parsed.agent && AGENTS[parsed.agent]) {
          targetAgent = parsed.agent;
        }
      } catch {
        targetAgent = "assistant"; // fallback
      }
    }

    const agent = AGENTS[targetAgent] || AGENTS.assistant;

    // Build conversation history for this agent
    const apiMessages = [...state.conversationHistory];
    if (state.pendingFile) {
      apiMessages.push({
        role: "user",
        content: `[File attached: ${state.pendingFile.name}]\n\nContent/Description:\n${state.pendingFile.content}\n\nUser message: ${userMessage}`
      });
    } else {
      apiMessages.push({ role: "user", content: userMessage });
    }

    const response = await callAPI(agent.systemPrompt, apiMessages);

    // Update conversation history (keep last 10 turns)
    state.conversationHistory.push({ role: "user", content: userMessage });
    state.conversationHistory.push({ role: "assistant", content: response });
    if (state.conversationHistory.length > 20) {
      state.conversationHistory = state.conversationHistory.slice(-20);
    }

    return { response, agentName: `${agent.icon} ${agent.name}` };
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (state.thinking || !text.trim()) return;

    if (!isOnline()) {
      addMessage("assistant",
        "⚠️ **You're currently offline.**\n\nThe AI assistant requires an internet connection to work. Please connect to the internet and try again.\n\nYou can continue using all offline features of LKC Accounting normally.",
        "🤖 AI Copilot"
      );
      return;
    }

    addMessage("user", text);
    state.thinking = true;
    state.pendingFile = state.pendingFile; // hold pending file
    setStatusDot("thinking");
    renderMessages();

    // Disable input
    const input = el("lkc-input");
    const sendBtn = el("lkc-send-btn");
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
      const { response, agentName } = await routeAndRespond(text);
      addMessage("assistant", response, agentName);
    } catch (err) {
      addMessage("assistant",
        `❌ **Error:** ${err.message}\n\nPlease check your API key configuration or try again.`,
        "🤖 AI Copilot"
      );
    } finally {
      state.thinking = false;
      state.pendingFile = null;
      setStatusDot(isOnline() ? "online" : "offline");
      if (input) { input.disabled = false; input.value = ""; input.style.height = "auto"; input.focus(); }
      if (sendBtn) sendBtn.disabled = false;
      const preview = el("lkc-file-preview");
      if (preview) preview.remove();
      renderMessages();
    }
  }

  // ─── FILE HANDLING ────────────────────────────────────────────────────────────
  async function handleFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File too large. Please use files under 5MB.");
      return;
    }
    const text = await file.text().catch(() => `[Binary file: ${file.name}]`);
    state.pendingFile = { name: file.name, content: text.substring(0, 4000) };

    const inputArea = document.querySelector(".lkc-input-area");
    const existing = el("lkc-file-preview");
    if (existing) existing.remove();
    const preview = document.createElement("div");
    preview.className = "lkc-file-preview";
    preview.id = "lkc-file-preview";
    preview.innerHTML = `📎 ${file.name} <span class="remove" onclick="window.LKCAIAssistant.clearFile()">✕</span>`;
    inputArea.insertBefore(preview, inputArea.firstChild);
  }

  // ─── BUILD UI ─────────────────────────────────────────────────────────────────
  function buildUI() {
    // Inject styles
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    // FAB button
    const fab = document.createElement("button");
    fab.id = "lkc-ai-fab";
    fab.innerHTML = `🧠<div class="lkc-fab-badge">AI</div>`;
    fab.title = "LKC AI Assistant";
    fab.onclick = () => window.LKCAIAssistant.toggle();
    document.body.appendChild(fab);

    // Agent chips
    const agentChips = Object.values(AGENTS)
      .filter(a => a.id !== "router")
      .map(a => `<button class="lkc-agent-chip${a.id === "assistant" ? " active" : ""}" data-agent="${a.id}" onclick="window.LKCAIAssistant.setAgent('${a.id}')">${a.icon || "🔧"} ${a.name.split(" ")[0]}</button>`)
      .join("");

    // Panel
    const panel = document.createElement("div");
    panel.id = "lkc-ai-panel";
    panel.innerHTML = `
      <div class="lkc-panel-header">
        <div class="lkc-header-logo">🧠</div>
        <div class="lkc-header-info">
          <div class="lkc-header-title">LKC AI Assistant</div>
          <div class="lkc-header-status">
            <div class="lkc-status-dot${isOnline() ? "" : " offline"}"></div>
            <span id="lkc-status-label">${isOnline() ? "Online · 8 Agents Active" : "Offline"}</span>
          </div>
        </div>
        <button class="lkc-header-close" onclick="window.LKCAIAssistant.toggle()">✕</button>
      </div>
      <div class="lkc-agent-bar">${agentChips}</div>
      <div class="lkc-messages" id="lkc-messages"></div>
      <div class="lkc-quick-prompts" id="lkc-quick-bar"></div>
      <div class="lkc-input-area">
        <div class="lkc-input-row">
          <label class="lkc-attach-btn" title="Attach document">
            📎<input type="file" id="lkc-file-input" accept=".txt,.csv,.json,.pdf,.png,.jpg,.jpeg" />
          </label>
          <div class="lkc-input-wrap">
            <textarea id="lkc-input" rows="1" placeholder="Ask anything about your accounts..."></textarea>
          </div>
          <button class="lkc-send-btn" id="lkc-send-btn" title="Send">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // Welcome message
    addMessage("assistant",
      `👋 **Welcome to LKC AI Assistant!**\n\nI'm your multi-agent accounting copilot. I have **8 specialized agents** ready to help:\n\n⚡ **Data Entry** · 🛡️ **Fraud Detection** · 📊 **Reporting**\n🔮 **Forecasting** · 💳 **AP/AR** · 📋 **Tax & Compliance**\n🤖 **Copilot** · 📄 **Document Intelligence**\n\nHow can I assist you today?`,
      "🤖 AI Copilot"
    );

    updateQuickPrompts();

    // Event listeners
    const input = el("lkc-input");
    el("lkc-send-btn").onclick = () => sendMessage(input.value.trim());
    input.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input.value.trim()); }
    };
    input.oninput = () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    };
    el("lkc-file-input").onchange = (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    };

    // Online/offline listeners
    window.addEventListener("online", () => setStatusDot("online"));
    window.addEventListener("offline", () => setStatusDot("offline"));
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────────
  window.LKCAIAssistant = {
    toggle() {
      state.open = !state.open;
      const panel = el("lkc-ai-panel");
      if (panel) panel.classList.toggle("lkc-open", state.open);
      if (state.open) {
        const input = el("lkc-input");
        setTimeout(() => input && input.focus(), 300);
        if (!isOnline()) setStatusDot("offline");
      }
    },
    open() { if (!state.open) this.toggle(); },
    close() { if (state.open) this.toggle(); },
    setAgent(agentId) {
      if (!AGENTS[agentId]) return;
      state.activeAgent = agentId;
      state.conversationHistory = []; // reset history when switching agents
      updateAgentChips();
      updateQuickPrompts();
    },
    sendQuick(text) {
      const input = el("lkc-input");
      if (input) { input.value = text; input.focus(); }
      sendMessage(text);
    },
    clearFile() {
      state.pendingFile = null;
      const preview = el("lkc-file-preview");
      if (preview) preview.remove();
      const fileInput = el("lkc-file-input");
      if (fileInput) fileInput.value = "";
    },
    // Programmatic: feed data from the app into the AI
    analyzeTransactions(transactions) {
      const summary = JSON.stringify(transactions, null, 2).substring(0, 2000);
      this.setAgent("data_entry");
      this.open();
      sendMessage(`Please analyze and categorize these transactions:\n\`\`\`json\n${summary}\n\`\`\``);
    },
    checkFraud(transactions) {
      const summary = JSON.stringify(transactions, null, 2).substring(0, 2000);
      this.setAgent("fraud_detection");
      this.open();
      sendMessage(`Please check these transactions for anomalies or fraud:\n\`\`\`json\n${summary}\n\`\`\``);
    },
    generateReport(reportData) {
      const summary = JSON.stringify(reportData, null, 2).substring(0, 2000);
      this.setAgent("reporting");
      this.open();
      sendMessage(`Please generate a financial report from this data:\n\`\`\`json\n${summary}\n\`\`\``);
    },
    setApiKey(key) {
      LKC_AI_CONFIG.apiKey = key;
    },
  };

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
