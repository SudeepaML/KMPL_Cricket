/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Screen: Rules & Regulations of Fund.
 * Allows tournament admins to set, update, add, reorder, and publish
 * the official tournament rules shown to all players on the website.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/database';
import { FundRule, RuleCategory } from '../types';
import { RulesRegulationsModal } from '../components/RulesRegulationsModal';
import {
  ArrowLeft,
  ScrollText,
  Plus,
  Save,
  RotateCcw,
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
  Edit2,
  X,
} from 'lucide-react';

export const AdminRulesPage: React.FC = () => {
  const { currentAdmin, adminDisplayName } = useAuth();
  const { t, language } = useLanguage();
  const isKn = language === 'kn';

  const [rules, setRules] = useState<FundRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FundRule | null>(null);
  const [isNewRule, setIsNewRule] = useState(false);

  // Form state for rule edit/create
  const [formCategory, setFormCategory] = useState<RuleCategory>('general');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleKn, setFormTitleKn] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescKn, setFormDescKn] = useState('');
  const [formActive, setFormActive] = useState(true);

  const loadRules = async () => {
    setLoading(true);
    const data = await db.getRules();
    setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenAdd = () => {
    setIsNewRule(true);
    setFormCategory('contribution');
    setFormTitleEn('');
    setFormTitleKn('');
    setFormDescEn('');
    setFormDescKn('');
    setFormActive(true);
    setEditingRule({
      id: 'rule-' + Date.now(),
      order: rules.length + 1,
      category: 'contribution',
      title: '',
      title_kn: '',
      description: '',
      description_kn: '',
      is_active: true,
    });
  };

  const handleOpenEdit = (rule: FundRule) => {
    setIsNewRule(false);
    setEditingRule(rule);
    setFormCategory(rule.category);
    setFormTitleEn(rule.title);
    setFormTitleKn(rule.title_kn);
    setFormDescEn(rule.description);
    setFormDescKn(rule.description_kn);
    setFormActive(rule.is_active);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (!formTitleEn.trim() || !formDescEn.trim()) {
      alert('Please fill in the English title and description.');
      return;
    }

    const updatedRule: FundRule = {
      ...editingRule,
      category: formCategory,
      title: formTitleEn.trim(),
      title_kn: formTitleKn.trim() || formTitleEn.trim(),
      description: formDescEn.trim(),
      description_kn: formDescKn.trim() || formDescEn.trim(),
      is_active: formActive,
    };

    let newRulesList: FundRule[];
    if (isNewRule) {
      newRulesList = [...rules, updatedRule];
    } else {
      newRulesList = rules.map(r => r.id === updatedRule.id ? updatedRule : r);
    }

    await db.updateRules(newRulesList, adminDisplayName);
    setRules(newRulesList);
    setEditingRule(null);
    setSaveSuccess(isNewRule ? 'New rule added successfully!' : 'Rule updated successfully!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this rule?')) return;
    const newRulesList = rules.filter(r => r.id !== id);
    await db.updateRules(newRulesList, adminDisplayName);
    setRules(newRulesList);
    setSaveSuccess('Rule removed.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const reordered = [...rules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await db.updateRules(reordered, adminDisplayName);
    setRules(reordered);
    setSaveSuccess('Rules reordered successfully.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleResetDefaults = async () => {
    if (!confirm('Reset all rules back to the official KMPL tournament standard?')) return;
    await db.resetRulesToDefault();
    const defaults = await db.getRules();
    setRules(defaults);
    setSaveSuccess('Rules reset to official tournament standard.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>Preview Player View</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors shadow-2xs"
            title="Reset to default official tournament rules"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 rounded-3xl p-6 text-white shadow-xl mb-6 border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-emerald-950 uppercase">
                Admin Control
              </span>
              <span className="text-xs text-emerald-300 font-medium">
                Audited & Published Live
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Rules & Regulations of Fund
            </h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              Set and manage tournament fund policies, payment deadlines, and loan terms. Any changes made here are instantly displayed to all players across the website.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Rule</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            No rules found. Click "Add New Rule" or "Reset Defaults".
          </div>
        ) : (
          rules.map((rule, idx) => (
            <div
              key={rule.id}
              className={`p-4 rounded-3xl bg-white border transition-all ${
                rule.is_active ? 'border-slate-200 shadow-2xs' : 'border-slate-200 bg-slate-50/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === rules.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {rule.category}
                      </span>
                      {!rule.is_active && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                          Inactive (Draft)
                        </span>
                      )}
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {rule.title}
                      </h3>
                      {rule.title_kn && rule.title_kn !== rule.title && (
                        <span className="text-xs text-emerald-800 font-semibold font-sans">
                          · {rule.title_kn}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {rule.description}
                    </p>
                    {rule.description_kn && (
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        {rule.description_kn}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-black text-slate-900 text-base">
                {isNewRule ? 'Add Tournament Fund Rule' : 'Edit Fund Rule'}
              </h3>
              <button
                onClick={() => setEditingRule(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 overflow-y-auto flex-1 pr-1">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as RuleCategory)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-medium"
                >
                  <option value="contribution">Monthly Contribution (ದೇಣಿಗೆ)</option>
                  <option value="deadline">Payment Deadline (ಗಡುವು)</option>
                  <option value="loan">Baddi Chitti Loan (ಬಡ್ಡಿ ಚಿಟ್ಟಿ)</option>
                  <option value="accounting">Grand Total Accounting (ಲೆಕ್ಕಾಚಾರ)</option>
                  <option value="general">General Village Policy (ಸಾಮಾನ್ಯ)</option>
                </select>
              </div>

              {/* Title (English) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Monthly Contribution Tiers"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-medium"
                />
              </div>

              {/* Title (Kannada) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title (Kannada)
                </label>
                <input
                  type="text"
                  value={formTitleKn}
                  onChange={(e) => setFormTitleKn(e.target.value)}
                  placeholder="ಉದಾ: ಮಾಸಿಕ ದೇಣಿಗೆ ವರ್ಗಗಳು"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-medium"
                />
              </div>

              {/* Description (English) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Explanation (English) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  placeholder="Detail the rule for all tournament players..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-medium"
                />
              </div>

              {/* Description (Kannada) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Explanation (Kannada)
                </label>
                <textarea
                  rows={3}
                  value={formDescKn}
                  onChange={(e) => setFormDescKn(e.target.value)}
                  placeholder="ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ ನಮೂದಿಸಿ..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none font-medium"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Active (Display live on website to all players)
                </span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs min-h-[44px]"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player View Preview Modal */}
      <RulesRegulationsModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
