/**
 * Aegis Security Framework - Centralized Registry of Security Dimensions
 * 
 * Provides an extensible metadata registry for all security evaluation criteria.
 * Distinguishes between IMPLEMENTED & VERIFIED dimensions and PLANNED enhancements.
 */

const SECURITY_DIMENSIONS = [
  // -------------------------------------------------------------
  // Category A: Prompt & Input Security
  // -------------------------------------------------------------
  {
    id: 'prompt_injection',
    displayName: 'Prompt Injection & Instruction Override',
    category: 'Prompt & Input Security',
    description: 'Direct attempts to ignore, override, or replace system directives and core constraints.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count & matched trigger pattern'
  },
  {
    id: 'system_prompt_exfiltration',
    displayName: 'System Prompt & Core Directive Extraction',
    category: 'Prompt & Input Security',
    description: 'Attempts to trick the model into printing, revealing, or dumping hidden developer prompts.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count & pattern match'
  },
  {
    id: 'jailbreak_persona_override',
    displayName: 'Jailbreak & Persona Override',
    category: 'Prompt & Input Security',
    description: 'Commands attempting to enforce developer mode, unrestricted personas (DAN), or adversarial modes.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count & matched token pattern'
  },
  {
    id: 'security_boundary_evasion',
    displayName: 'Security Boundary Evasion',
    category: 'Prompt & Input Security',
    description: 'Explicit commands aiming to bypass filters, firewalls, guardrails, or WAF protections.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count'
  },

  // -------------------------------------------------------------
  // Category B: Sensitive Information & Privacy
  // -------------------------------------------------------------
  {
    id: 'pii_exposure',
    displayName: 'Personally Identifiable Information (PII) Exposure',
    category: 'Sensitive Information & Privacy',
    description: 'Detection and redaction of emails, SSNs, phone numbers, and identifying credentials in prompt payloads.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Regex PII Scanner & Redactor',
    severityMapping: 'LOW',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Redaction count & sanitized tokens'
  },
  {
    id: 'credential_extraction',
    displayName: 'Credential & Secret Extraction',
    category: 'Sensitive Information & Privacy',
    description: 'Attempts to harvest internal passwords, database connection strings, or API secret keys.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count'
  },
  {
    id: 'bulk_data_exfiltration',
    displayName: 'Bulk Data Exfiltration Attempt',
    category: 'Sensitive Information & Privacy',
    description: 'Broad requests demanding all internal database records, customer data, or salary listings.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count'
  },

  // -------------------------------------------------------------
  // Category C: Malicious Content & Exploitation
  // -------------------------------------------------------------
  {
    id: 'database_exploitation',
    displayName: 'Database & SQL Destruction Commands',
    category: 'Malicious Content & Threat Detection',
    description: 'Destructive SQL queries, drop/truncate table commands, and shell execution injections.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'CRITICAL',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count & command string'
  },
  {
    id: 'social_engineering',
    displayName: 'Social Engineering & Deception',
    category: 'Malicious Content & Threat Detection',
    description: 'Deceptive patterns attempting to trick users or administrators into granting unauthorized access.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Heuristic Regex Engine',
    severityMapping: 'HIGH',
    dataType: 'occurrence_count',
    supportedMeasurement: 'Event count'
  },
  {
    id: 'url_malicious_link',
    displayName: 'Malicious URL & Sandbox Trigger',
    category: 'Malicious Content & Threat Detection',
    description: 'Detection of external URLs and sandboxed verification of phishing/malicious links in user input.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Multi-Modal URL Scanner',
    severityMapping: 'CRITICAL',
    dataType: 'occurrence_count',
    supportedMeasurement: 'URL count & malicious payload flag'
  },

  // -------------------------------------------------------------
  // Category D: AI Intent & Multi-Modal Deep Scanning
  // -------------------------------------------------------------
  {
    id: 'ai_semantic_intent',
    displayName: 'AI Semantic Intent Anomaly',
    category: 'AI & LLM-Specific Security',
    description: 'Sub-symbolic threat classification using TF-IDF vectorization and Logistic Regression probability scoring.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Scikit-Learn ML Model',
    severityMapping: 'MEDIUM',
    dataType: 'confidence_score',
    supportedMeasurement: 'Continuous probability score (0.0 to 1.0)'
  },
  {
    id: 'file_indirect_injection',
    displayName: 'Indirect Prompt Injection (Deep File Scan)',
    category: 'AI & LLM-Specific Security',
    description: 'Recursive semantic scanning of simulated file attachments for hidden adversarial prompts.',
    status: 'IMPLEMENTED',
    dataSource: 'Sidecar Multi-Modal Deep Scanner',
    severityMapping: 'CRITICAL',
    dataType: 'occurrence_count',
    supportedMeasurement: 'File scan count & secondary ML score'
  },

  // -------------------------------------------------------------
  // Planned / Future Dimensions (Architectural extensibility roadmap)
  // -------------------------------------------------------------
  {
    id: 'tool_call_authorization',
    displayName: 'Autonomous Tool-Use Authorization',
    category: 'AI & LLM-Specific Security',
    description: 'Verification of dynamic agentic function calls against fine-grained IAM policies before execution.',
    status: 'PLANNED',
    dataSource: 'Agent Gateway Proxy (Planned)',
    severityMapping: 'HIGH',
    dataType: 'policy_check',
    supportedMeasurement: 'Authorization decision'
  },
  {
    id: 'model_output_hallucination',
    displayName: 'Model Output Grounding & Hallucination Guard',
    category: 'Operational Health & Reliability',
    description: 'Real-time cross-referencing of model answers against corporate knowledge-base facts.',
    status: 'PLANNED',
    dataSource: 'Post-generation RAG verifier (Planned)',
    severityMapping: 'MEDIUM',
    dataType: 'similarity_metric',
    supportedMeasurement: 'Grounding score'
  },
  {
    id: 'compliance_framework_mapping',
    displayName: 'NIST AI RMF / OWASP LLM Top 10 Mapping',
    category: 'Policy & Compliance',
    description: 'Automated tagging of intercepted events to formal regulatory compliance benchmarks.',
    status: 'PLANNED',
    dataSource: 'Policy Engine (Planned)',
    severityMapping: 'LOW',
    dataType: 'compliance_tag',
    supportedMeasurement: 'Framework rule violation'
  }
];

