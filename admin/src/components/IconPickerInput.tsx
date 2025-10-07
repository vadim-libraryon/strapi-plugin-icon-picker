// IconPickerInput.tsx
import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useIntl, MessageDescriptor, MessageFormatElement } from 'react-intl';
import {
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Typography,
  Box,
  TextInput,
} from '@strapi/design-system';
import styled from 'styled-components';
import { buildAutoIconOptions, mergeIconOptions } from '../registry/auto';

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
      useOverridesOnly?: boolean; // ignore auto and use only overrides
      grid?: boolean; // enable grid tiles (inline)
      gridColumns?: number; // columns when grid=true (default 3)
      search?: boolean; // NEW: show search input (both modes)
      dropdownPlaceholder?: string; // NEW
    };
  };
}

// --- intl helpers (unchanged) ---
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
const AUTO_REGISTRY = buildAutoIconOptions();

const IconBox = styled.span`
  width: ${SIZE}px;
  height: ${SIZE}px;
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

/* ---------- Grid Mode UI ---------- */

const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 130px; /* prevent infinite scroll feeling */
  overflow: auto;
  padding: 2px;
`;

const Tile = styled.button<{ $selected?: boolean }>`
  appearance: none;
  border: 1px solid
    ${(p) => (p.$selected ? 'var(--ds-primary600, #4945ff)' : 'var(--ds-neutral200, #dcdce4)')};
  background: ${(p) =>
    p.$selected ? 'var(--ds-primary100, #f0f0ff)' : 'var(--ds-neutral0, #fff)'};
  border-radius: 4px;
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;

  &:hover {
    border-color: var(--ds-primary600, #4945ff);
  }
  &:focus {
    outline: 2px solid var(--ds-primary600, #4945ff);
    outline-offset: 1px;
  }
`;

/* ---------- End Grid UI ---------- */

const IconOption: React.FC<{ slug: string; label: string; Icon?: React.ComponentType<any> }> = ({
  slug,
  label,
  Icon,
}) => (
  <SingleSelectOption value={slug}>
    <Flex alignItems="center" gap={2}>
      <IconBox>{Icon ? <Icon aria-hidden /> : null}</IconBox>
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
  const [query, setQuery] = useState('');

  const merged = useMemo(() => mergeIconOptions(AUTO_REGISTRY), []);

  const whitelist = attribute?.options?.iconList;
  const baseOptions = useMemo(() => {
    return Array.isArray(whitelist) && whitelist.length
      ? merged.filter((o) => whitelist.includes(o.slug))
      : merged;
  }, [merged, whitelist]);

  // text filter
  const q = query.trim().toLowerCase();
  const iconOptions = useMemo(() => {
    if (!q) return baseOptions;
    return baseOptions.filter(
      (o) => o.slug.toLowerCase().includes(q) || (o.label ?? o.slug).toLowerCase().includes(q)
    );
  }, [q, baseOptions]);

  const selected =
    iconOptions.find((o) => o.slug === value) ?? baseOptions.find((o) => o.slug === value);
  const handleChange = useCallback(
    (slug: string | null) => {
      onChange({ target: { name, value: slug, type: 'string' } });
    },
    [name, onChange]
  );

  const customizeValue = (slug?: string) => {
    if (!slug) {
      return formatMessage({ id: 'icon-picker.placeholder', defaultMessage: 'Select an icon' });
    }
    const opt = baseOptions.find((o) => o.slug === slug);
    const Icon = opt?.component;
    return (
      <Flex alignItems="center" gap={2}>
        <IconBox>{Icon ? <Icon aria-hidden /> : null}</IconBox>
        <Typography>{opt?.label ?? slug}</Typography>
      </Flex>
    );
  };

  const labelText =
    fmt(intlLabel) ?? formatMessage({ id: 'icon-picker.field.label', defaultMessage: 'Icon' });
  const hintText = fmt(description);

  const gridEnabled = Boolean(attribute?.options?.grid);
  const searchable = Boolean(attribute?.options?.search);

  // 2) inside component (top-level of IconPickerInput)
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // keep the selected tile in view when grid is shown or value changes
  useEffect(() => {
    if (!gridEnabled) return;
    const el = activeRef.current;
    const container = wrapRef.current;
    if (el && container) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [gridEnabled, value]);

  return (
    <Field.Root
      name={name}
      id={name}
      error={error || undefined}
      hint={hintText}
      required={required}
    >
      <Flex justifyContent="space-between" gap={4}>
        <Field.Label action={labelAction}>{labelText}</Field.Label>

        {gridEnabled && selected && (
          <Box paddingTop={1} paddingBottom={1}>
            <Flex alignItems="center" gap={2}>
              <IconBox>{selected.component ? <selected.component aria-hidden /> : null}</IconBox>
              <Typography variant="pi" textColor="neutral600">
                {selected.label}
              </Typography>
            </Flex>
          </Box>
        )}
      </Flex>

      {/* optional search input, works for BOTH grid and dropdown */}
      {searchable && (
        <Box paddingBottom={2}>
          <TextInput
            placeholder={formatMessage({
              id: 'icon-picker.search',
              defaultMessage: 'Search icons…',
            })}
            aria-label={formatMessage({
              id: 'icon-picker.search',
              defaultMessage: 'Search icons…',
            })}
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
          />
        </Box>
      )}

      {gridEnabled ? (
        // GRID MODE: tiles with internal scroll (max height), keyboard accessible
        <Box paddingTop={1}>
          <FlexWrap ref={wrapRef} role="listbox" aria-label={labelText}>
            {iconOptions.map(({ slug, label, component: Icon }) => {
              const isActive = slug === value;
              return (
                <Tile
                  key={slug}
                  ref={isActive ? (node) => (activeRef.current = node) : undefined}
                  type="button"
                  aria-pressed={isActive}
                  aria-selected={isActive}
                  aria-label={label}
                  title={label}
                  $selected={isActive}
                  onClick={() => handleChange(slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChange(slug);
                    }
                  }}
                >
                  <IconBox>{Icon ? <Icon aria-hidden /> : null}</IconBox>
                </Tile>
              );
            })}
          </FlexWrap>
        </Box>
      ) : (
        // DROPDOWN MODE: SingleSelect + filtered children (short list)
        <SingleSelect
          placeholder={
            attribute?.options?.dropdownPlaceholder ??
            formatMessage({ id: 'icon-picker.placeholder', defaultMessage: 'Select an icon' })
          }
          value={selected?.slug ?? ''}
          onChange={(slug: string | undefined) => handleChange(slug ?? null)}
          customizeContent={customizeValue}
        >
          {iconOptions.map(({ slug, label, component }) => (
            <IconOption key={slug} slug={slug} label={label} Icon={component} />
          ))}
        </SingleSelect>
      )}

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

export default React.memo(IconPickerInput);
