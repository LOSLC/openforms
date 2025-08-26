import React from 'react';
import { BaseFieldProps } from './types';
import {
  TextField,
  LongTextField,
  NumericalField,
  BooleanField,
  SelectField,
  MultiSelectField,
  EmailField,
  PhoneField,
  URLField,
  DateField,
  CurrencyField,
  AlphaField,
  AlphanumField
} from './fields';

interface FieldRendererProps extends BaseFieldProps {
  isTranslated?: boolean;
  mapOriginalToTranslated?: (fieldId: string, value: string) => string;
  mapTranslatedToOriginal?: (fieldId: string, value: string) => string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = (props) => {
  const { field } = props;

  switch (field.field_type) {
    case 'Text':
      return <TextField {...props} />;
    case 'LongText':
      return <LongTextField {...props} />;
    case 'Numerical':
      return <NumericalField {...props} />;
    case 'Boolean':
      return <BooleanField {...props} />;
    case 'Select':
      return <SelectField {...props} />;
    case 'Multiselect':
      return <MultiSelectField {...props} />;
    case 'Email':
      return <EmailField {...props} />;
    case 'Phone':
      return <PhoneField {...props} />;
    case 'URL':
      return <URLField {...props} />;
    case 'Date':
      return <DateField {...props} />;
    case 'Currency':
      return <CurrencyField {...props} />;
    case 'Alpha':
      return <AlphaField {...props} />;
    case 'Alphanum':
      return <AlphanumField {...props} />;
    default:
      return null;
  }
};
