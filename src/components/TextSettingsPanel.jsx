import { useMemo, useState, useId } from 'react';
import { Box, RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Select, MenuItem, Switch } from '@mui/material';
import useTranslation from '../hooks/useTranslation';

export default function TextSettingsPanel({ settings, onChange }) {
  const { t } = useTranslation();

  const colorId = useId();
  const sizeId = useId();
  const fontWeightId = useId();

  return (
    <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
      <FormControl>
        <FormLabel htmlFor={colorId}>{t("textColor")}</FormLabel>
        <RadioGroup
          id={colorId}
          row
          value={settings.color}
          onChange={(e) => onChange('color', e.target.value)}
        >
          <FormControlLabel value="black" control={<Radio />} label={t("black")} />
          <FormControlLabel value="sepia" control={<Radio />} label={t("sepia")} />
          <FormControlLabel value="darkblue" control={<Radio />} label={t("darkblue")} />
        </RadioGroup>
      </FormControl>

      <FormControl>
        <FormLabel htmlFor={sizeId}>{t("textSize")}</FormLabel>
        <Select
          id={sizeId}
          value={settings.size}
          onChange={(e) => onChange('size', e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="small" id="size-small">{t('small')}</MenuItem>
          <MenuItem value="medium" id="size-medium">{t('medium')}</MenuItem>
          <MenuItem value="large" id="size-large">{t('large')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel htmlFor={fontWeightId}>{t("fontWeight")}</FormLabel>
        <FormControlLabel
          control={
            <Switch
              id={fontWeightId}
              checked={settings.bold}
              onChange={(e) => onChange('bold', e.target.checked)}
            />
          }
          label={t("bold")}
        />
      </FormControl>
    </Box>
  );
}