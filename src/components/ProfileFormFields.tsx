import type { ProfileFormData } from '../types/profile';

interface ProfileFormFieldsProps {
  value: ProfileFormData;
  onChange: (changes: Partial<ProfileFormData>) => void;
}

const inputClass = 'mt-1 h-8 w-full rounded border border-slate-200 px-2 text-[10px] text-[#141414] outline-none focus:border-[#7b32ca]';

export function ProfileFormFields({ value, onChange }: ProfileFormFieldsProps) {
  function updateText(field: keyof ProfileFormData, nextValue: string) {
    onChange({ [field]: nextValue || null });
  }

  function updateUsername(nextValue: string) {
    const username = nextValue.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
    onChange({ username: username || null });
  }

  return (
    <>
      <h2 className="mb-3 text-[11px] font-semibold">Información personal</h2>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <TextField label="Nombre" value={value.first_name ?? ''} onChange={(next) => updateText('first_name', next)} />
        <TextField label="Apellido" value={value.last_name ?? ''} onChange={(next) => updateText('last_name', next)} />
        <TextField label="Username" value={value.username ?? ''} onChange={updateUsername} placeholder="ejemplo_01" />
      </div>
      <label className="mt-3 block text-[9px] text-[#676878]">
        Biografía
        <textarea className="mt-1 h-11 w-full resize-none rounded border border-slate-200 p-2 text-[10px] outline-none focus:border-[#7b32ca]" value={value.bio ?? ''} onChange={(event) => updateText('bio', event.target.value)} placeholder="Cuéntanos un poco sobre ti..." />
      </label>
      <h2 className="mb-3 mt-4 text-[11px] font-semibold">Información académica</h2>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <TextField label="Carrera" value={value.career ?? ''} onChange={(next) => updateText('career', next)} placeholder="Tu carrera" />
        <TextField label="Facultad" value={value.faculty ?? ''} onChange={(next) => updateText('faculty', next)} placeholder="Tu facultad" />
        <TextField label="Sede / Centro Regional" value={value.regional_center ?? ''} onChange={(next) => updateText('regional_center', next)} placeholder="Tu sede" />
      </div>
      <p className="mt-3 text-[9px] text-[#676878]">Los catálogos de distrito y provincia se habilitarán al crear esa sección de la base de datos.</p>
      <label className="mt-3 flex items-center gap-2 text-[9px] text-[#676878]">
        <input className="accent-[#7b32ca]" type="checkbox" checked={value.show_location} onChange={(event) => onChange({ show_location: event.target.checked })} />
        Mostrar mi ubicación en mi perfil público
      </label>
      <h2 className="mb-2 mt-4 text-[11px] font-semibold">Preferencia de identidad</h2>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <IdentityOption value="name" checked={value.identity_preference === 'name'} onChange={() => onChange({ identity_preference: 'name' })}>Mostrar mi nombre</IdentityOption>
        <IdentityOption value="username" checked={value.identity_preference === 'username'} onChange={() => onChange({ identity_preference: 'username' })}>Mostrar mi username</IdentityOption>
      </div>
    </>
  );
}

interface TextFieldProps { label: string; value: string; onChange: (value: string) => void; placeholder?: string; }

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return <label className="block text-[9px] text-[#676878]">{label}<input className={inputClass} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

interface IdentityOptionProps { value: string; checked: boolean; onChange: () => void; children: string; }

function IdentityOption({ value, checked, onChange, children }: IdentityOptionProps) {
  return <label className="text-[9px]"><input className="mr-2 accent-[#7b32ca]" type="radio" name="identity" value={value} checked={checked} onChange={onChange} />{children}</label>;
}
