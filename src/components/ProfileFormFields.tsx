import type { ProfileFormData } from '../types/profile';

interface ProfileFormFieldsProps {
  value: ProfileFormData;
  onChange: (changes: Partial<ProfileFormData>) => void;
  disabled?: boolean;
}

const inputClass = 'mt-1 h-10 w-full rounded border border-slate-200 px-3 text-[#141414] outline-none focus:border-[#7b32ca]';

export function ProfileFormFields({ value, onChange, disabled = false }: ProfileFormFieldsProps) {
  function updateText(field: keyof ProfileFormData, nextValue: string) {
    onChange({ [field]: nextValue || null });
  }

  function updateUsername(nextValue: string) {
    const username = nextValue.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30);
    onChange({ username: username || null });
  }

  return (
    <>
      <h2 className="mb-3 text-base font-semibold">Información personal</h2>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <TextField disabled={disabled} label="Nombre" value={value.first_name ?? ''} onChange={(next) => updateText('first_name', next)} />
        <TextField disabled={disabled} label="Apellido" value={value.last_name ?? ''} onChange={(next) => updateText('last_name', next)} />
        <TextField disabled={disabled} label="Username" value={value.username ?? ''} onChange={updateUsername} placeholder="ejemplo_01" />
      </div>
      <label className="mt-4 block text-sm text-[#676878]">
        Biografía
        <textarea className="mt-1 min-h-24 w-full resize-none rounded border border-slate-200 p-3 text-sm outline-none focus:border-[#7b32ca] disabled:bg-slate-50 disabled:text-slate-500" value={value.bio ?? ''} onChange={(event) => updateText('bio', event.target.value)} placeholder="Cuéntanos un poco sobre ti..." disabled={disabled} />
      </label>
      <h2 className="mb-3 mt-6 text-base font-semibold">Información académica</h2>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <TextField disabled={disabled} label="Carrera" value={value.career ?? ''} onChange={(next) => updateText('career', next)} placeholder="Tu carrera" />
        <TextField disabled={disabled} label="Facultad" value={value.faculty ?? ''} onChange={(next) => updateText('faculty', next)} placeholder="Tu facultad" />
        <TextField disabled={disabled} label="Sede / Centro Regional" value={value.regional_center ?? ''} onChange={(next) => updateText('regional_center', next)} placeholder="Tu sede" />
      </div>
      <p className="mt-4 text-sm text-[#676878]">Los catálogos de distrito y provincia se habilitarán al crear esa sección de la base de datos.</p>
      <label className="mt-4 flex items-center gap-2 text-sm text-[#676878]">
        <input className="accent-[#7b32ca]" type="checkbox" checked={value.show_location} onChange={(event) => onChange({ show_location: event.target.checked })} disabled={disabled} />
        Mostrar mi ubicación en mi perfil público
      </label>
      <h2 className="mb-2 mt-6 text-base font-semibold">Preferencia de identidad</h2>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <IdentityOption disabled={disabled} value="name" checked={value.identity_preference === 'name'} onChange={() => onChange({ identity_preference: 'name' })}>Mostrar mi nombre</IdentityOption>
        <IdentityOption disabled={disabled} value="username" checked={value.identity_preference === 'username'} onChange={() => onChange({ identity_preference: 'username' })}>Mostrar mi username</IdentityOption>
      </div>
    </>
  );
}

interface TextFieldProps { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; }

function TextField({ label, value, onChange, placeholder, disabled = false }: TextFieldProps) {
  return <label className="block text-sm text-[#676878]">{label}<input className={`${inputClass} text-sm disabled:bg-slate-50 disabled:text-slate-500`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} disabled={disabled} /></label>;
}

interface IdentityOptionProps { value: string; checked: boolean; onChange: () => void; children: string; disabled?: boolean; }

function IdentityOption({ value, checked, onChange, children, disabled = false }: IdentityOptionProps) {
  return <label className="text-sm"><input className="mr-2 accent-[#7b32ca]" type="radio" name="identity" value={value} checked={checked} onChange={onChange} disabled={disabled} />{children}</label>;
}
