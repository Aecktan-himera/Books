import { useMemo, useState } from 'react';
import { Box, RadioGroup, FormControl, FormLabel, FormControlLabel, Radio, Select, MenuItem, Switch, SelectChangeEvent } from '@mui/material';
import useTranslation from '../hooks/useTranslation';
import { TextSettings } from '../types';

interface TextSettingsPanelProps {
  settings: TextSettings;
  onChange: (setting: keyof TextSettings, value: any) => void;
}

function TextSettingsPanel({ settings, onChange }: TextSettingsPanelProps) {
  const { t } = useTranslation();
  
  const handleChange = (
    event: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>, 
    setting: keyof TextSettings
  ) => {
    const value = event.target.value;
    onChange(setting, value);
  };

  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>, 
    setting: keyof TextSettings
  ) => {
    onChange(setting, event.target.checked);
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
      <FormControl>
        <FormLabel>{t("textColor")}:</FormLabel>
        <RadioGroup
          row
          value={settings.color}
          onChange={(e) => handleChange(e, 'color')}
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
          onChange={(e) => handleChange(e, 'size')}
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
              onChange={(e) => handleSwitchChange(e, 'bold')}
            />
          }
          label={t("bold")}
        />
      </FormControl>
    </Box>
  );
}

export default TextSettingsPanel;