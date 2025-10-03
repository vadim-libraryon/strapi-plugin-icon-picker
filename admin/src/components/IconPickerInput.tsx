import React, { useMemo } from 'react';
import { useIntl, MessageDescriptor, MessageFormatElement } from 'react-intl';
import { Field, Flex, SingleSelect, SingleSelectOption, Typography } from '@strapi/design-system';
import { buildAutoIconOptions, mergeIconOptions, type IconEntry } from '../registry/auto';
import styled from 'styled-components';

type IntlMessage = MessageDescriptor | string | undefined;

interface Props {
  name: string;
  value?: string | null; // slug
  onChange: (e: { target: { name: string; value: string | null; type?: string } }) => void;
  error?: string | null;
  description?: IntlMessage;
  required?: boolean;
  labelAction?: React.ReactNode;
  intlLabel?: IntlMessage;
  attribute?: {
    options?: {
      iconList?: string[]; // whitelist
      // if true, ignore auto and use only overrides
      useOverridesOnly?: boolean;
    };
  };
}

// --- intl helpers ---
const defaultMessageToString = (
  dm: string | MessageFormatElement[] | undefined
): string | undefined => {
  if (dm == null) return undefined;
  if (typeof dm === 'string') return dm;
  return dm
    .map((el: any) => (typeof el === 'string' ? el : el?.value != null ? String(el.value) : ''))
    .join('');
};
const useSafeFormatters = () => {
  const { formatMessage } = useIntl();
  const fmt = (msg: IntlMessage): string | undefined => {
    if (!msg) return undefined;
    if (typeof msg === 'string') return msg;
    if (!('id' in msg) || !msg.id) return defaultMessageToString(msg.defaultMessage);
    return formatMessage(msg as MessageDescriptor);
  };
  return { fmt, formatMessage };
};

const SIZE = 20;
const iconBoxStyle: React.CSSProperties = {
  width: SIZE,
  height: SIZE,
  display: 'inline-flex',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  lineHeight: 0,
};

const IconBoxStyle = styled.div`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  line-height: 0;

  svg {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
`;

const iconStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
};

const IconOption: React.FC<{ slug: string; label: string; Icon?: React.ComponentType<any> }> = ({
  slug,
  label,
  Icon,
}) => (
  <SingleSelectOption value={slug}>
    <Flex alignItems="center" gap={2}>
      <IconBoxStyle>{Icon ? <Icon aria-hidden /> : null}</IconBoxStyle>
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

  // 1) Build auto registry once (fast; done at import-time via eager globs)
  const auto = useMemo(buildAutoIconOptions, []);

  // 2) Merge with optional manual overrides (overrides win by slug)
  const merged = useMemo(
    () => mergeIconOptions(auto),
    [auto, attribute?.options?.useOverridesOnly]
  );

  // 3) Whitelist if provided
  const iconOptions = useMemo(() => {
    const list = attribute?.options?.iconList;
    return Array.isArray(list) && list.length
      ? merged.filter((o) => list.includes(o.slug))
      : merged;
  }, [merged, attribute]);

  const selected = iconOptions.find((o) => o.slug === value);

  const handleChange = (slug: string | null) => {
    onChange({ target: { name, value: slug, type: 'string' } });
  };

  const customizeValue = (slug?: string) => {
    if (!slug) {
      return formatMessage({ id: 'icon-picker.placeholder', defaultMessage: 'Select an icon' });
    }
    const opt = iconOptions.find((o) => o.slug === slug);
    const Icon = opt?.component;
    return (
      <Flex alignItems="center" gap={2}>
        <div style={iconBoxStyle}>
          {Icon ? <Icon aria-hidden width={SIZE} height={SIZE} style={iconStyle} /> : null}
        </div>
        <Typography>{opt?.label ?? slug}</Typography>
      </Flex>
    );
  };

  const labelText =
    fmt(intlLabel) ?? formatMessage({ id: 'icon-picker.field.label', defaultMessage: 'Icon' });
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
        value={selected?.slug ?? ''}
        onChange={(slug: string | undefined) => handleChange(slug ?? null)}
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
