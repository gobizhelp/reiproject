"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, ArrowRight, ChevronDown } from "lucide-react";
import { parseCSV, autoMatchFields, type ParsedCSV, type ImportField } from "@/lib/csv-utils";

interface CSVFieldMapperProps {
  importFields: ImportField[];
  onImport: (mappedRows: Record<string, any>[]) => Promise<{ success: number; errors: string[] }>;
  entityName: string; // "properties" or "buyers"
}

type Step = "upload" | "map" | "preview" | "result";

export default function CSVFieldMapper({ importFields, onImport, entityName }: CSVFieldMapperProps) {
  const [step, setStep] = useState<Step>("upload");
  const [csv, setCsv] = useState<ParsedCSV | null>(null);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Please upload a CSV file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.headers.length === 0) {
          alert("CSV file appears to be empty.");
          return;
        }
        setCsv(parsed);
        setFileName(file.name);
        const autoMap = autoMatchFields(parsed.headers, importFields);
        setMapping(autoMap);
        setStep("map");
      };
      reader.readAsText(file);
    },
    [importFields]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const updateMapping = (csvHeader: string, fieldKey: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (fieldKey === "") {
        delete next[csvHeader];
      } else {
        // Remove any existing mapping to the same field
        for (const key of Object.keys(next)) {
          if (next[key] === fieldKey) {
            delete next[key];
          }
        }
        next[csvHeader] = fieldKey;
      }
      return next;
    });
  };

  const mappedFieldKeys = new Set(Object.values(mapping));
  const requiredFields = importFields.filter((f) => f.required);
  const missingRequired = requiredFields.filter((f) => !mappedFieldKeys.has(f.key));

  const handleStartImport = async () => {
    if (!csv) return;

    setImporting(true);
    // Build mapped rows
    const mappedRows: Record<string, any>[] = csv.rows.map((row) => {
      const mapped: Record<string, any> = {};
      for (const [csvHeader, fieldKey] of Object.entries(mapping)) {
        mapped[fieldKey] = row[csvHeader] ?? "";
      }
      return mapped;
    });

    const res = await onImport(mappedRows);
    setResult(res);
    setImporting(false);
    setStep("result");
  };

  const reset = () => {
    setStep("upload");
    setCsv(null);
    setFileName("");
    setMapping({});
    setResult(null);
  };

  // Group fields by section for the dropdown
  const fieldsBySection: Record<string, ImportField[]> = {};
  for (const field of importFields) {
    if (!fieldsBySection[field.section]) fieldsBySection[field.section] = [];
    fieldsBySection[field.section].push(field);
  }

  return (
    <div className="space-y-6">
      {/* Step: Upload */}
      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <Upload className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag &amp; drop your CSV file here
          </p>
          <p className="text-muted text-sm mb-6">
            or click to browse your files
          </p>
          <label className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors cursor-pointer">
            <FileSpreadsheet className="w-5 h-5" />
            Choose CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Step: Map Fields */}
      {step === "map" && csv && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Map CSV Columns</h2>
              <p className="text-muted text-sm mt-1">
                {fileName} &mdash; {csv.rowCount} row{csv.rowCount !== 1 ? "s" : ""} found.
                Match each CSV column to a {entityName.slice(0, -1)} field.
              </p>
            </div>
            <button onClick={reset} className="text-muted hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mapping table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 px-6 py-3 bg-card-hover border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
              <span>CSV Column</span>
              <span />
              <span>Maps To</span>
            </div>
            {csv.headers.map((header) => (
              <div
                key={header}
                className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 px-6 py-3 border-b border-border last:border-0"
              >
                <div>
                  <span className="font-medium text-sm">{header}</span>
                  <span className="text-muted text-xs block mt-0.5 truncate">
                    e.g. &quot;{csv.rows[0]?.[header] ?? ""}&quot;
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
                <div className="relative">
                  <select
                    value={mapping[header] ?? ""}
                    onChange={(e) => updateMapping(header, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm appearance-none pr-8"
                  >
                    <option value="">-- Skip this column --</option>
                    {Object.entries(fieldsBySection).map(([section, fields]) => (
                      <optgroup key={section} label={section}>
                        {fields.map((field) => {
                          const alreadyMapped = mappedFieldKeys.has(field.key) && mapping[header] !== field.key;
                          return (
                            <option key={field.key} value={field.key} disabled={alreadyMapped}>
                              {field.label}{field.required ? " *" : ""}{alreadyMapped ? " (already mapped)" : ""}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Required fields warning */}
          {missingRequired.length > 0 && (
            <div className="flex items-start gap-3 mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Required fields not mapped:</p>
                <p className="text-sm text-muted mt-1">
                  {missingRequired.map((f) => f.label).join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Summary & actions */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted">
              {Object.keys(mapping).length} of {csv.headers.length} columns mapped
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-accent/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("preview")}
                disabled={Object.keys(mapping).length === 0}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && csv && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Preview Import</h2>
              <p className="text-muted text-sm mt-1">
                Review the first 5 rows before importing {csv.rowCount} {entityName}.
              </p>
            </div>
            <button onClick={() => setStep("map")} className="text-sm text-accent hover:underline">
              Back to mapping
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card-hover">
                  <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase tracking-wider">#</th>
                  {Object.entries(mapping).map(([csvHeader, fieldKey]) => {
                    const field = importFields.find((f) => f.key === fieldKey);
                    return (
                      <th key={csvHeader} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider">
                        {field?.label ?? fieldKey}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {csv.rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted">{i + 1}</td>
                    {Object.entries(mapping).map(([csvHeader]) => (
                      <td key={csvHeader} className="px-4 py-3 max-w-[200px] truncate">
                        {row[csvHeader] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-start gap-3 mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm">
                Required fields missing: {missingRequired.map((f) => f.label).join(", ")}.
                Rows missing these values will be skipped.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setStep("map")}
              className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-accent/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleStartImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {importing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {csv.rowCount} {entityName}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {result.success > 0 ? (
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-success" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
          )}

          <h2 className="text-xl font-bold mb-2">Import Complete</h2>
          <p className="text-muted mb-4">
            Successfully imported {result.success} {entityName}.
            {result.errors.length > 0 && ` ${result.errors.length} row${result.errors.length !== 1 ? "s" : ""} had errors.`}
          </p>

          {result.errors.length > 0 && (
            <div className="text-left bg-background border border-border rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
              {result.errors.map((err, i) => (
                <p key={i} className="text-sm text-destructive py-1">
                  {err}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={reset}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  );
}
