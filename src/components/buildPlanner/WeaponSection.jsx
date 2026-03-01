import { useState } from 'react'
import { useBuild } from '../../context/BuildContext'
import WeaponSlot from './WeaponSlot'
import WeaponPicker from './WeaponPicker'
import WeaponTalentPicker from './WeaponTalentPicker'

const SLOT_NAMES = ['Arme Primaire', 'Arme Secondaire', 'Arme de Poing']

export default function WeaponSection({ data }) {
  const { weapons, weaponTalents } = useBuild()
  const [pickerOpen, setPickerOpen] = useState(null) // slot index or null
  const [talentPickerSlot, setTalentPickerSlot] = useState(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SLOT_NAMES.map((name, i) => (
          <WeaponSlot
            key={i}
            slotIndex={i}
            label={name}
            weapon={weapons[i]}
            talent={weaponTalents[i]}
            onSelect={() => setPickerOpen(i)}
            onSelectTalent={() => setTalentPickerSlot(i)}
          />
        ))}
      </div>

      {pickerOpen !== null && (
        <WeaponPicker
          data={data}
          slotIndex={pickerOpen}
          onClose={() => setPickerOpen(null)}
          onSelectTalent={(slot) => {
            setPickerOpen(null)
            setTimeout(() => setTalentPickerSlot(slot), 200)
          }}
        />
      )}

      {talentPickerSlot !== null && (
        <WeaponTalentPicker
          data={data}
          slotIndex={talentPickerSlot}
          onClose={() => setTalentPickerSlot(null)}
        />
      )}
    </>
  )
}

