'use client';

import { useId, useRef, useState } from 'react';
import { DEFAULT_THEME_CONFIG, fontFamilies, useTheme, type FontFamily, type ThemeConfig } from '@nexus/theme';
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, IconRenderer, Label, PageContainer, PageHeader, Select, ThemeControls, toast } from '@nexus/ui';
import { ContrastPanel } from './contrast-panel';
import { ThemePreview } from './theme-preview';
import { buildThemeExport, parseThemeImport } from './theme-io';

export function ThemeEditorPage() {
  const theme = useTheme();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  /** Preset first (it resets radius/density/motion/font), then the explicit overrides. */
  function apply(config: Partial<ThemeConfig>) {
    if (config.preset) theme.setPreset(config.preset);
    if (config.mode) theme.setMode(config.mode);
    if (config.density) theme.setDensity(config.density);
    if (config.motion) theme.setMotion(config.motion);
    if (config.radius) theme.setRadius(config.radius);
    if (config.fontFamily) theme.setFontFamily(config.fontFamily);
  }

  function exportTheme() {
    const blob = new Blob([buildThemeExport(theme.config)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-theme-${theme.config.preset}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Theme exported', { description: a.download });
  }

  async function importTheme(file: File) {
    setImportError(null);
    const result = parseThemeImport(await file.text(), theme.availablePresets.map((p) => p.id));
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    apply(result.config);
    toast.success('Theme imported', { description: result.ignored.length ? `Ignored: ${result.ignored.join(', ')}` : file.name });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Theme & Styling"
        description="Tune the look of the whole app. Changes apply instantly and are saved in this browser."
        actions={
          <>
            <Button variant="secondary" onClick={exportTheme}>
              <IconRenderer name="Download" className="size-4" /> Export
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <IconRenderer name="Upload" className="size-4" /> Import
            </Button>
            <input
              ref={fileRef}
              id={fileId}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-label="Import theme JSON file"
              data-testid="theme-import"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importTheme(file);
                e.target.value = '';
              }}
            />
          </>
        }
      />

      {importError && (
        <Alert variant="danger" title="Could not import theme">
          {importError}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Preset, color mode, density, motion and shape.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ThemeControls />
              <div className="space-y-1.5">
                <Label htmlFor={`${fileId}-font`}>Font</Label>
                <Select id={`${fileId}-font`} value={theme.fontFamily} onChange={(e) => theme.setFontFamily(e.target.value as FontFamily)}>
                  {Object.keys(fontFamilies).map((f) => <option key={f} value={f}>{f}</option>)}
                </Select>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  apply(DEFAULT_THEME_CONFIG);
                  setImportError(null);
                  toast.success('Theme reset to defaults');
                }}
              >
                <IconRenderer name="RotateCcw" className="size-4" /> Reset to defaults
              </Button>
            </CardContent>
          </Card>
          <ContrastPanel />
        </div>

        <section aria-labelledby="preview-heading" className="min-w-0 space-y-4">
          <div>
            <h2 id="preview-heading" className="text-base font-semibold text-text">Live preview</h2>
            <p className="text-sm text-text-muted">{theme.preset.description}</p>
          </div>
          <ThemePreview />
        </section>
      </div>
    </PageContainer>
  );
}