/**
 * Maps a threat reason object or string from Sidecar output into a registered Dimension ID.
 */
function mapThreatToDimensionId(threat) {
  if (!threat) return null;
  const type = typeof threat === 'string' ? threat : (threat.type || '');
  const indicator = typeof threat === 'object' ? (threat.indicator || '') : '';
  const combined = (type + ' ' + indicator).toLowerCase();

  if (combined.includes('pii') || combined.includes('email') || combined.includes('ssn') || combined.includes('phone')) {
    return 'pii_exposure';
  }
  if (combined.includes('system prompt') || combined.includes('core directive') || combined.includes('initial prompt')) {
    return 'system_prompt_exfiltration';
  }
  if (combined.includes('jailbreak') || combined.includes('persona') || combined.includes('developer mode')) {
    return 'jailbreak_persona_override';
  }
  if (combined.includes('bypass') || combined.includes('evasion')) {
    return 'security_boundary_evasion';
  }
  if (combined.includes('credential') || combined.includes('password') || combined.includes('api key') || combined.includes('secret')) {
    return 'credential_extraction';
  }
  if (combined.includes('bulk data') || combined.includes('all data') || combined.includes('all internal')) {
    return 'bulk_data_exfiltration';
  }
  if (combined.includes('database') || combined.includes('sql') || combined.includes('drop table')) {
    return 'database_exploitation';
  }
  if (combined.includes('social engineering') || combined.includes('trick the user')) {
    return 'social_engineering';
  }
  if (combined.includes('file-based') || combined.includes('indirect prompt injection') || combined.includes('deep scanning')) {
    return 'file_indirect_injection';
  }
  if (combined.includes('url') || combined.includes('malicious link') || combined.includes('sandbox')) {
    return 'url_malicious_link';
  }
  if (combined.includes('semantic intent') || combined.includes('contextual threat') || combined.includes('ai semantic')) {
    return 'ai_semantic_intent';
  }
  if (combined.includes('prompt injection') || combined.includes('instruction override')) {
    return 'prompt_injection';
  }

  return 'prompt_injection'; // Default fallback
}

module.exports = {
  SECURITY_DIMENSIONS,
  mapThreatToDimensionId
};
