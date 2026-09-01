import { useMemo, useRef, useState } from 'react';
import type { FormConfig, FormField, FieldType } from '../Types/form';
import './FormBuilder.css';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const fieldTemplates: Array<{
  type: FieldType;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    type: 'text',
    title: 'Text input',
    description: 'Names, emails, notes',
    icon: 'T',
  },
  {
    type: 'number',
    title: 'Number input',
    description: 'Quantities and scores',
    icon: '#',
  },
  {
    type: 'submit',
    title: 'Submit button',
    description: 'Finalize the form',
    icon: '->',
  },
];

export function FormBuilder() {
  const fieldIdCounter = useRef(0);
  const [formTitle, setFormTitle] = useState('My Custom Form');
  const [formConfig, setFormConfig] = useState<FormConfig>({
    fields: [],
    script:
      '// Write your business logic rules here\n// e.g., if (!data.text_1) { throw new Error("Field 1 is empty"); }',
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const selectedField = useMemo(
    () => formConfig.fields.find((field) => field.id === selectedFieldId),
    [formConfig.fields, selectedFieldId],
  );

  const addFieldToCanvas = (type: FieldType) => {
    const template = fieldTemplates.find((field) => field.type === type);
    fieldIdCounter.current += 1;

    const newField: FormField = {
      id: `${type}_${fieldIdCounter.current}`,
      type,
      key: `${type}_${fieldIdCounter.current}`,
      label: type === 'submit' ? 'Submit form' : template?.title ?? 'New field',
      required: false,
      placeholder: type === 'submit' ? undefined : 'Type your answer',
    };

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newField.id);
  };

  function updateFieldProperty<Key extends keyof FormField>(
    id: string,
    key: Key,
    value: FormField[Key],
  ) {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    }));
  }

  const removeSelectedField = () => {
    if (!selectedFieldId) {
      return;
    }

    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== selectedFieldId),
    }));
    setSelectedFieldId(null);
  };

  const duplicateSelectedField = () => {
    if (!selectedField) {
      return;
    }

    const clone: FormField = {
      ...selectedField,
      id: `${selectedField.type}_${fieldIdCounter.current + 1}`,
      label: `${selectedField.label} copy`,
    };
    fieldIdCounter.current += 1;

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, clone],
    }));
    setSelectedFieldId(clone.id);
  };

  const saveFormToBackend = async () => {
    setSaveStatus('saving');

    try {
      const response = await fetch('http://localhost:5000/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          config: formConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const result: unknown = await response.json();
      const savedId =
        typeof result === 'object' &&
        result !== null &&
        'data' in result &&
        typeof result.data === 'object' &&
        result.data !== null &&
        'id' in result.data
          ? String(result.data.id)
          : null;

      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 2200);

      if (savedId) {
        console.info(`Form saved with ID: ${savedId}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
    }
  };

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? 'Retry save'
          : 'Save';

  return (
    <main className="builder-shell">
      <header className="builder-topbar">
        <div className="brand-lockup">
          <span className="brand-mark">B</span>
          <div>
            <p className="eyebrow">Builder workspace</p>
            <input
              aria-label="Form title"
              className="title-input"
              type="text"
              value={formTitle}
              onChange={(event) => setFormTitle(event.target.value)}
            />
          </div>
        </div>

        <div className="topbar-actions">
          <span className={`save-state save-state--${saveStatus}`}>
            {saveStatus === 'error' ? 'Save failed' : `${formConfig.fields.length} fields`}
          </span>
          <button
            className="button button-primary"
            disabled={saveStatus === 'saving'}
            onClick={saveFormToBackend}
            type="button"
          >
            <span className="button-icon">S</span>
            {saveLabel}
          </button>
        </div>
      </header>

      <section className="builder-grid">
        <aside className="builder-panel palette-panel" aria-label="Component palette">
          <div className="panel-heading">
            <p className="eyebrow">Components</p>
            <h2>Palette</h2>
          </div>

          <div className="palette-list">
            {fieldTemplates.map((field) => (
              <button
                className="palette-item"
                key={field.type}
                onClick={() => addFieldToCanvas(field.type)}
                type="button"
              >
                <span className="tool-icon">{field.icon}</span>
                <span>
                  <strong>{field.title}</strong>
                  <small>{field.description}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="canvas-area" aria-label="Form canvas">
          <div className="canvas-toolbar">
            <div>
              <p className="eyebrow">Live preview</p>
              <h1>{formTitle || 'Untitled form'}</h1>
            </div>
            <span className="canvas-pill">{selectedField ? 'Editing' : 'Preview'}</span>
          </div>

          <div className="form-surface">
            {formConfig.fields.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">+</span>
                <h2>Start building your form</h2>
                <p>Select a component from the palette to place it on this canvas.</p>
              </div>
            ) : (
              <div className="field-stack">
                {formConfig.fields.map((field) => {
                  const isSelected = selectedFieldId === field.id;

                  return (
                    <button
                      className={`field-preview ${isSelected ? 'field-preview--selected' : ''}`}
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      type="button"
                    >
                      <span className="field-type">{field.type}</span>
                      {field.type !== 'submit' ? (
                        <span className="preview-control">
                          <span className="preview-label">
                            {field.label}
                            {field.required && <span className="required-mark">*</span>}
                          </span>
                          <input
                            disabled
                            placeholder={field.placeholder || 'Enter value'}
                            type={field.type}
                          />
                        </span>
                      ) : (
                        <span className="preview-submit">{field.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="builder-panel inspector-panel" aria-label="Field inspector">
          <div className="panel-heading">
            <p className="eyebrow">Inspector</p>
            <h2>{selectedField ? 'Field settings' : 'No selection'}</h2>
          </div>

          {selectedField ? (
            <div className="inspector-section">
              <label className="control-label" htmlFor="field-label">
                Label
              </label>
              <input
                className="control-input"
                id="field-label"
                type="text"
                value={selectedField.label}
                onChange={(event) =>
                  updateFieldProperty(selectedField.id, 'label', event.target.value)
                }
              />

              {selectedField.type !== 'submit' && (
                <>
                  <label className="control-label" htmlFor="field-placeholder">
                    Placeholder
                  </label>
                  <input
                    className="control-input"
                    id="field-placeholder"
                    type="text"
                    value={selectedField.placeholder || ''}
                    onChange={(event) =>
                      updateFieldProperty(selectedField.id, 'placeholder', event.target.value)
                    }
                  />

                  <label className="switch-row">
                    <input
                      checked={selectedField.required}
                      onChange={(event) =>
                        updateFieldProperty(selectedField.id, 'required', event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>Required field</span>
                  </label>
                </>
              )}

              <div className="inspector-actions">
                <button
                  className="button button-secondary"
                  onClick={duplicateSelectedField}
                  type="button"
                >
                  <span className="button-icon">D</span>
                  Duplicate
                </button>
                <button
                  className="button button-danger"
                  onClick={removeSelectedField}
                  type="button"
                >
                  <span className="button-icon">X</span>
                  Delete
                </button>
              </div>

              <p className="field-id">ID: {selectedField.id}</p>
            </div>
          ) : (
            <p className="muted-copy">
              Select a field on the canvas to adjust its label, placeholder, and validation.
            </p>
          )}

          <div className="script-panel">
            <div className="panel-heading compact">
              <p className="eyebrow">Rules</p>
              <h2>JavaScript</h2>
            </div>
            <textarea
              aria-label="Custom JavaScript rules"
              className="script-editor"
              value={formConfig.script}
              onChange={(event) =>
                setFormConfig((prev) => ({ ...prev, script: event.target.value }))
              }
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
