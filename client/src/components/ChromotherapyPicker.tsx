import React from 'react';

interface ChromotherapyPickerProps {
  currentTheme: string;
  onChange: (theme: string) => void;
}

export function ChromotherapyPicker({
  currentTheme,
  onChange
}: ChromotherapyPickerProps) {
  const themes = [
    { id: 'calm', gradient: 'bg-gradient-calm', label: 'Calmo' },
    { id: 'energy', gradient: 'bg-gradient-energy', label: 'Energia' },
    { id: 'cool', gradient: 'bg-gradient-cool', label: 'Frio' },
  ];

  return (
    <div className="flex gap-2" role="group" aria-label="Seletor de tema cromoterapico">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          className={`w-10 h-10 rounded-full ${theme.gradient} transition-all hover:scale-110 ${
            currentTheme === theme.id ? 'ring-2 ring-action-primary ring-offset-2' : ''
          }`}
          aria-label={`Tema ${theme.label}`}
          aria-pressed={currentTheme === theme.id}
          title={theme.label}
        />
      ))}
    </div>
  );
}

export default ChromotherapyPicker;
