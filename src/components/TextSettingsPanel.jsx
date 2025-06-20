import { useMemo, useState } from 'react';
import { Box, RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Select, MenuItem, Switch } from '@mui/material';
import useTranslation from '../hooks/useTranslation';

export default function TextSettingsPanel({ settings, onChange }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
      <FormControl>
        <FormLabel>{t("textColor")}:</FormLabel>
        <RadioGroup
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
        <FormLabel>{t("textSize")}:</FormLabel>
        <Select
          value={settings.size}
          onChange={(e) => onChange('size', e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="small">{t('small')}</MenuItem>
          <MenuItem value="medium">{t('medium')}</MenuItem>
          <MenuItem value="large">{t('large')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>{t("fontWeight")}:</FormLabel>
        <FormControlLabel
          control={
            <Switch
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