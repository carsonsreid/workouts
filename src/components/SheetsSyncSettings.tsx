import React, { useState } from 'react';
import { GoogleSheetsConfig, WorkoutLog } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, GoogleSheetsSyncService } from '../services/googleSheetsSync';
import { IconSheet, IconCheck, IconZap } from './Icons';

interface SheetsSyncSettingsProps {
  config: GoogleSheetsConfig;
  logs: WorkoutLog[];
  onSaveConfig: (updated: GoogleSheetsConfig) => void;
}

export const SheetsSyncSettings: React.FC<SheetsSyncSettingsProps> = ({ config, logs, onSaveConfig }) => {
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl);
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [testResult, setTestResult] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = () => {
    const updated: GoogleSheetsConfig = {
      sheetUrl,
      webhookUrl,
      autoSync,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: webhookUrl ? 'success' : 'idle',
    };
    onSaveConfig(updated);
    setTestResult('Configuration saved successfully!');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleExportCSV = () => {
    const csvContent = GoogleSheetsSyncService.exportLogsToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pulse_fit_workouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
          Google Sheets Database & Gmail Webhook Engine
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Connect your Google Sheet as a live database for workouts, routines, and automated Gmail motivation.
        </p>
      </div>

      {/* Sync Status Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: webhookUrl ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSheet size={24} color={webhookUrl ? 'var(--apple-green)' : 'var(--text-tertiary)'} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {webhookUrl ? 'Google Sheets Webhook Connected' : 'Google Sheets Webhook Pending Setup'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                {webhookUrl ? `Last synced: ${config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Just now'}` : 'Follow the step-by-step Apps Script guide below.'}
              </p>
            </div>
          </div>

          <button className="glass-button" onClick={handleExportCSV}>
            Export Database CSV
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Connection Settings</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Google Sheet URL
          </label>
          <input
            className="glass-input"
            placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Google Apps Script Webhook URL (POST Endpoint)
          </label>
          <input
            className="glass-input"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="autoSyncCheck"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="autoSyncCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
            Automatically sync workouts to Google Sheets upon completion
          </label>
        </div>

        {testResult && (
          <div style={{ fontSize: '0.88rem', color: 'var(--apple-green)', marginBottom: '16px' }}>
            {testResult}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="glass-button glass-button-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>

      {/* Step-by-step Apps Script Copy Section */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Google Apps Script Webhook Template</h3>
          <button className="glass-button glass-button-accent" onClick={handleCopyScript}>
            <IconCheck size={16} color="#fff" />
            <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          Copy this Google Apps Script, paste it into your Google Sheet's <strong>Extensions → Apps Script</strong> editor, and deploy as a Web App to enable live sync and Gmail notifications!
        </p>

        <pre
          style={{
            background: 'rgba(10, 12, 18, 0.8)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.82rem',
            color: 'var(--apple-cyan)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {GOOGLE_APPS_SCRIPT_TEMPLATE}
        </pre>
      </div>
    </div>
  );
};
