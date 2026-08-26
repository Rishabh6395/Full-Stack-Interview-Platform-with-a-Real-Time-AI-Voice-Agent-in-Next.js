export type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'submit';

export interface FormField {
  id: string;
  type: FieldType;
  key: string;       // The data variable name used in JS rules (e.g., "clientEmail")
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface FormConfig {
  fields: FormField[];
  script: string;    // The custom validation rules
}