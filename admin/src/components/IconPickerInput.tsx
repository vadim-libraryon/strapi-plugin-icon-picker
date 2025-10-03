import React, { useMemo } from 'react';
import { useIntl, MessageDescriptor, MessageFormatElement } from 'react-intl';
import { Field, Flex, SingleSelect, SingleSelectOption, Typography } from '@strapi/design-system';
import BookableSpace from '../icons/BookableSpace';
import FamilyHistory from '../icons/FamilyHistory';

type IntlMessage = MessageDescriptor | string | undefined;
type IconEntry = { slug: string; label: string; component?: React.ComponentType<any> };

interface Props {
  name: string;
  value?: string | null; // slug
  onChange: (e: { target: { name: string; value: string | null; type?: string } }) => void;
  error?: string | null;
  description?: IntlMessage;          // allow string/descriptor/undefined
  required?: boolean;
  labelAction?: React.ReactNode;
  intlLabel?: IntlMessage;            // allow string/descriptor/undefined
  attribute?: {
    options?: {
      iconList?: string[];            // whitelist
    };
  };
}

// ---- Built-in icons (MVP) ----
export const ICON_OPTIONS: IconEntry[] = [
  { slug: 'BookableSpace', label: 'BookableSpace', component: BookableSpace },
  { slug: 'FamilyHistory', label: 'FamilyHistory', component: FamilyHistory },
];

// Coerce a descriptor.defaultMessage (string or AST) into a plain string
const defaultMessageToString = (
  dm: string | MessageFormatElement[] | undefined
): string | undefined => {
  if (dm == null) return undefined;
  if (typeof dm === 'string') return dm;
  // best-effort stringify the AST (rarely used in our case)
  return dm
    .map((el: any) => {
      if (typeof el === 'string') return el;
      if (el && typeof el.value !== 'undefined') return String(el.value);
      return '';
    })
    .join('');
};

// Safe formatter that tolerates strings/undefined or descriptors without id
const useSafeFormatters = () => {
  const { formatMessage } = useIntl();
  const fmt = (msg: IntlMessage): string | undefined => {
    if (!msg) return undefined;
    if (typeof msg === 'string') return msg;
    if (!('id' in msg) || !msg.id) return defaultMessageToString(msg.defaultMessage);
    return formatMessage(msg as MessageDescriptor); // always returns string
  };
  return { fmt, formatMessage };
};

const IconOption: React.FC<{ slug: string; label: string; Icon?: React.ComponentType<any> }> = ({
  slug,
  label,
  Icon,
}) => (
  <SingleSelectOption value={slug}>
    <Flex alignItems="center" gap={2}>
      {Icon ? <Icon aria-hidden width={20} height={20} /> : null}
      <Typography>{label}</Typography>
    </Flex>
  </SingleSelectOption>
);

const IconPickerInput: React.FC<Props> = ({
  name,
  value,
  onChange,
  error,
  description,
  required,
  labelAction,
  intlLabel,
  attribute,
}) => {
  const { fmt, formatMessage } = useSafeFormatters();

  const iconOptions = useMemo(() => {
    const list = attribute?.options?.iconList;
    return Array.isArray(list) && list.length
      ? ICON_OPTIONS.filter((o) => list.includes(o.slug))
      : ICON_OPTIONS;
  }, [attribute]);

  const selected = iconOptions.find((o) => o.slug === value);

  const handleChange = (slug: string | null) => {
    onChange({ target: { name, value: slug, type: 'string' } });
  };

  const customizeValue = (slug?: string) => {
    if (!slug) {
      return formatMessage({ id: 'icon-picker.placeholder', defaultMessage: 'Select an icon' });
    }
    const opt = iconOptions.find((o) => o.slug === slug);
    return (
      <Flex alignItems="center" gap={2}>
        {opt?.component ? <opt.component aria-hidden width={20} height={20} /> : null}
        <Typography>{opt?.label ?? slug}</Typography>
      </Flex>
    );
  };

  // Safely compute label & hint with fallbacks
  const labelText =
    fmt(intlLabel) ??
    formatMessage({ id: 'icon-picker.field.label', defaultMessage: 'Icon' });

  const hintText = fmt(description);

  return (
    <Field.Root
      name={name}
      id={name}
      error={error || undefined}
      hint={hintText}
      required={required}
    >
      <Field.Label action={labelAction}>{labelText}</Field.Label>

      <SingleSelect
        placeholder={formatMessage({
          id: 'icon-picker.placeholder',
          defaultMessage: 'Select an icon',
        })}
        // clearLabel={formatMessage({ id: 'icon-picker.clear', defaultMessage: 'Clear icon' })}
        value={selected?.slug ?? ''}
        onChange={(slug: string | undefined) => handleChange(slug ?? null)}
        // onClear={() => handleChange(null)}
        customizeContent={customizeValue}
      >
        {iconOptions.map(({ slug, label, component }) => (
          <IconOption key={slug} slug={slug} label={label} Icon={component} />
        ))}
      </SingleSelect>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default IconPickerInput;
